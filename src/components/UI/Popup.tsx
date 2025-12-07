'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  disableBackdropClose?: boolean;
}

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children, disableBackdropClose }) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let el = document.getElementById('popup-root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'popup-root';
      document.body.appendChild(el);
    }
    containerRef.current = el;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !containerRef.current) return null;

  const content = (
    <div aria-modal="true" role="dialog" style={styles.backdrop} onClick={() => { if (!disableBackdropClose) onClose(); }}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">×</button>
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );

  return createPortal(content, containerRef.current);
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    right: 24,
    top: 24,
    fontSize: 24,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 1,
  },
  content: {
    padding: 24,
  },
};

export default Popup;


