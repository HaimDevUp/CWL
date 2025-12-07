"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useFileUploader, UploadedFile } from '@/hooks/useFileUploader';

interface FileUploaderContextType {
  files: UploadedFile[];
  loading: boolean;
  error: string | null;
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  clearFiles: () => Promise<void>;
  reloadFiles: () => Promise<void>;
  maxFiles: number;
  maxFileSize: number;
}

const FileUploaderContext = createContext<FileUploaderContextType | undefined>(undefined);

export function FileUploaderProvider({ children }: { children: ReactNode }) {
  const fileUploader = useFileUploader();

  return (
    <FileUploaderContext.Provider value={fileUploader}>
      {children}
    </FileUploaderContext.Provider>
  );
}

export function useFileUploaderContext() {
  const context = useContext(FileUploaderContext);
  if (context === undefined) {
    throw new Error('useFileUploaderContext must be used within a FileUploaderProvider');
  }
  return context;
}

