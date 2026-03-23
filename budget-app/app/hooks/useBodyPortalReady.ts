'use client';

import { useLayoutEffect, useState } from 'react';

/** True after mount so `createPortal(..., document.body)` is safe (avoids SSR/hydration issues). */
export function useBodyPortalReady(): boolean {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
