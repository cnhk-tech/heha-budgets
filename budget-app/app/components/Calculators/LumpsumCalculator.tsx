'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

const LumpsumCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [amount, setAmount] = useState(100000);
  const [amountInput, setAmountInput] = useState('100000');
  const [years, setYears] = useState(10);
  const [yearsInput, setYearsInput] = useState('10');
  const [returnPct, setReturnPct] = useState(12);
  const [returnPctInput, setReturnPctInput] = useState('12');

  const futureValue = useMemo(() => {
    return amount * Math.pow(1 + returnPct / 100, years);
  }, [amount, years, returnPct]);

  const gains = futureValue - amount;

  const handleAmount = (value: string) => {
    setAmountInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setAmount(n);
  };
  const handleYears = (value: string) => {
    setYearsInput(value);
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setYears(Math.min(40, Math.max(1, n)));
  };
  const handleReturn = (value: string) => {
    setReturnPctInput(value);
    const n = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    if (value.split('.').length <= 2) setReturnPct(Math.min(30, Math.max(0, n)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Lumpsum Investment</h2>
        <p className="text-sm text-muted-foreground mt-1">
          One-time investment: see how much it can grow over time with compound returns.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Invest amount ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => handleAmount(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Years</label>
            <input
              type="text"
              inputMode="numeric"
              value={yearsInput}
              onChange={(e) => handleYears(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Expected annual return (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={returnPctInput}
              onChange={(e) => handleReturn(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Estimated value</h3>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(Math.round(futureValue))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">You invest</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">Estimated gains</p>
              <p className="text-lg font-semibold text-accent tabular-nums">{formatCurrency(Math.round(gains))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LumpsumCalculator;
