'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { getCategories, getSpendingTransactions, removeSpendingTransaction } from '@/app/db';
import { ModalPortal } from '@/app/components/ModalPortal';
import { SwipeToDeleteRow } from '@/app/components/SwipeToDeleteRow';
import { TransactionRowAmountStatus } from '@/app/components/TransactionRowAmountStatus';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import type { Category, SpendingTransaction } from '@/app/db/types';

/** Compact time — matches category activity modal. */
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

export default function TransactionsPage() {
  const { user } = useUser();
  const { formatCurrency } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<SpendingTransaction[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<SpendingTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showBudgetNotice, setShowBudgetNotice] = useState(false);

  useLockBodyScroll(!!confirmDelete);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cats, txs] = await Promise.all([
        getCategories(user.id) as Promise<Category[]>,
        getSpendingTransactions(
          user.id,
          filterCategoryId === 'all' ? undefined : { categoryId: filterCategoryId }
        ),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      console.error(e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user, filterCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryMeta = useMemo(() => {
    const nameMap = new Map(categories.map((c) => [c.id, c.name]));
    const iconMap = new Map(categories.map((c) => [c.id, c.icon]));
    return {
      name: (id: number, fallback: string) => nameMap.get(id) ?? fallback,
      icon: (id: number) => iconMap.get(id) ?? '📁',
    };
  }, [categories]);

  const openDelete = (t: SpendingTransaction) => {
    setDeleteError(null);
    setConfirmDelete(t);
  };

  const handleConfirmDelete = async () => {
    if (!user || !confirmDelete?.id) return;
    setDeleteError(null);
    setDeletingId(confirmDelete.id);
    try {
      await removeSpendingTransaction(user.id, confirmDelete.id);
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return null;

  const filterSummary =
    filterCategoryId === 'all'
      ? 'All categories'
      : `${categoryMeta.icon(filterCategoryId)} ${categoryMeta.name(filterCategoryId, 'Category')}`;

  return (
    <div className="w-full min-w-0 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pt-2 sm:pb-0 sm:pl-5 sm:pr-5 sm:pt-0 md:px-0 md:pb-0">
      <div className="mx-auto w-full max-w-lg lg:max-w-2xl xl:max-w-3xl">
        <section
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          aria-labelledby="tx-page-title"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border py-4 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:py-5 sm:pl-6 sm:pr-6">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-xl sm:h-12 sm:w-12 sm:text-2xl">
                <span aria-hidden>📋</span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h1 id="tx-page-title" className="text-base font-semibold text-foreground sm:text-lg">
                  Transactions
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {loading ? 'Loading…' : `${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'}`}
                  {!loading && (
                    <span className="hidden sm:inline"> · UPI pay flow from the dashboard</span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBudgetNotice((open) => !open)}
              aria-expanded={showBudgetNotice}
              aria-label={
                showBudgetNotice
                  ? 'Hide guidance on paid and failed transactions'
                  : 'Show guidance on paid and failed transactions'
              }
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors sm:min-h-0 sm:px-3 sm:py-2 ${
                showBudgetNotice
                  ? 'border-accent/50 bg-accent/15 text-accent dark:bg-accent/20'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="max-w-[9rem] text-xs font-semibold leading-tight sm:max-w-none sm:text-sm">
                {showBudgetNotice ? 'Hide' : 'About'} paid &amp; failed
              </span>
            </button>
          </div>

          {showBudgetNotice && (
            <div className="shrink-0 border-b border-border py-4 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:py-5 sm:pl-6 sm:pr-6">
              <aside
                id="tx-important-notice"
                aria-labelledby="tx-notice-title"
                className="relative overflow-hidden rounded-xl border-2 border-accent/45 bg-accent/[0.08] shadow-sm ring-1 ring-border/80 dark:border-accent/40 dark:bg-accent/10"
              >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-accent sm:w-2" aria-hidden />
                <div className="flex gap-3.5 pl-4 pr-3.5 py-4 sm:gap-4 sm:pl-5 sm:pr-4 sm:py-5">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent dark:bg-accent/25"
                    aria-hidden
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-accent sm:text-xs">
                        Important — read before you delete
                      </p>
                      <h2
                        id="tx-notice-title"
                        className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg"
                      >
                        How paid and failed entries affect your budget
                      </h2>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground sm:text-[0.9375rem]">
                      <strong className="font-semibold text-foreground">Paid</strong> rows lower this category&apos;s
                      available amount for the month on that row.{' '}
                      <strong className="font-semibold text-foreground">Failed</strong> rows are for your records only
                      and do <span className="font-medium">not</span> change spend. If you remove a paid row, that amount
                      is added back to the same month&apos;s balance.
                    </p>
                    <div className="rounded-lg border border-border/80 bg-background/90 px-3.5 py-3 dark:bg-background/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        To delete a row
                      </p>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
                        <span className="sm:hidden">
                          Swipe left on the row and let go past the red strip—the confirmation screen opens by itself.
                        </span>
                        <span className="hidden sm:inline">
                          Drag the row left with your mouse or trackpad and release past the red strip—the confirmation
                          screen opens by itself.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          <div className="shrink-0 border-b border-border py-3.5 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:py-4 sm:pl-6 sm:pr-6">
            <label
              htmlFor="tx-filter-category"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs"
            >
              Filter by category
            </label>
            <select
              id="tx-filter-category"
              value={filterCategoryId === 'all' ? 'all' : String(filterCategoryId)}
              onChange={(e) => {
                const v = e.target.value;
                setFilterCategoryId(v === 'all' ? 'all' : Number(v));
              }}
              className="w-full cursor-pointer appearance-none rounded-xl border border-border bg-background py-3 pl-4 pr-10 text-sm font-medium text-foreground focus:border-transparent focus:ring-2 focus:ring-ring bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:py-5 sm:pl-6 sm:pr-6">
            {loading && (
              <div className="flex justify-center py-14">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-accent" />
              </div>
            )}

            {!loading && transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center sm:py-14">
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
                <p className="font-medium text-foreground">No transactions yet</p>
                <p className="mt-1 max-w-xs px-2 text-sm text-muted-foreground">
                  {filterCategoryId === 'all'
                    ? 'Pay from the dashboard (UPI) to see attempts here.'
                    : `No entries for ${filterSummary}. Try another category or all categories.`}
                </p>
              </div>
            )}

            {!loading && transactions.length > 0 && (
              <ul
                className="divide-y divide-border [&>li:first-child_.tx-row-surface]:pt-0 [&>li:last-child_.tx-row-surface]:pb-0"
                aria-label="Transaction list"
              >
                {transactions.map((t) => {
                  const catName = categoryMeta.name(t.categoryId, t.categoryName);
                  const catIcon = categoryMeta.icon(t.categoryId);
                  const rowInner = (
                    <div className="flex items-start justify-between gap-4 sm:gap-5">
                      <div className="min-w-0 flex-1 space-y-1.5 pr-1">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
                          <span aria-hidden>{catIcon}</span>
                          <span className="min-w-0 break-words">{catName}</span>
                        </p>
                        {t.payeeName?.trim() ? (
                          <p className="text-xs font-medium text-muted-foreground">{t.payeeName.trim()}</p>
                        ) : null}
                        <p className="text-sm text-foreground">{formatTimeLine(t.createdAt)}</p>
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
                  );

                  const key = t.id ?? `${t.createdAt}-${t.amount}`;

                  if (t.id != null) {
                    return (
                      <SwipeToDeleteRow
                        key={key}
                        onDeleteRequest={() => openDelete(t)}
                        deleteDisabled={deletingId === t.id}
                      >
                        {rowInner}
                      </SwipeToDeleteRow>
                    );
                  }

                  return (
                    <li key={key} className="py-4 first:pt-0 last:pb-0 sm:py-5">
                      {rowInner}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {confirmDelete && (
        <ModalPortal
          className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-tx-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 id="delete-tx-title" className="text-lg font-semibold text-foreground">
              Delete this transaction?
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{formatCurrency(confirmDelete.amount)}</span>{' '}
                · {categoryMeta.name(confirmDelete.categoryId, confirmDelete.categoryName)} ·{' '}
                {confirmDelete.month} {confirmDelete.year}
              </p>
              {confirmDelete.status === 'success' ? (
                <p>
                  This will remove the log and{' '}
                  <strong className="text-foreground">add {formatCurrency(confirmDelete.amount)} back</strong> to
                  that category&apos;s remaining budget for that month (spent will go down).
                </p>
              ) : (
                <p>This only removes the failed/cancelled log; your budget was not changed by this entry.</p>
              )}
            </div>
            {deleteError && (
              <p className="text-sm text-destructive" role="alert">
                {deleteError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!deletingId) {
                    setConfirmDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={!!deletingId}
                className="min-h-[48px] w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:min-w-[6rem] sm:py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="min-h-[48px] w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:min-w-[6rem] sm:py-2.5"
              >
                {deletingId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}
