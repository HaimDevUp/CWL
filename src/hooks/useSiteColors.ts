import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

export const useSiteColors = () => {
  const { general } = useSiteSettings();
  const { colors, site_font } = general;

  useEffect(() => {
    // Update CSS custom properties with current colors and font
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-global-glow', colors.globalGlow);
    root.style.setProperty('--color-global-black', colors.globalBlack);
    root.style.setProperty('--color-global-white', colors.globalWhite);
    root.style.setProperty('--color-global-stroke', colors.globalStroke);
    root.style.setProperty('--color-global-gray', colors.globalGray);
    root.style.setProperty('--color-global-gray-background', colors.globalGrayBackground);
    root.style.setProperty('--color-global-green', colors.globalGreen);
    root.style.setProperty('--color-global-purple', colors.globalPurple);
    root.style.setProperty('--color-global-yellow', colors.globalYellow);
    root.style.setProperty('--color-global-blue', colors.globalBlue);
    root.style.setProperty('--color-global-orange', colors.globalOrange);
    root.style.setProperty('--color-global-red', colors.globalRed);
    root.style.setProperty('--color-state-error', colors.stateError);
    root.style.setProperty('--color-state-success', colors.stateSuccess);
    root.style.setProperty('--color-state-warning', colors.stateWarning);
    root.style.setProperty('--color-state-link', colors.stateLink);
    root.style.setProperty('--color-global-table-header', colors.globalTableHeader);
    
    // Font - extract font family from Google Fonts URL
    const fontFamily = extractFontFamilyFromUrl(site_font);
    if (fontFamily) {
      root.style.setProperty('--font-family-primary', fontFamily);
    }
  }, [colors, site_font]);

  return { colors, site_font };
};

// Helper function to extract font family from Google Fonts URL
const extractFontFamilyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const family = urlObj.searchParams.get('family');
    if (family) {
      // Extract the first font family from the URL
      const firstFont = family.split('&')[0];
      return `'${firstFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;
    }
  } catch (error) {
    console.warn('Invalid font URL:', url);
  }
  return null;
};
