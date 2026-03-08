'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

function monthsToPayOff(
  balance: number,
  monthlyPayment: number,
  annualRatePct: number
): number {
  if (balance <= 0 || monthlyPayment <= 0) return 0;
  const monthlyRate = annualRatePct / 12 / 100;
  if (monthlyRate <= 0) return Math.ceil(balance / monthlyPayment);
  let b = balance;
  let months = 0;
  const maxMonths = 600;
  while (b > 0.01 && months < maxMonths) {
    b = b * (1 + monthlyRate) - monthlyPayment;
    months++;
  }
  return months;
}

function totalInterest(
  balance: number,
  monthlyPayment: number,
  annualRatePct: number,
  months: number
): number {
  let b = balance;
  let total = 0;
  const monthlyRate = annualRatePct / 12 / 100;
  for (let i = 0; i < months && b > 0.01; i++) {
    const interest = b * monthlyRate;
    total += interest;
    const principal = Math.min(monthlyPayment - interest, b);
    b -= principal;
  }
  return total;
}

const DebtPayoffCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [balance, setBalance] = useState(500000);
  const [balanceInput, setBalanceInput] = useState('500000');
  const [emi, setEmi] = useState(15000);
  const [emiInput, setEmiInput] = useState('15000');
  const [ratePct, setRatePct] = useState(12);
  const [ratePctInput, setRatePctInput] = useState('12');
  const [extraPerMonth, setExtraPerMonth] = useState(5000);
  const [extraPerMonthInput, setExtraPerMonthInput] = useState('5000');

  const monthsNormal = useMemo(
    () => monthsToPayOff(balance, emi, ratePct),
    [balance, emi, ratePct]
  );
  const monthsWithExtra = useMemo(
    () => monthsToPayOff(balance, emi + extraPerMonth, ratePct),
    [balance, emi, extraPerMonth, ratePct]
  );

  const interestNormal = useMemo(
    () => totalInterest(balance, emi, ratePct, monthsNormal),
    [balance, emi, ratePct, monthsNormal]
  );
  const interestWithExtra = useMemo(
    () => totalInterest(balance, emi + extraPerMonth, ratePct, monthsWithExtra),
    [balance, emi, extraPerMonth, ratePct, monthsWithExtra]
  );

  const monthsSaved = monthsNormal - monthsWithExtra;
  const interestSaved = interestNormal - interestWithExtra;

  const handleBalance = (v: string) => {
    setBalanceInput(v);
    const n = parseFloat(v.replace(/[^0-9]/g, '')) || 0;
    setBalance(n);
  };
  const handleEmi = (v: string) => {
    setEmiInput(v);
    const n = parseFloat(v.replace(/[^0-9]/g, '')) || 0;
    setEmi(n);
  };
  const handleRate = (v: string) => {
    setRatePctInput(v);
    const n = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
    if (v.split('.').length <= 2) setRatePct(Math.min(30, Math.max(0, n)));
  };
  const handleExtra = (v: string) => {
    setExtraPerMonthInput(v);
    const n = parseFloat(v.replace(/[^0-9]/g, '')) || 0;
    setExtraPerMonth(n);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Debt Payoff</h2>
        <p className="text-sm text-muted-foreground mt-1">
          See how paying a little extra each month shortens your loan and saves interest.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5 rounded-xl bg-muted/30 border border-border p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Current balance ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={balanceInput}
              onChange={(e) => handleBalance(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Current EMI ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={emiInput}
              onChange={(e) => handleEmi(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
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
            <label className="block text-sm font-medium text-foreground">
              Extra payment per month ({currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={extraPerMonthInput}
              onChange={(e) => handleExtra(e.target.value)}
              className="w-full max-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right font-medium"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Without extra payment</h3>
            <p className="text-muted-foreground text-sm">
              Pay off in <span className="font-semibold text-foreground">{monthsNormal} months</span> · Total interest:{' '}
              <span className="font-semibold text-foreground">{formatCurrency(Math.round(interestNormal))}</span>
            </p>
          </div>
          <div className="rounded-xl bg-card border border-accent/20 bg-accent/5 border-2 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">With extra {formatCurrency(extraPerMonth)}/month</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Pay off in <span className="font-semibold text-foreground">{monthsWithExtra} months</span>
            </p>
            <p className="text-accent font-semibold">
              You save {monthsSaved} months · {formatCurrency(Math.round(interestSaved))} less interest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtPayoffCalculator;
