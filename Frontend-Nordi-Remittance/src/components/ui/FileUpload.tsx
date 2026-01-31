// ============================================================================
// FILE UPLOAD COMPONENT - Reusable file upload with preview
// ============================================================================

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@utils/cn';

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  description?: string;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  required?: boolean;
  maxSize?: number; // in MB
}

export const FileUpload = ({
  id,
  label,
  accept = 'image/*',
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
    if (file.type.startsWith('image/')) {
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
      inputRef.current.value = '';
    }
  };

  const isImage = value?.type.startsWith('image/') || preview;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400',
          error && 'border-error-500 bg-error-50',
          (value || preview) && 'border-success-500 bg-success-50'
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
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {value?.name || 'File selected'}
                </p>
                {value && (
                  <p className="text-xs text-neutral-500">
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
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4"
            >
              <Upload className="w-10 h-10 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600 text-center">
                <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
              </p>
              {description && (
                <p className="text-xs text-neutral-500 mt-1">{description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-error-500">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
