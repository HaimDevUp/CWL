'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const FontLoader: React.FC = () => {
  const { general } = useSiteSettings();
  const { site_font } = general;

  useEffect(() => {
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href="${site_font}"]`);
    
    if (!existingLink) {
      // Create link element for Google Fonts
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = site_font;
      link.crossOrigin = 'anonymous';
      
      // Add to head
      document.head.appendChild(link);
    }
  }, [site_font]);

  return null; // This component doesn't render anything
};
