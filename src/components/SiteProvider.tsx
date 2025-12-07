'use client';

import { useSiteColors } from '@/hooks/useSiteColors';
import { FontLoader } from './FontLoader';

interface SiteProviderProps {
  children: React.ReactNode;
}

export const SiteProvider: React.FC<SiteProviderProps> = ({ children }) => {
  // This will update CSS custom properties for the entire site
  useSiteColors();
  
  return (
    <>
      <FontLoader />
      {children}
    </>
  );
};
