'use client';

import { useEffect } from 'react';

/**
 * When lock is true, disables scrolling on document.body (e.g. while a modal is open).
 * Restores the previous overflow on unlock or unmount.
 */
export function useLockBodyScroll(lock: boolean): void {
  useEffect(() => {
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lock]);
}
