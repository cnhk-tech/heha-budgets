'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

const InflationCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [amountToday, setAmountToday] = useState(100000);
  const [amountTodayInput, setAmountTodayInput] = useState('100000');
  const [years, setYears] = useState(10);
  const [yearsInput, setYearsInput] = useState('10');
  const [inflationPct, setInflationPct] = useState(6);
  const [inflationPctInput, setInflationPctInput] = useState('6');

  const futureAmount = useMemo(() => {
    return amountToday * Math.pow(1 + inflationPct / 100, years);
  }, [amountToday, years, inflationPct]);

  const handleAmount = (value: string) => {
    setAmountTodayInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setAmountToday(n);
  };
  const handleYears = (value: string) => {
    setYearsInput(value);
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setYears(Math.min(50, Math.max(1, n)));
  };
  const handleInflation = (value: string) => {
    setInflationPctInput(value);
    const n = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    if (value.split('.').length <= 2) setInflationPct(Math.min(20, Math.max(0, n)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Inflation & Future Value</h2>
        <p className="text-sm text-muted-foreground mt-1">
          See how much money you&apos;ll need in the future to have the same buying power as today.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Amount today ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amountTodayInput}
              onChange={(e) => handleAmount(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Years from now</label>
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
              Assumed inflation (annual %)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inflationPctInput}
              onChange={(e) => handleInflation(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
            <p className="text-xs text-muted-foreground">Often 5–7% for long-term planning</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Equivalent future amount</h3>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatCurrency(Math.round(futureAmount))}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(amountToday)} today ≈ this much in {years} year{years !== 1 ? 's' : ''} at {inflationPct}% inflation
          </p>
        </div>
      </div>
    </div>
  );
};

export default InflationCalculator;
