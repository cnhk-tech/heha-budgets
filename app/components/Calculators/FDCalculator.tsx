'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

type Compounding = 'yearly' | 'half-yearly' | 'quarterly' | 'monthly';

const FDCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [principal, setPrincipal] = useState(100000);
  const [principalInput, setPrincipalInput] = useState('100000');
  const [tenureYears, setTenureYears] = useState(5);
  const [tenureInput, setTenureInput] = useState('5');
  const [ratePct, setRatePct] = useState(7);
  const [ratePctInput, setRatePctInput] = useState('7');
  const [compounding, setCompounding] = useState<Compounding>('quarterly');

  const nPerYear = { yearly: 1, 'half-yearly': 2, quarterly: 4, monthly: 12 }[compounding];

  const maturityAmount = useMemo(() => {
    const r = ratePct / 100;
    return principal * Math.pow(1 + r / nPerYear, nPerYear * tenureYears);
  }, [principal, ratePct, tenureYears, nPerYear]);

  const interestEarned = maturityAmount - principal;

  const handlePrincipal = (value: string) => {
    setPrincipalInput(value);
    const n = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
    setPrincipal(n);
  };
  const handleTenure = (value: string) => {
    setTenureInput(value);
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setTenureYears(Math.min(20, Math.max(1, n)));
  };
  const handleRate = (value: string) => {
    setRatePctInput(value);
    const n = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    if (value.split('.').length <= 2) setRatePct(Math.min(20, Math.max(0, n)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Fixed Deposit (FD)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Maturity amount and interest for a one-time deposit with compound interest.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-4 sm:p-5 min-w-0">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Principal ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={principalInput}
              onChange={(e) => handlePrincipal(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Tenure (years)</label>
            <input
              type="text"
              inputMode="numeric"
              value={tenureInput}
              onChange={(e) => handleTenure(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Interest rate (annual %)</label>
            <input
              type="text"
              inputMode="decimal"
              value={ratePctInput}
              onChange={(e) => handleRate(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Compounding</label>
            <div className="flex flex-wrap gap-2">
              {(['yearly', 'half-yearly', 'quarterly', 'monthly'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompounding(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    compounding === c
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {c.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 sm:p-5 space-y-4 min-w-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">At maturity</h3>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(Math.round(maturityAmount))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">Principal</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">{formatCurrency(principal)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">Interest earned</p>
              <p className="text-lg font-semibold text-accent tabular-nums">{formatCurrency(Math.round(interestEarned))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FDCalculator;
