import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const AttachmentSchema: Schema = new Schema({
  attachmentId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: "Users" },
  relatedEntity: { type: String, required: true },
  relatedEntityId: { type: String, required: true },
  filename: { type: String, required: true },
  originalFilename: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileExtension: { type: String, required: true },
  fileUrl: { type: String, required: true },
  storagePath: { type: String, required: true },
  storageProvider: {
    type: String,
    enum: ["s3", "cloudinary", "azure_blob", "gcs", "local"],
    required: true,
  },
  category: {
    type: String,
    enum: [
      "kyc",
      "proof_of_address",
      "income_document",
      "bank_statement",
      "dispute_evidence",
      "loan_document",
      "tax_document",
      "profile_picture",
      "signature",
      "other",
    ],
    required: true,
  },
  isPublic: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  tags: [{ type: String }],
  metadata: { type: Schema.Types.Mixed },
  expiresAt: { type: Date },
  deletedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date },
  accessCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
AttachmentSchema.index({ user: 1, category: 1 });
AttachmentSchema.index({ relatedEntity: 1, relatedEntityId: 1 });
AttachmentSchema.index({ isDeleted: 1, expiresAt: 1 });

const Attachments = mongoose.model("Attachments", AttachmentSchema);
export default Attachments;
