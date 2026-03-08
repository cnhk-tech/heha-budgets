'use client';

import { useState } from 'react';
import {
  SIPCalculator,
  LoanCalculator,
  EmergencyFundCalculator,
  InflationCalculator,
  RetirementCalculator,
  LumpsumCalculator,
  FDCalculator,
  DebtPayoffCalculator,
} from '@/app/components/Calculators';

type CalcId =
  | 'sip'
  | 'loan'
  | 'emergency'
  | 'inflation'
  | 'retirement'
  | 'lumpsum'
  | 'fd'
  | 'debt';

const CALCULATORS: { id: CalcId; name: string; short: string }[] = [
  { id: 'sip', name: 'SIP', short: 'Monthly investment growth' },
  { id: 'loan', name: 'Loan / EMI', short: 'Installments & schedule' },
  { id: 'emergency', name: 'Emergency fund', short: 'How much to save' },
  { id: 'inflation', name: 'Inflation', short: 'Future buying power' },
  { id: 'retirement', name: 'Retirement', short: 'Corpus & monthly SIP' },
  { id: 'lumpsum', name: 'Lumpsum', short: 'One-time investment' },
  { id: 'fd', name: 'FD', short: 'Fixed deposit maturity' },
  { id: 'debt', name: 'Debt payoff', short: 'Extra payment impact' },
];

const CalculatorsPage = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalcId>('sip');

  const current = CALCULATORS.find((c) => c.id === activeCalculator);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'sip':
        return <SIPCalculator />;
      case 'loan':
        return <LoanCalculator />;
      case 'emergency':
        return <EmergencyFundCalculator />;
      case 'inflation':
        return <InflationCalculator />;
      case 'retirement':
        return <RetirementCalculator />;
      case 'lumpsum':
        return <LumpsumCalculator />;
      case 'fd':
        return <FDCalculator />;
      case 'debt':
        return <DebtPayoffCalculator />;
      default:
        return <SIPCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Calculators
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">
            Plan savings, investments, and loans with simple tools. Choose a calculator below.
          </p>
        </header>

        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Choose a tool
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CALCULATORS.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCalculator === calc.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                }`}
              >
                {calc.name}
              </button>
            ))}
          </div>
          {current && (
            <p className="text-sm text-muted-foreground">{current.short}</p>
          )}
        </div>

        <section
          className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-in"
          aria-label={current?.name}
        >
          <div className="p-4 sm:p-6 md:p-8">
            {renderCalculator()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CalculatorsPage;
