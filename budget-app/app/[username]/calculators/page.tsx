'use client';

import { useState } from 'react';
import SIPCalculator from '@/app/components/Calculators/SIPCalculator';
import LoanCalculator from '@/app/components/Calculators/LoanCalculator';

const CalculatorsPage = () => {
  const [activeCalculator, setActiveCalculator] = useState('sip');

  const calculatorTypes = [
    { id: 'sip', name: 'SIP Calculator' },
    { id: 'loan', name: 'Loan Calculator' },
  ];

  return (
    <div className="w-full p-4 sm:p-6 md:p-10 bg-background">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Financial Calculators</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {calculatorTypes.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalculator(calc.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeCalculator === calc.id 
                ? 'bg-green-200 text-background border border-green-950'
                : 'bg-background text-foreground border border-foreground'
            }`}
          >
            {calc.name}
          </button>
        ))}
      </div>

      <div className="w-full rounded-lg border-2 border-foreground p-6">
        {activeCalculator === 'sip' && <SIPCalculator />}
        {activeCalculator === 'loan' && <LoanCalculator />}
        {activeCalculator === 'mortgage' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mortgage Calculator</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalculatorsPage;
