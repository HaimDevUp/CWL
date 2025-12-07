'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './Popup.scss';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  disableBackdropClose?: boolean;
  disableClose?: boolean;
  maxWidth?: number | string;
  backgroundColor?: string;
  isFooter?: boolean;
}

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children, disableBackdropClose, disableClose, maxWidth, backgroundColor, isFooter }) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    const htmlEl = document.documentElement;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    // const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    // if (scrollbarWidth > 0) {
    //   document.body.style.paddingRight = `${scrollbarWidth}px`;
    // }
    document.body.style.overflow = 'hidden';
    htmlEl.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prevBodyOverflow;
      htmlEl.style.overflow = prevHtmlOverflow;
      // document.body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [isOpen, onClose]);

  const modalStyle = useMemo(() => ({
    ...styles.modal,
    maxWidth: (isMobile || isFooter) ? '100vw' : (maxWidth || styles.modal.maxWidth),
    width: isMobile ? '100vw' : styles.modal.width,
    borderRadius: (isMobile || isFooter) ? 0 : styles.modal.borderRadius,
    backgroundColor: backgroundColor || styles.modal.backgroundColor,
  }), [isMobile, maxWidth, isFooter, backgroundColor]);

  const backdropStyle = useMemo(() => ({
    ...styles.backdrop,
    padding: isMobile ? 0 : styles.backdrop.padding,
    alignItems: (isMobile || isFooter) ? 'flex-end' : styles.backdrop.alignItems,
  }), [isMobile, isFooter]);

  const buttonStyle = useMemo(() => ({
    ...styles.closeBtn,
    display: isFooter ? 'none' : 'block',
  }), [isFooter]);

  const content = (
    <div aria-modal="true" role="dialog" style={backdropStyle} onClick={() => { if (!disableBackdropClose && !disableClose) onClose(); }}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {!disableClose && <button type="button" onClick={onClose} style={buttonStyle} aria-label="Close">×</button>}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );

  if (!isOpen || !containerRef.current) return null;

  return createPortal(content, containerRef.current);
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#00000033',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    position: 'relative',
    backgroundColor: 'var(--color-global-white)',
    borderRadius: 24,
    padding: '3.2rem 2.4rem',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 8,
    fontSize: 24,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 1,
  },
};

export default Popup;


