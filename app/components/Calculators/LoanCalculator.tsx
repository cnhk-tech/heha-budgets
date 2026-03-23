'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useCurrency } from '@/app/contexts/CurrencyContext';

interface LoanPayment {
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  isPartPaymentMonth?: boolean;
  partPayment?: number;
}

/** Part payments keyed by month (1-based). Multiple payments in same month are summed. */
function buildPartPaymentMap(partPayments: { afterMonth: number; amount: number }[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of partPayments) {
    if (p.afterMonth >= 1 && p.amount > 0) {
      map.set(p.afterMonth, (map.get(p.afterMonth) ?? 0) + p.amount);
    }
  }
  return map;
}

function buildSchedule(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
  startDate: Date,
  partPayments: { afterMonth: number; amount: number }[] = []
): LoanPayment[] {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const partPaymentMap = buildPartPaymentMap(partPayments);
  const maxPartPaymentMonth = partPayments.length
    ? Math.max(...partPayments.map((p) => p.afterMonth))
    : 0;
  const stopAtMonth = Math.max(totalMonths, maxPartPaymentMonth);

  const schedule: LoanPayment[] = [];
  let balance = loanAmount;
  const currentDate = new Date(startDate);

  for (let i = 0; i < stopAtMonth && balance > 0.01; i++) {
    const monthIndex = i + 1;
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(emi - interestPayment, balance);
    balance -= principalPayment;

    const partPayAmount = partPaymentMap.get(monthIndex) ?? 0;
    if (partPayAmount > 0) {
      balance -= partPayAmount;
      if (balance < 0) balance = 0;
    }

    schedule.push({
      date: new Date(currentDate),
      payment: emi,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: balance >= 0 ? balance : 0,
      isPartPaymentMonth: partPayAmount > 0,
      partPayment: partPayAmount > 0 ? partPayAmount : undefined,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  while (balance > 0.01 && schedule.length < totalMonths * 2) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(emi - interestPayment, balance);
    balance -= principalPayment;
    schedule.push({
      date: new Date(currentDate),
      payment: emi,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: balance >= 0 ? balance : 0,
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return schedule;
}

const LoanCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanAmountInput, setLoanAmountInput] = useState('1000000');
  const [interestRate, setInterestRate] = useState(8.5);
  const [interestRateInput, setInterestRateInput] = useState('8.5');
  const [loanTenure, setLoanTenure] = useState(5);
  const [loanTenureInput, setLoanTenureInput] = useState('5');
  const [startDate, setStartDate] = useState(new Date());
  const [partPaymentMonth, setPartPaymentMonth] = useState<string>('');
  const [partPaymentAmount, setPartPaymentAmount] = useState<string>('');
  const [partPayments, setPartPayments] = useState<{ afterMonth: number; amount: number }[]>([]);

  const [errors, setErrors] = useState({
    loanAmount: false,
    interestRate: false,
    loanTenure: false,
  });

  const totalMonths = loanTenure * 12;

  const scheduleOriginal = useMemo(
    () => buildSchedule(loanAmount, interestRate, loanTenure, startDate),
    [loanAmount, interestRate, loanTenure, startDate]
  );

  const scheduleWithPart = useMemo(() => {
    if (partPayments.length === 0) return null;
    return buildSchedule(loanAmount, interestRate, loanTenure, startDate, partPayments);
  }, [loanAmount, interestRate, loanTenure, startDate, partPayments]);

  const payments = scheduleWithPart ?? scheduleOriginal;
  const emi = payments[0]?.payment ?? 0;
  const totalInterestOriginal = scheduleOriginal.reduce((s, p) => s + p.interest, 0);
  const totalInterestWithPart = scheduleWithPart
    ? scheduleWithPart.reduce((s, p) => s + p.interest, 0)
    : totalInterestOriginal;
  const interestSaved = totalInterestOriginal - totalInterestWithPart;
  const monthsOriginal = scheduleOriginal.length;
  const monthsWithPart = scheduleWithPart ? scheduleWithPart.length : monthsOriginal;
  const monthsSaved = monthsOriginal - monthsWithPart;

  const handleLoanAmountChange = (value: string) => {
    setLoanAmountInput(value);
    const n = parseFloat(value);
    if (!isNaN(n)) {
      setLoanAmount(n);
      setErrors((prev) => ({ ...prev, loanAmount: n < 100000 || n > 10000000 }));
    }
  };
  const handleInterestRateChange = (value: string) => {
    setInterestRateInput(value);
    const n = parseFloat(value);
    if (!isNaN(n)) {
      setInterestRate(n);
      setErrors((prev) => ({ ...prev, interestRate: n < 1 || n > 30 }));
    }
  };
  const handleLoanTenureChange = (value: string) => {
    setLoanTenureInput(value);
    const n = parseFloat(value);
    if (!isNaN(n)) {
      setLoanTenure(n);
      setErrors((prev) => ({ ...prev, loanTenure: n < 1 || n > 30 }));
    }
  };

  const addPartPayment = () => {
    const month = parseInt(partPaymentMonth, 10);
    const amount = parseFloat(partPaymentAmount.replace(/[^0-9.]/g, ''));
    if (month >= 1 && month <= totalMonths && amount > 0) {
      setPartPayments((prev) => [...prev, { afterMonth: month, amount }].sort((a, b) => a.afterMonth - b.afterMonth));
      setPartPaymentMonth('');
      setPartPaymentAmount('');
    }
  };

  const removePartPayment = (index: number) => {
    setPartPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllPartPayments = () => {
    setPartPayments([]);
    setPartPaymentMonth('');
    setPartPaymentAmount('');
  };

  const hasError = Object.values(errors).some(Boolean);

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">Loan / EMI</h2>
      <p className="text-sm text-muted-foreground">
        Get your monthly EMI, total interest, and full payment schedule. Add multiple part payments at different months to see how much you save in time and interest.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Inputs */}
        <div className="space-y-5 rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Loan Amount ({currencySymbol})</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={loanAmountInput}
                onChange={(e) => handleLoanAmountChange(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.loanAmount ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="100000"
                max="10000000"
                step="100000"
                value={loanAmount}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setLoanAmount(v);
                  setLoanAmountInput(String(v));
                  setErrors((prev) => ({ ...prev, loanAmount: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(100000)}</span>
              <span>{formatCurrency(10000000)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Interest Rate (Annual %)</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={interestRateInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  if (v.split('.').length <= 2) handleInterestRateChange(v);
                }}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.interestRate ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={interestRate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setInterestRate(v);
                  setInterestRateInput(String(v));
                  setErrors((prev) => ({ ...prev, interestRate: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Tenure (Years)</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={loanTenureInput}
                onChange={(e) => handleLoanTenureChange(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.loanTenure ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="1"
                max="30"
                value={loanTenure}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setLoanTenure(v);
                  setLoanTenureInput(String(v));
                  setErrors((prev) => ({ ...prev, loanTenure: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>
        </div>

        {/* Summary */}
        {payments.length > 0 && (
          <div className="space-y-4 sm:space-y-5 min-w-0">
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-3">EMI summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-xs text-muted-foreground">Monthly EMI</p>
                  <p className="text-lg font-semibold text-foreground tabular-nums">{formatCurrency(emi)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-xs text-muted-foreground">Total interest</p>
                  <p className="text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatCurrency(scheduleWithPart ? totalInterestWithPart : totalInterestOriginal)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-xs text-muted-foreground">Total payment</p>
                  <p className="text-lg font-semibold text-foreground tabular-nums">
                    {formatCurrency(loanAmount + (scheduleWithPart ? totalInterestWithPart : totalInterestOriginal))}
                  </p>
                </div>
              </div>
            </div>

            {/* Part payments */}
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-2">Part payments (prepayment)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add one or more part payments at different months (1–{totalMonths}). Payments in the same month are combined.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">After month</label>
                  <input
                    type="number"
                    min={1}
                    max={totalMonths}
                    placeholder="e.g. 12"
                    value={partPaymentMonth}
                    onChange={(e) => setPartPaymentMonth(e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 50000"
                    value={partPaymentAmount}
                    onChange={(e) => setPartPaymentAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-32 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-right"
                  />
                </div>
                <button
                  type="button"
                  onClick={addPartPayment}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:opacity-90"
                >
                  Add
                </button>
                {partPayments.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllPartPayments}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted/50"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {partPayments.length > 0 && (
                <>
                  <ul className="mt-4 space-y-2">
                    {partPayments.map((p, idx) => (
                      <li
                        key={`${p.afterMonth}-${p.amount}-${idx}`}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <span className="text-sm text-foreground">
                          Month {p.afterMonth}: {formatCurrency(p.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePartPayment(idx)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label={`Remove part payment at month ${p.afterMonth}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-sm font-medium text-foreground">
                      With {partPayments.length} part payment{partPayments.length === 1 ? '' : 's'}:
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Interest saved: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(interestSaved)}</span>
                      {' · '}
                      Tenure reduced: <span className="font-semibold text-foreground">{monthsSaved} months</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EMI table */}
      {payments.length > 0 && (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <h3 className="text-sm font-semibold text-foreground px-4 py-3 border-b border-border">
            Payment schedule {scheduleWithPart ? `(with ${partPayments.length} part payment${partPayments.length === 1 ? '' : 's'})` : ''}
          </h3>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="sticky top-0 z-10 bg-card border-b-2 border-border text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">#</th>
                  <th className="text-left font-medium px-4 py-3">Month</th>
                  <th className="text-right font-medium px-4 py-3">EMI</th>
                  <th className="text-right font-medium px-4 py-3">Principal</th>
                  <th className="text-right font-medium px-4 py-3">Interest</th>
                  <th className="text-right font-medium px-4 py-3">Balance</th>
                  {scheduleWithPart && <th className="text-right font-medium px-4 py-3">Part pay</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p, i) => (
                  <tr
                    key={i}
                    className={
                      p.isPartPaymentMonth
                        ? 'bg-accent/10'
                        : i % 2 === 0
                          ? 'bg-background'
                          : 'bg-muted/20'
                    }
                  >
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-foreground">{format(p.date, 'MMM yyyy')}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-foreground">{formatCurrency(p.payment)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-sky-600 dark:text-sky-400">
                      {formatCurrency(p.principal)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {formatCurrency(p.interest)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-foreground font-medium">
                      {formatCurrency(p.remainingBalance)}
                    </td>
                    {scheduleWithPart && (
                      <td className="px-4 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                        {p.partPayment != null ? formatCurrency(p.partPayment) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payments.length === 0 && !hasError && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Adjust loan amount, rate, and tenure above to see EMI and schedule.
        </p>
      )}
    </div>
  );
};

export default LoanCalculator;
