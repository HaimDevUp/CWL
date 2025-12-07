import { useState, useEffect, useCallback } from 'react';
import {
  getAllFiles,
  saveFile,
  deleteFile,
  clearAllFiles,
  fileToBase64,
  base64ToBlobUrl,
  StoredFile,
} from '@/utils/indexedDBUtils';

export interface UploadedFile extends StoredFile {
  previewUrl?: string; // For images
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export function useFileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load files from IndexedDB on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const storedFiles = await getAllFiles();
      
      // Convert to UploadedFile format and create preview URLs for images
      const uploadedFiles: UploadedFile[] = storedFiles.map((file) => {
        const isImage = file.type.startsWith('image/');
        return {
          ...file,
          previewUrl: isImage ? base64ToBlobUrl(file.data, file.type) : undefined,
        };
      });

      setFiles(uploadedFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF, PNG, and JPEG files are allowed';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 2MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const addFiles = async (newFiles: File[]) => {
    try {
      setError(null);
      setLoading(true);

      // Check total file count
      if (files.length + newFiles.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed. You can add ${MAX_FILES - files.length} more file(s).`);
        setLoading(false);
        return;
      }

      // Validate all files
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          setLoading(false);
          return;
        }
      }

      // Process and save files
      const filesToAdd: UploadedFile[] = [];

      for (const file of newFiles) {
        const base64Data = await fileToBase64(file);
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const storedFile: StoredFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          uploadedAt: Date.now(),
        };

        await saveFile(storedFile);

        const isImage = file.type.startsWith('image/');
        const uploadedFile: UploadedFile = {
          ...storedFile,
          previewUrl: isImage ? base64ToBlobUrl(base64Data, file.type) : undefined,
        };

        filesToAdd.push(uploadedFile);
      }

      setFiles((prev) => [...prev, ...filesToAdd]);
    } catch (err) {
      console.error('Error adding files:', err);
      setError('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (id: string) => {
    try {
      setError(null);
      await deleteFile(id);
      
      // Revoke blob URL if it exists
      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Error removing file:', err);
      setError('Failed to remove file');
    }
  };

  const clearFiles = async () => {
    try {
      setError(null);
      
      // Revoke all blob URLs
      files.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

      await clearAllFiles();
      setFiles([]);
    } catch (err) {
      console.error('Error clearing files:', err);
      setError('Failed to clear files');
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  return {
    files,
    loading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    reloadFiles: loadFiles,
    maxFiles: MAX_FILES,
    maxFileSize: MAX_FILE_SIZE,
  };
}

