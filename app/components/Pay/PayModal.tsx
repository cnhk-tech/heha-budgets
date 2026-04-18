'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ModalPortal } from '@/app/components/ModalPortal';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import { addExpense } from '@/app/db/budgets';
import { addSpendingTransaction, buildTransactionPayload } from '@/app/db/transactions';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { keypressHaptic, confirmHaptic, successHaptic, errorHaptic } from '@/app/lib/haptics';

type PayStep = 'input' | 'recording' | 'done';

const MAX_DIGITS = 10;
const MAX_DECIMALS = 2;

const NUMPAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', 'backspace',
] as const;

type AmountTheme = 'idle' | 'safe' | 'warn' | 'over';

function getAmountTheme(amount: number, budgetLeft: number | undefined): AmountTheme {
  if (amount <= 0) return 'idle';
  if (budgetLeft === undefined) return 'safe';
  if (amount > budgetLeft) return 'over';
  if (amount > budgetLeft * 0.75) return 'warn';
  return 'safe';
}

const THEME_STYLES: Record<AmountTheme, { display: string; border: string; glow: string; text: string }> = {
  idle: {
    display: 'bg-background border-border',
    border: 'border-border',
    glow: '',
    text: 'text-muted-foreground',
  },
  safe: {
    display: 'bg-emerald-500/[0.06] border-emerald-500/30 dark:bg-emerald-500/[0.08]',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_30px_-5px] shadow-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  warn: {
    display: 'bg-amber-500/[0.06] border-amber-500/30 dark:bg-amber-500/[0.08]',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_-5px] shadow-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  over: {
    display: 'bg-rose-500/[0.06] border-rose-500/30 dark:bg-rose-500/[0.08]',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_30px_-5px] shadow-rose-500/25',
    text: 'text-rose-600 dark:text-rose-400',
  },
};

type Props = {
  onClose: () => void;
  categoryName?: string;
  budgetLeft?: number;
  categoryId?: number;
  year?: number;
  month?: string;
  userId?: number;
};

