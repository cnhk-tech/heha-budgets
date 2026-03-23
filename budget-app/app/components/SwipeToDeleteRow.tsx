'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

const DELETE_ZONE_PX = 88;
const OPEN_THRESHOLD = DELETE_ZONE_PX * 0.35;
const AXIS_LOCK_PX = 12;
const DRAG_CLICK_SUPPRESS_PX = 8;

type SwipeToDeleteRowProps = {
  /** Opens delete confirmation when swipe passes threshold */
  onDeleteRequest: () => void;
  deleteDisabled?: boolean;
  children: ReactNode;
};

/**
 * Swipe/drag left past the threshold to open delete confirmation (no second tap).
 * touch-action: pan-y keeps vertical list scrolling natural.
 */
export function SwipeToDeleteRow({ onDeleteRequest, deleteDisabled = false, children }: SwipeToDeleteRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef(0);
  const startRef = useRef({ x: 0, y: 0, offset: 0 });
  const axisRef = useRef<'none' | 'h' | 'v'>('none');
  const maxHorizRef = useRef(0);
  const suppressClickRef = useRef(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const pointerActiveRef = useRef(false);

  const clamp = useCallback((v: number) => Math.min(0, Math.max(-DELETE_ZONE_PX, v)), []);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const settle = useCallback(
    (final: number) => {
      const o = clamp(final);
      if (o <= -OPEN_THRESHOLD && !deleteDisabled) {
        onDeleteRequest();
      }
      setOffset(0);
      offsetRef.current = 0;
    },
    [clamp, deleteDisabled, onDeleteRequest]
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (deleteDisabled || e.button !== 0) return;
    const el = frontRef.current;
    if (!el) return;
    pointerActiveRef.current = true;
    setIsDragging(true);
    axisRef.current = 'none';
    maxHorizRef.current = 0;
    suppressClickRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, offset: offsetRef.current };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActiveRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (axisRef.current === 'none') {
      if (Math.hypot(dx, dy) < AXIS_LOCK_PX) return;
      axisRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }

    if (axisRef.current === 'v') {
      return;
    }

    maxHorizRef.current = Math.max(maxHorizRef.current, Math.abs(dx));
    const next = clamp(startRef.current.offset + dx);
    setOffset(next);
    offsetRef.current = next;
  };

  const finishPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActiveRef.current) return;
    const el = frontRef.current;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerActiveRef.current = false;
    setIsDragging(false);

    if (axisRef.current === 'v') {
      setOffset(0);
      offsetRef.current = 0;
      axisRef.current = 'none';
      return;
    }

    if (maxHorizRef.current > DRAG_CLICK_SUPPRESS_PX) {
      suppressClickRef.current = true;
    }

    settle(offsetRef.current);
    axisRef.current = 'none';
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    finishPointer(e);
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    finishPointer(e);
  };

  const onContentClick = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  return (
    <li className="relative isolate overflow-hidden">
      {/* Visual affordance only while dragging — confirmation opens on release past threshold */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 flex items-center justify-center bg-red-600 dark:bg-red-700"
        style={{ width: DELETE_ZONE_PX }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white/90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>

      <div
        ref={frontRef}
        role="presentation"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onContentClick}
        style={{
          transform: `translate3d(${offset}px,0,0)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          touchAction: 'pan-y',
        }}
        className="tx-row-surface relative z-10 cursor-grab bg-card py-4 sm:py-5 active:cursor-grabbing"
      >
        {children}
      </div>
    </li>
  );
}
