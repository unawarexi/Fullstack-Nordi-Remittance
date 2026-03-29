// ============================================================================
// FILE UPLOAD COMPONENT - Reusable file upload with preview
// ============================================================================

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@utils/cn";

export const FileUpload = ({
  id,
  label,
  accept = "image/*",
  description,
  error,
  onChange,
  value,
  required = false,
  maxSize = 5,
}: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isImage = value?.type.startsWith("image/") || preview;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {label}
        {required && <span className="ml-1 text-error-500">*</span>}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-4 transition-colors",
          dragActive
            ? "border-primary-500 bg-primary-50"
            : "border-neutral-300 hover:border-primary-400",
          error && "border-error-500 bg-error-50",
          (value || preview) && "border-success-500 bg-success-50",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        <AnimatePresence mode="wait">
          {preview || value ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4"
            >
              {isImage && preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
                  <FileText className="h-8 w-8 text-neutral-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {value?.name || "File selected"}
                </p>
                {value && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="rounded-full p-1.5 transition-colors hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4"
            >
              <Upload className="mb-2 h-10 w-10 text-neutral-400" />
              <p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
                <span className="font-medium text-primary-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              {description && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
