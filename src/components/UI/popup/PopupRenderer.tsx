'use client';

import React from 'react';
import { Popup } from './Popup';
import { usePopup } from '@/contexts/PopupContext';

export function PopupRenderer() {
  const { isOpen, close, content, options } = usePopup();
  return (
    <Popup
      isOpen={isOpen}
      onClose={close}
      disableBackdropClose={options.disableBackdropClose}
      disableClose={options.disableClose}
      maxWidth={options.maxWidth}
      isFooter={options.isFooter}
      backgroundColor={options.backgroundColor}
    >
      {content}
    </Popup>
  );
}


