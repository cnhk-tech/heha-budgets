'use client';

import { useState } from 'react';

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [monthlyInvestmentInput, setMonthlyInvestmentInput] = useState('5000');
  const [investmentPeriod, setInvestmentPeriod] = useState(5);
  const [investmentPeriodInput, setInvestmentPeriodInput] = useState('5');
  const [returnRate, setReturnRate] = useState(12);
  const [returnRateInput, setReturnRateInput] = useState('12');
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [expectedReturns, setExpectedReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const [errors, setErrors] = useState({
    monthlyInvestment: false,
    investmentPeriod: false,
    returnRate: false
  });

  function calculateSIP(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    
    // Convert annual return rate to monthly rate using compounding
    // r = { [ 1 + annualRate ] ^ 1/12 } - 1
    const monthlyRate = Math.pow(1 + (returnRate / 100), 1/12) - 1;
    const totalMonths = investmentPeriod * 12;
    
    // Standard SIP Formula: FV = P × { [ (1 + r)^n – 1] / r } × (1 + r)
    // Where:
    // FV = Future Value
    // P = Monthly Investment
    // r = Monthly Interest Rate (calculated from annual rate with compounding)
    // n = Total Number of Months (Years × 12)
    const futureValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalInvestment = monthlyInvestment * totalMonths;
    const estimatedReturns = futureValue - totalInvestment;
    
    setTotalValue(Math.round(futureValue));
    setTotalInvestment(totalInvestment);
    setExpectedReturns(Math.round(estimatedReturns));
  }

  const getInvestmentTips = () => {
    if (!totalValue) return [];
    
    const tips = [];
    
    if (investmentPeriod < 5) {
      tips.push("Short-term investments are riskier. Consider extending your investment period for better returns.");
    }
    
    if (monthlyInvestment < 5000) {
      tips.push("Consider increasing your monthly investment to achieve better compounding benefits.");
    }
    
    return tips;
  };

  const handleMonthlyInvestmentChange = (value: string) => {
    setMonthlyInvestmentInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 500 && numValue <= 100000) {
        setMonthlyInvestment(numValue);
        setErrors(prev => ({ ...prev, monthlyInvestment: false }));
      } else {
        setErrors(prev => ({ ...prev, monthlyInvestment: true }));
      }
    }
  };

  const handleInvestmentPeriodChange = (value: string) => {
    setInvestmentPeriodInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 1 && numValue <= 30) {
        setInvestmentPeriod(numValue);
        setErrors(prev => ({ ...prev, investmentPeriod: false }));
      } else {
        setErrors(prev => ({ ...prev, investmentPeriod: true }));
      }
    }
  };

  const handleReturnRateChange = (value: string) => {
    setReturnRateInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 1 && numValue <= 30) {
        setReturnRate(numValue);
        setErrors(prev => ({ ...prev, returnRate: false }));
      } else {
        setErrors(prev => ({ ...prev, returnRate: true }));
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SIP Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Monthly Investment (₹)</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.monthlyInvestment ? 'border-red-500 bg-red-50' : 'border-foreground'
                  }`}
                  value={monthlyInvestmentInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleMonthlyInvestmentChange(value);
                  }}
                />
              </div>
              {errors.monthlyInvestment && (
                <div className="text-right text-xs text-red-500">
                  Invalid amount
                </div>
              )}
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => {
                const value = e.target.value;
                setMonthlyInvestment(parseFloat(value));
                setMonthlyInvestmentInput(value);
                setErrors(prev => ({ ...prev, monthlyInvestment: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.monthlyInvestment ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Investment Period (Years)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.investmentPeriod ? 'border-red-500 bg-red-50' : 'border-foreground'
                  }`}
                  value={investmentPeriodInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInvestmentPeriodChange(value);
                  }}
                />
              </div>
              {errors.investmentPeriod && (
                <div className="text-right text-xs text-red-500">
                  Invalid period
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={investmentPeriod}
              onChange={(e) => {
                const value = e.target.value;
                setInvestmentPeriod(parseFloat(value));
                setInvestmentPeriodInput(value);
                setErrors(prev => ({ ...prev, investmentPeriod: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.investmentPeriod ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Expected Return Rate (%) (Annual)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.returnRate ? 'border-red-500 bg-red-50' : 'border-foreground'
                  }`}
                  value={returnRateInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length <= 2) {
                      handleReturnRateChange(value);
                    }
                  }}
                />
              </div>
              {errors.returnRate && (
                <div className="text-right text-xs text-red-500">
                  Invalid rate
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.1"
              value={returnRate}
              onChange={(e) => {
                const value = e.target.value;
                setReturnRate(parseFloat(value));
                setReturnRateInput(value);
                setErrors(prev => ({ ...prev, returnRate: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.returnRate ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <button 
            className={`w-full py-2 rounded-lg transition-colors ${
              Object.values(errors).some(error => error)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-200 text-background border border-green-950 hover:bg-green-300'
            }`}
            onClick={calculateSIP}
            disabled={Object.values(errors).some(error => error)}
          >
            Calculate SIP Results
          </button>
        </div>

        <div className="bg-background border border-foreground rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Results</h3>
              <div className="grid grid-cols-2 gap-4 text-background">
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-lg font-semibold">₹{totalInvestment.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Expected Returns</p>
                  <p className="text-lg font-semibold">₹{expectedReturns.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold">₹{totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {totalValue > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Investment Insights</h3>
                <div className="space-y-3">
                  {getInvestmentTips().map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Your investment will grow by {(expectedReturns / totalInvestment * 100).toFixed(1)}% over {investmentPeriod} years.
                      This means your money will multiply by {(totalValue / totalInvestment).toFixed(1)}x.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator; 