import React from 'react';
import VisaIcon from '@/assets/icons/visa.svg';

export const cardIcons = (type: string) => {
  switch (type.toLowerCase()) {
    case 'visa':
      return <VisaIcon />;
    default:
      return '💳';
  }
};

export const addAlphaToHex = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${clean}${a}`;
};