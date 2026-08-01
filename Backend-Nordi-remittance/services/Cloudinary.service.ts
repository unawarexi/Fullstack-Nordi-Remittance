import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";
import * as dotenv from "dotenv";
import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import {
  extensionToMimeType,
  allowedExtensions,
} from "@core/utils/extentions.js";
import path from "path";
import { CloudinaryUploadResult } from "../types/index.js";

// Load environment variables
dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure multer for memory storage (no local files)
const storage = multer.memoryStorage();

// Enhanced file filter for all media types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allAllowedExtensions = Object.values(allowedExtensions).flat();
  const allowedMimeTypes = Object.values(extensionToMimeType);

  // Check if extension is valid
  const isExtensionValid = allAllowedExtensions.includes(fileExtension);

  if (!isExtensionValid) {
    cb(
      new Error(
        `Invalid file extension: ${fileExtension}. Please upload a supported file type.`,
      ),
    );
    return;
  }

  // Check MIME type with fallback for application/octet-stream
  const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);
  const isGenericMimeType = file.mimetype === "application/octet-stream";
  const expectedMimeType = extensionToMimeType[fileExtension];

  if (isMimeTypeValid || (isGenericMimeType && expectedMimeType)) {
    // Correct MIME type if it's generic but valid extension
    if (isGenericMimeType && expectedMimeType) {
      file.mimetype = expectedMimeType;
    }
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Received: ${file.mimetype} (${fileExtension}). Expected: ${expectedMimeType || "valid file MIME type"}.`,
      ),
    );
  }
};

// Initialize multer upload with memory storage
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

// Multer error handler middleware
export function multerErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too large. Maximum size is 20MB.",
      });
    }
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
  next();
}

const getResourceType = (
  filename: string,
): "image" | "video" | "raw" | "auto" => {
  const ext = filename.toLowerCase().split(".").pop();

  if (allowedExtensions.images.includes(ext)) return "image";
  if (allowedExtensions.videos.includes(ext)) return "video";
  if (allowedExtensions.audio.includes(ext)) return "video"; // Cloudinary treats audio as video resource type
  return "raw"; // For documents and other files
};

// ============================================================================
// UPLOAD TIMEOUT BUDGET (prevents indefinite hangs to external service)
// ============================================================================

const UPLOAD_TIMEOUT_MS = 30_000; // 30 seconds per file

//Upload file buffer directly to Cloudinary (with timeout budget)
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "projects/banking",
): Promise<CloudinaryUploadResult> => {
  const resourceType = getResourceType(originalName);
  const fileName = originalName.split(".").slice(0, -1).join(".");

  const uploadOptions: UploadApiOptions = {
    folder: folder,
    resource_type: resourceType,
    public_id: `${fileName}_${Date.now()}`,
    use_filename: true,
    unique_filename: true,
    timeout: UPLOAD_TIMEOUT_MS,
  };

  // Add transformations for images and videos
  if (resourceType === "image") {
    uploadOptions.transformation = [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ];
  } else if (resourceType === "video") {
    uploadOptions.transformation = [
      { quality: "auto" },
      { fetch_format: "auto" },
    ];
  }

  // Upload buffer directly to Cloudinary, wrapped in a timeout budget
  const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(fileBuffer);
  });

  // Race against timeout to prevent indefinite hangs
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new Error(
          `Cloudinary upload timed out after ${UPLOAD_TIMEOUT_MS}ms for "${originalName}"`,
        ),
      );
    }, UPLOAD_TIMEOUT_MS);
  });

  let result: UploadApiResponse;
  try {
    result = await Promise.race([uploadPromise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }

  // Validate that we got a secure_url
  if (!result.secure_url) {
    throw new Error("Cloudinary upload succeeded but no secure_url returned");
  }

  // Return comprehensive file information
  return {
    url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    duration: result.duration, // For video/audio files
    original_filename: result.original_filename,
    created_at: result.created_at,
    type: resourceType,
    filename: originalName,
  };
};

// ============================================================================
// SAFE UPLOAD — never throws; returns null on failure
// For use in flows where upload failure should NOT block the business operation
// ============================================================================

export const safeUploadToCloudinary = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "projects/banking",
): Promise<CloudinaryUploadResult | null> => {
  try {
    return await uploadToCloudinary(fileBuffer, originalName, folder);
  } catch (error) {
    console.error(
      `Cloudinary safe upload failed for "${originalName}" (non-fatal):`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};

// ============================================================================
// CLEANUP — remove uploaded assets on transaction rollback
// Fire-and-forget: logs errors but never throws
// ============================================================================

export const cleanupCloudinaryAssets = async (
  publicIds: string[],
): Promise<void> => {
  const idsToDelete = publicIds.filter(Boolean);
  if (idsToDelete.length === 0) return;

  for (const publicId of idsToDelete) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(
        `Failed to clean up Cloudinary asset "${publicId}" (orphaned):`,
        error instanceof Error ? error.message : error,
      );
    }
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image",
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export const getOptimizedFileUrl = (
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image",
  transformations: any[] = [],
): string => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    ...transformations,
    secure: true,
    quality: "auto",
    fetch_format: "auto",
  });
};

export const getFileMetadata = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image",
) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw error;
  }
};

