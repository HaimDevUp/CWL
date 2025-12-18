'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const DynamicTitle = () => {
  const { general } = useSiteSettings();

  useEffect(() => {
    if (general?.site_title) {
      document.title = general.site_title;
    }
  }, [general?.site_title]);

  return null;
};

