'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

const RetirementCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlyExpenseToday, setMonthlyExpenseToday] = useState(50000);
  const [monthlyExpenseInput, setMonthlyExpenseInput] = useState('50000');
  const [inflationPct, setInflationPct] = useState(6);
  const [inflationPctInput, setInflationPctInput] = useState('6');
  const [returnPct, setReturnPct] = useState(12);
  const [returnPctInput, setReturnPctInput] = useState('12');
  const [yearsInRetirement, setYearsInRetirement] = useState(25);

  const yearsToRetire = Math.max(0, retireAge - currentAge);

  const monthlyExpenseAtRetirement = useMemo(() => {
    return monthlyExpenseToday * Math.pow(1 + inflationPct / 100, yearsToRetire);
  }, [monthlyExpenseToday, inflationPct, yearsToRetire]);

  const corpusNeeded = useMemo(() => {
    const monthlyRate = returnPct / 100 / 12;
    const months = yearsInRetirement * 12;
    if (Math.abs(monthlyRate) < 1e-6) return monthlyExpenseAtRetirement * months;
    const pv = (monthlyExpenseAtRetirement * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months));
    return pv;
  }, [monthlyExpenseAtRetirement, returnPct, yearsInRetirement]);

  const sipToReach = useMemo(() => {
    if (yearsToRetire <= 0) return 0;
    const monthlyRate = Math.pow(1 + returnPct / 100, 1 / 12) - 1;
    const totalMonths = yearsToRetire * 12;
    const sip = corpusNeeded / (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    return sip;
  }, [corpusNeeded, returnPct, yearsToRetire]);

  const handleExpense = (v: string) => {
    setMonthlyExpenseInput(v);
    const n = parseFloat(v.replace(/[^0-9]/g, '')) || 0;
    setMonthlyExpenseToday(n);
  };
  const handleInflation = (v: string) => {
    setInflationPctInput(v);
    const n = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    if (v.split('.').length <= 2) setInflationPct(Math.min(15, Math.max(0, n)));
  };
  const handleReturn = (v: string) => {
    setReturnPctInput(v);
    const n = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    if (v.split('.').length <= 2) setReturnPct(Math.min(30, Math.max(0, n)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Retirement Corpus</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How much you need at retirement and how much to save each month to get there.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-4 sm:p-5 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Current age</label>
              <input
                type="number"
                min={18}
                max={70}
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.min(70, Math.max(18, parseInt(e.target.value, 10) || 18)))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Retirement age</label>
              <input
                type="number"
                min={currentAge}
                max={80}
                value={retireAge}
                onChange={(e) => setRetireAge(Math.min(80, Math.max(currentAge, parseInt(e.target.value, 10) || currentAge)))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Monthly expense today ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyExpenseInput}
              onChange={(e) => handleExpense(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Inflation (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={inflationPctInput}
                onChange={(e) => handleInflation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Expected return (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={returnPctInput}
                onChange={(e) => handleReturn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Years in retirement</label>
            <input
              type="number"
              min={10}
              max={40}
              value={yearsInRetirement}
              onChange={(e) => setYearsInRetirement(Math.min(40, Math.max(10, parseInt(e.target.value, 10) || 25)))}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
        </div>
        <div className="space-y-4 min-w-0">
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-3">Corpus needed at retirement</h3>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums break-words">
              {formatCurrency(Math.round(corpusNeeded))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on ~{formatCurrency(Math.round(monthlyExpenseAtRetirement))}/month at retirement
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-3">Monthly SIP to target</h3>
            <p className="text-xl sm:text-2xl font-bold text-accent tabular-nums break-words">
              {formatCurrency(Math.round(sipToReach))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Invest this much every month for {yearsToRetire} years at {returnPct}% to reach the corpus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
