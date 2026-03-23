import type { SpendingTransaction } from '@/app/db/types';

/**
 * Amount-first (scannable), status as a small caption with dot — used on transaction lists & category activity.
 */
export function TransactionRowAmountStatus({
  amountLabel,
  status,
}: {
  amountLabel: string;
  status: SpendingTransaction['status'];
}) {
  const ok = status === 'success';
  const statusWord = ok ? 'Paid' : 'Failed';
  return (
    <div
      className="flex min-w-[5.5rem] flex-col items-end gap-1 text-right sm:min-w-0"
      aria-label={`${amountLabel}, ${statusWord}`}
    >
      <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
        {amountLabel}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={
            ok ? 'size-1.5 shrink-0 rounded-full bg-emerald-500' : 'size-1.5 shrink-0 rounded-full bg-rose-500'
          }
          aria-hidden
        />
        <span className={ok ? 'text-emerald-800 dark:text-emerald-400/95' : 'text-rose-800 dark:text-rose-400/95'}>
          {statusWord}
        </span>
      </span>
    </div>
  );
}
