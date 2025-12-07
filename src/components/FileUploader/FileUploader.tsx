"use client";

import { useRef, useState, useCallback } from 'react';
import { useFileUploaderContext } from '@/contexts/FileUploaderContext';
import AttachmentIcon from '@/assets/icons/attachment.svg';
import ExportIcon from '@/assets/icons/export.svg';
import CloseIcon from '@/assets/icons/Close.svg';
import './FileUploader.scss';

interface FileUploaderProps {
  label?: string;
  required?: boolean;
  className?: string;
}

export function FileUploader({ 
  label = 'Upload Files',
  required = false,
  className = '',
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { files, loading, error, addFiles, removeFile, maxFiles } = useFileUploaderContext();

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    await addFiles(fileArray);
  }, [addFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // Reset input so same file can be selected again
    // Use setTimeout to ensure the change event completes first
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're actually leaving the dropzone (not just moving to a child element)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening if clicking on the input itself
    if (e.target === fileInputRef.current) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Stop propagation to prevent the dropzone click handler from firing
    e.stopPropagation();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
  };

  const isImage = (type: string): boolean => {
    return type.startsWith('image/');
  };

  return (
    <div className={`file-uploader ${className}`}>
      {label && (
        <label className="file-uploader-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          className={`file-uploader-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpeg,.jpg"
            onChange={handleInputChange}
            onClick={handleInputClick}
            className="file-uploader-input"
            disabled={loading}
          />
          <div className="file-uploader-dropzone-content">
            <p className="file-uploader-text">
              {isDragging ? (
                <span className="file-uploader-drag-text">Feel free to release</span>
              ) : (
                <>
                  <ExportIcon className="file-uploader-icon" />
                  <span className="file-uploader-link">Click here to </span>upload a PDF, PNG, JPEG file or drag and drop the file
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="file-uploader-error">
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="file-uploader-files">
          {files.map((file) => (
            <div key={file.id} className="file-uploader-file-item">
              {isImage(file.type) && file.previewUrl ? (
                <div className="file-uploader-file-preview">
                  <img src={file.previewUrl} alt={file.name} />
                </div>
              ) : (
                <div className="file-uploader-file-icon">
                  <AttachmentIcon />
                </div>
              )}
              <div className="file-uploader-file-info">
                <div className="file-uploader-file-name">{file.name}</div>
                <div className="file-uploader-file-size">{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                className="file-uploader-file-remove"
                onClick={() => removeFile(file.id)}
                disabled={loading}
                aria-label="Remove file"
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="file-uploader-loading">
          Uploading...
        </div>
      )}
    </div>
  );
}