export default function PayModal({ onClose, categoryName, budgetLeft, categoryId, year, month, userId }: Props) {
  const { formatCurrency, currencySymbol } = useCurrency();
  useLockBodyScroll(true);

  const [step, setStep] = useState<PayStep>('input');
  const [raw, setRaw] = useState('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [digitAnimKey, setDigitAnimKey] = useState(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const parsedAmount = parseFloat(raw) || 0;
  const theme = getAmountTheme(parsedAmount, budgetLeft);
  const ts = THEME_STYLES[theme];
  const isOverBudget = theme === 'over';
  const overBy = isOverBudget && budgetLeft !== undefined ? parsedAmount - budgetLeft : 0;
  const canConfirm = parsedAmount > 0;

  const budgetPercent =
    budgetLeft !== undefined && budgetLeft > 0 && parsedAmount > 0
      ? Math.min((parsedAmount / budgetLeft) * 100, 100)
      : 0;

  useEffect(() => () => clearTimeout(pressTimer.current), []);

  const handleKey = useCallback((key: string) => {
    keypressHaptic();
    setPressedKey(key);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressedKey(null), 180);

    setRaw((prev) => {
      if (key === 'backspace') return prev.slice(0, -1);

      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }

      const dotIdx = prev.indexOf('.');
      if (dotIdx !== -1 && prev.length - dotIdx > MAX_DECIMALS) return prev;
      if (prev.replace('.', '').length >= MAX_DIGITS) return prev;
      if (prev === '0' && key !== '.') return key;

      setDigitAnimKey((k) => k + 1);
      return prev + key;
    });
  }, []);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    confirmHaptic();
    setSubmitError(null);
    setStep('recording');
    try {
      if (userId != null && categoryId != null && year != null && month != null) {
        await addExpense(userId, year, month, categoryId, parsedAmount);
        await addSpendingTransaction(
          buildTransactionPayload(userId, categoryId, categoryName ?? 'Category', parsedAmount, year, month, 'success', reason)
        );
      }
      successHaptic();
      setStep('done');
      setTimeout(() => onClose(), 1400);
    } catch (e) {
      if (userId != null && categoryId != null && year != null && month != null) {
        try {
          await addSpendingTransaction(
            buildTransactionPayload(userId, categoryId, categoryName ?? 'Category', parsedAmount, year, month, 'failed', reason)
          );
        } catch { /* ignore */ }
      }
      errorHaptic();
      setSubmitError(e instanceof Error ? e.message : 'Failed to record expense');
      setStep('input');
    }
  };

  const displayDigits = raw || '0';

  return (
    <ModalPortal className="flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-numpad-slide-up safe-bottom">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">Log expense</h2>
            {categoryName && (
              <p className="text-sm text-muted-foreground truncate">{categoryName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {step === 'recording' ? (
          <div className="px-5 py-16 flex flex-col items-center justify-center gap-4">
            <span className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
            <p className="text-foreground font-medium">Recording expense…</p>
            <p className="text-sm text-muted-foreground">Updating your budget</p>
          </div>
        ) : step === 'done' ? (
          <div className="px-5 py-16 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-scale-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-foreground font-semibold text-lg">Expense recorded!</p>
            <p className="text-sm text-muted-foreground text-center">
              {formatCurrency(parsedAmount)} added to {categoryName ?? 'your budget'}
              {reason.trim() ? ` — ${reason.trim()}` : ''}
            </p>
          </div>
        ) : (
          <>
            {/* Amount display — centered, big, with dynamic color theme */}
            <div className={[
              'mx-5 mt-2 mb-1 rounded-2xl border px-5 py-8 flex flex-col items-center justify-center min-h-[120px]',
              'transition-all duration-500 ease-out',
              ts.display,
              ts.glow,
            ].join(' ')}>
              {/* Budget usage bar */}
              {budgetLeft !== undefined && budgetLeft > 0 && (
                <div className="w-full max-w-[200px] mb-4">
                  <div className="h-1 rounded-full bg-border/60 overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full transition-all duration-500 ease-out',
                        theme === 'over' ? 'bg-rose-500' : theme === 'warn' ? 'bg-amber-500' : 'bg-emerald-500',
                      ].join(' ')}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5 tabular-nums">
                    {formatCurrency(budgetLeft)} left
                  </p>
                </div>
              )}

              {/* Amount digits */}
              <div className="flex items-baseline justify-center gap-1 overflow-hidden">
                <span className={`text-2xl font-semibold mr-0.5 transition-colors duration-500 ${parsedAmount > 0 ? ts.text : 'text-muted-foreground/50'}`}>
                  {currencySymbol}
                </span>
                <div className="flex items-baseline">
                  {displayDigits.split('').map((char, i) => (
                    <span
                      key={`${i}-${char}-${i === displayDigits.length - 1 ? digitAnimKey : 'static'}`}
                      className={[
                        'text-5xl sm:text-6xl font-bold tabular-nums inline-block transition-colors duration-500',
                        parsedAmount > 0 ? ts.text : 'text-muted-foreground/40',
                        i === displayDigits.length - 1 && raw.length > 0 ? 'animate-digit-enter' : '',
                      ].join(' ')}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>

              {/* Over budget label */}
              {isOverBudget && (
                <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400 animate-fade-in">
                  Over by {formatCurrency(overBy)}
                </p>
              )}
            </div>

            {/* Reason input — minimal */}
            <div className="mx-5 mb-2 mt-1">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What for? (optional)"
                maxLength={60}
                className="w-full text-center text-sm bg-transparent border-0 border-b border-border/50 focus:border-accent/50 text-foreground placeholder:text-muted-foreground/40 py-2 outline-none transition-colors"
              />
            </div>

            {submitError && (
              <p className="mx-5 mb-2 text-sm text-rose-600 dark:text-rose-400 text-center">{submitError}</p>
            )}

            {/* Number pad */}
            <div className="px-4 pb-2 pt-1">
              <div className="grid grid-cols-3 gap-2">
                {NUMPAD_KEYS.map((key) => {
                  const isBackspace = key === 'backspace';
                  const isDot = key === '.';
                  const isActive = pressedKey === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKey(key)}
                      className={[
                        'relative h-[52px] sm:h-14 rounded-2xl text-xl font-semibold transition-colors select-none',
                        'active:scale-95',
                        isBackspace
                          ? 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          : 'bg-background border border-border text-foreground hover:bg-muted/30',
                        isActive ? 'animate-num-bounce' : '',
                      ].join(' ')}
                      aria-label={isBackspace ? 'Delete' : isDot ? 'Decimal point' : key}
                    >
                      {isBackspace ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7h11a1 1 0 011 1v12a1 1 0 01-1 1H10l-7-7z" />
                        </svg>
                      ) : (
                        key
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm button */}
            <div className="px-4 pb-5 pt-1">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={[
                  'w-full py-4 text-base font-semibold rounded-2xl transition-all duration-300',
                  canConfirm
                    ? isOverBudget
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700 active:scale-[0.98]'
                      : 'bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98]'
                    : 'bg-muted/40 text-muted-foreground cursor-not-allowed shadow-none',
                ].join(' ')}
              >
                {canConfirm
                  ? isOverBudget
                    ? `Log ${formatCurrency(parsedAmount)} anyway`
                    : `Log ${formatCurrency(parsedAmount)}`
                  : 'Enter an amount'}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalPortal>
  );
}
