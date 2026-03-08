'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

const MONTH_OPTIONS = [3, 6, 9, 12] as const;

const EmergencyFundCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [monthlyExpenseInput, setMonthlyExpenseInput] = useState('50000');
  const [monthsCover, setMonthsCover] = useState<number>(6);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [currentSavingsInput, setCurrentSavingsInput] = useState('0');
  const [monthlySave, setMonthlySave] = useState(10000);
  const [monthlySaveInput, setMonthlySaveInput] = useState('10000');

  const targetCorpus = useMemo(
    () => monthlyExpense * monthsCover,
    [monthlyExpense, monthsCover]
  );

  const shortfall = useMemo(
    () => Math.max(0, targetCorpus - currentSavings),
    [targetCorpus, currentSavings]
  );

  const monthsToReach = useMemo(() => {
    if (shortfall <= 0 || monthlySave <= 0) return 0;
    return Math.ceil(shortfall / monthlySave);
  }, [shortfall, monthlySave]);

  const handleExpense = (value: string) => {
    setMonthlyExpenseInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setMonthlyExpense(n);
  };
  const handleSavings = (value: string) => {
    setCurrentSavingsInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setCurrentSavings(n);
  };
  const handleMonthlySave = (value: string) => {
    setMonthlySaveInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setMonthlySave(n);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Emergency Fund</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How much to keep aside so you can cover expenses for a few months if income stops.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Monthly expenses ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyExpenseInput}
              onChange={(e) => handleExpense(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Cover how many months?
            </label>
            <div className="flex flex-wrap gap-2">
              {MONTH_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonthsCover(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    monthsCover === m
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {m} months
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Current savings ({currencySymbol}) — optional
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={currentSavingsInput}
              onChange={(e) => handleSavings(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              You can save per month ({currencySymbol}) — optional
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlySaveInput}
              onChange={(e) => handleMonthlySave(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Your target</h3>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(targetCorpus)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {monthsCover} months of expenses at {formatCurrency(monthlyExpense)}/month
            </p>
          </div>
          {currentSavings > 0 && (
            <div className="rounded-xl bg-card border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Gap & timeline</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Shortfall</p>
                  <p className="text-lg font-semibold text-foreground tabular-nums">
                    {formatCurrency(shortfall)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Months to reach goal</p>
                  <p className="text-lg font-semibold text-foreground tabular-nums">
                    {monthsToReach > 0 ? `${monthsToReach} months` : 'Already there'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyFundCalculator;
