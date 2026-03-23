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
    <div className="w-full min-w-0 overflow-x-hidden bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Calculators
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">
            Plan savings, investments, and loans with simple tools.
          </p>
        </header>

        {/* Mobile: horizontal snap chips (swipe to see all tools) */}
        <div className="md:hidden space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Choose a tool
          </p>
          <nav
            className="flex gap-2 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Calculator tools"
          >
            {CALCULATORS.map((calc) => {
              const isActive = activeCalculator === calc.id;
              return (
                <button
                  key={calc.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`
                    snap-start shrink-0 min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-foreground text-background'
                        : 'bg-muted/40 text-muted-foreground border border-border hover:text-foreground hover:bg-muted/60'
                    }
                  `}
                >
                  {calc.name}
                </button>
              );
            })}
          </nav>
          {current && (
            <p className="text-sm text-muted-foreground pt-1">{current.short}</p>
          )}
        </div>

        {/* Tablet/desktop: wrapping pills */}
        <div className="hidden md:block space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Choose a tool
          </p>
          <div className="flex flex-wrap gap-2">
            {CALCULATORS.map((calc) => (
              <button
                key={calc.id}
                type="button"
                onClick={() => setActiveCalculator(calc.id)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCalculator === calc.id
                    ? 'bg-accent text-accent-foreground shadow-sm'
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
          className="rounded-2xl bg-card border border-border overflow-hidden min-w-0 animate-fade-in shadow-sm"
          aria-label={current?.name}
        >
          <div className="p-4 sm:p-6 md:p-8 min-w-0">
            {renderCalculator()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CalculatorsPage;
