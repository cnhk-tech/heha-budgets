'use client';

import { createPortal } from 'react-dom';
import type { HTMLAttributes, ReactNode } from 'react';
import { useBodyPortalReady } from '@/app/hooks/useBodyPortalReady';

export type ModalPortalProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: ReactNode;
};

/**
 * Renders modal UI into `document.body` with z-index above the app header (`z-50`).
 * Descendants inside `<main>` cannot stack above a fixed header without this.
 */
export function ModalPortal({ children, className, ...props }: ModalPortalProps) {
  const ready = useBodyPortalReady();
  if (!ready) return null;

  const merged = ['fixed inset-0 z-[100]', className].filter(Boolean).join(' ');

  return createPortal(
    <div className={merged} {...props}>
      {children}
    </div>,
    document.body
  );
}
