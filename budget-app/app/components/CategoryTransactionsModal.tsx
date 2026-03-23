'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSpendingTransactions } from '@/app/db';
import type { SpendingTransaction } from '@/app/db/types';
import { ModalPortal } from '@/app/components/ModalPortal';
import { TransactionRowAmountStatus } from '@/app/components/TransactionRowAmountStatus';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';

/** Time only — category & budget month are clear from modal context. */
function formatTimeLine(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  categoryId: number;
  categoryName: string;
  categoryIcon?: string;
};

export default function CategoryTransactionsModal({
  isOpen,
  onClose,
  userId,
  categoryId,
  categoryName,
  categoryIcon = '📁',
}: Props) {
  const { formatCurrency } = useCurrency();
  const [items, setItems] = useState<SpendingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll(isOpen);

  const load = useCallback(async () => {
    if (!userId || !categoryId) return;
    setLoading(true);
    setError(null);
    try {
      const txs = await getSpendingTransactions(userId, { categoryId });
      setItems(txs);
    } catch (e) {
      console.error(e);
      setError('Could not load activity.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, categoryId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

  const safePad = {
    paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
    paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
    paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
    paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
  } as const;

  return (
    <ModalPortal role="dialog" aria-modal="true" aria-labelledby="category-tx-modal-title">
      {/* Full-viewport backdrop — padding must NOT be on this ancestor or gaps appear above blur */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={safePad}
      >
        <div
          className="pointer-events-auto relative z-10 flex w-full min-h-0 max-h-[min(32rem,85dvh)] max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:max-h-[min(36rem,80vh)]"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-2xl">
              <span aria-hidden>{categoryIcon}</span>
            </div>
            <div className="min-w-0">
              <h2 id="category-tx-modal-title" className="text-lg font-semibold text-foreground truncate">
                {categoryName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <svg
                  className="h-7 w-7 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="font-medium text-foreground">No pay activity yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                UPI pay attempts from the dashboard for this category will show here.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          )}

          {!loading && items.length > 0 && (
            <ul className="divide-y divide-border" aria-label="Category pay activity">
              {items.map((t) => (
                <li key={t.id ?? `${t.createdAt}-${t.amount}`} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 sm:gap-5">
                    <div className="min-w-0 flex-1 space-y-1.5 pr-1">
                      <p className="text-sm text-foreground">{formatTimeLine(t.createdAt)}</p>
                      {t.payeeName?.trim() ? (
                        <p className="text-xs font-medium text-muted-foreground">{t.payeeName.trim()}</p>
                      ) : null}
                      <p
                        className="break-all font-mono text-xs leading-snug text-muted-foreground"
                        title={t.upiId ?? undefined}
                      >
                        {t.upiId?.trim() ? t.upiId : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-muted-foreground/75">Budget</span>{' '}
                        <span className="text-foreground/85">{t.month}</span>
                        <span className="text-muted-foreground/35" aria-hidden>
                          {' · '}
                        </span>
                        <span className="text-foreground/85">{t.year}</span>
                      </p>
                    </div>
                    <div className="shrink-0 self-start pt-0.5 sm:pt-1">
                      <TransactionRowAmountStatus amountLabel={formatCurrency(t.amount)} status={t.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-5 py-4 sm:py-5">
          <Link
            href="/transactions"
            onClick={onClose}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Full transaction history
          </Link>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}
