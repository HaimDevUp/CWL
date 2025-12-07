'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type PopupContent = React.ReactNode | null;

interface PopupOptions {
  onClose?: () => void;
  disableBackdropClose?: boolean;
  disableClose?: boolean;
  maxWidth?: number | string;
  isFooter?: boolean;
  backgroundColor?: string;
}

interface PopupContextValue {
  open: (content: PopupContent, options?: PopupOptions) => void;
  close: () => void;
  isOpen: boolean;
  content: PopupContent;
  options: Required<PopupOptions>;
}

const defaultOptions: Required<PopupOptions> = {
  onClose: () => undefined,
  disableBackdropClose: false,
  disableClose: false,
  maxWidth: 600,
  isFooter: false,
  backgroundColor: 'var(--color-global-white)',
};

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<PopupContent>(null);
  const [options, setOptions] = useState<Required<PopupOptions>>(defaultOptions);

  const open = useCallback((newContent: PopupContent, opts?: PopupOptions) => {
    setContent(newContent);
    setOptions(prev => ({ ...prev, ...opts }));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setContent(null);
    options.onClose?.();
    // reset to defaults to avoid leaking settings
    setOptions(defaultOptions);
  }, [options]);

  const value = useMemo<PopupContextValue>(() => ({ open, close, isOpen, content, options }), [open, close, isOpen, content, options]);

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
};

export function usePopup(): PopupContextValue {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
}


