'use client';

import { useState, useMemo } from 'react';
import { useCurrency } from '@/app/contexts/CurrencyContext';

interface YearProjection {
  year: number;
  investedSoFar: number;
  estimatedValue: number;
  returnsSoFar: number;
}

const SIPCalculator = () => {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [monthlyInvestmentInput, setMonthlyInvestmentInput] = useState('5000');
  const [investmentPeriod, setInvestmentPeriod] = useState(5);
  const [investmentPeriodInput, setInvestmentPeriodInput] = useState('5');
  const [returnRate, setReturnRate] = useState(12);
  const [returnRateInput, setReturnRateInput] = useState('12');

  const [errors, setErrors] = useState({
    monthlyInvestment: false,
    investmentPeriod: false,
    returnRate: false,
  });

  const results = useMemo(() => {
    const monthlyRate = Math.pow(1 + returnRate / 100, 1 / 12) - 1;
    const totalMonths = investmentPeriod * 12;
    const futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate);
    const totalInv = monthlyInvestment * totalMonths;
    const estimatedReturns = futureValue - totalInv;
    return {
      totalInvestment: totalInv,
      expectedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(futureValue),
    };
  }, [monthlyInvestment, investmentPeriod, returnRate]);

  const yearProjections = useMemo((): YearProjection[] => {
    const monthlyRate = Math.pow(1 + returnRate / 100, 1 / 12) - 1;
    const rows: YearProjection[] = [];
    for (let y = 1; y <= investmentPeriod; y++) {
      const monthsUpToYear = y * 12;
      const fv =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, monthsUpToYear) - 1) / monthlyRate) *
        (1 + monthlyRate);
      const invested = monthlyInvestment * monthsUpToYear;
      rows.push({
        year: y,
        investedSoFar: invested,
        estimatedValue: Math.round(fv),
        returnsSoFar: Math.round(fv - invested),
      });
    }
    return rows;
  }, [monthlyInvestment, investmentPeriod, returnRate]);

  const getInvestmentTips = () => {
    const tips: string[] = [];
    if (investmentPeriod < 5)
      tips.push('Extend your investment period (5+ years) for better compounding and lower risk.');
    if (monthlyInvestment < 5000)
      tips.push('Increasing monthly investment even slightly can significantly improve long-term value.');
    const growthPct = results.totalInvestment > 0 ? (results.expectedReturns / results.totalInvestment) * 100 : 0;
    if (growthPct > 0)
      tips.push(`Your money grows by ${growthPct.toFixed(1)}% over ${investmentPeriod} years (${(results.totalValue / results.totalInvestment).toFixed(1)}x).`);
    return tips;
  };

  const handleMonthlyInvestmentChange = (value: string) => {
    setMonthlyInvestmentInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setMonthlyInvestment(numValue);
      setErrors((prev) => ({ ...prev, monthlyInvestment: numValue < 500 || numValue > 100000 }));
    }
  };

  const handleInvestmentPeriodChange = (value: string) => {
    setInvestmentPeriodInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setInvestmentPeriod(numValue);
      setErrors((prev) => ({ ...prev, investmentPeriod: numValue < 1 || numValue > 30 }));
    }
  };

  const handleReturnRateChange = (value: string) => {
    setReturnRateInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setReturnRate(numValue);
      setErrors((prev) => ({ ...prev, returnRate: numValue < 1 || numValue > 30 }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">SIP (Monthly investment)</h2>
      <p className="text-sm text-muted-foreground">
        See how regular monthly investments grow over time with compound returns. Use the table below for a year-wise view.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5 rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Monthly Investment ({currencySymbol})
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={monthlyInvestmentInput}
                onChange={(e) => handleMonthlyInvestmentChange(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.monthlyInvestment ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvestment}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMonthlyInvestment(v);
                  setMonthlyInvestmentInput(String(v));
                  setErrors((prev) => ({ ...prev, monthlyInvestment: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(500)}</span>
              <span>{formatCurrency(100000)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Investment Period (Years)</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={investmentPeriodInput}
                onChange={(e) => handleInvestmentPeriodChange(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.investmentPeriod ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="1"
                max="30"
                value={investmentPeriod}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setInvestmentPeriod(v);
                  setInvestmentPeriodInput(String(v));
                  setErrors((prev) => ({ ...prev, investmentPeriod: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Expected Return (Annual %)</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={returnRateInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  if (v.split('.').length <= 2) handleReturnRateChange(v);
                }}
                className={`w-28 px-3 py-2 rounded-lg border bg-background text-foreground text-right font-medium ${
                  errors.returnRate ? 'border-rose-500' : 'border-border'
                }`}
              />
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={returnRate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setReturnRate(v);
                  setReturnRateInput(String(v));
                  setErrors((prev) => ({ ...prev, returnRate: false }));
                }}
                className="calc-range w-full sm:flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        {/* Results & projections */}
        <div className="space-y-5 min-w-0">
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-3">Summary at maturity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Total invested</p>
                <p className="text-lg font-semibold text-foreground tabular-nums">
                  {formatCurrency(results.totalInvestment)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">Est. returns</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(results.expectedReturns)}
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-accent/10 border border-accent/30 p-3">
                <p className="text-xs text-muted-foreground">Estimated value</p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {formatCurrency(results.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Year-wise future projection */}
          {yearProjections.length > 0 && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <h3 className="text-sm font-semibold text-foreground px-4 py-3 border-b border-border">
                Year-wise projection
              </h3>
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto -mx-1 px-1 sm:mx-0 sm:px-0">
                <table className="w-full text-sm min-w-[340px]">
                  <thead className="sticky top-0 z-10 bg-card border-b-2 border-border text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-4 py-2">Year</th>
                      <th className="text-right font-medium px-4 py-2">Invested</th>
                      <th className="text-right font-medium px-4 py-2">Est. value</th>
                      <th className="text-right font-medium px-4 py-2">Returns</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {yearProjections.map((row) => (
                      <tr key={row.year} className="hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium text-foreground">{row.year}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-foreground">
                          {formatCurrency(row.investedSoFar)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-foreground">
                          {formatCurrency(row.estimatedValue)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(row.returnsSoFar)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Insights */}
          {getInvestmentTips().length > 0 && (
            <div className="rounded-xl bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Reflections</h3>
              <ul className="space-y-2">
                {getInvestmentTips().map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-accent shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
