'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface LoanPayment {
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

// interface PartialPaymentStrategy {
//   date: Date;
//   amount: number;
//   interestSaved: number;
//   tenureReduced: number;
//   newEMI?: number;
// }

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanAmountInput, setLoanAmountInput] = useState('1000000');
  const [interestRate, setInterestRate] = useState(8.5);
  const [interestRateInput, setInterestRateInput] = useState('8.5');
  const [loanTenure, setLoanTenure] = useState(5);
  const [loanTenureInput, setLoanTenureInput] = useState('5');
  const [startDate, setStartDate] = useState(new Date());
  const [payments, setPayments] = useState<LoanPayment[]>([]);

  // const [lockInPeriod, setLockInPeriod] = useState(12);
  // const [lockInPeriodInput, setLockInPeriodInput] = useState('12');
  // const [paymentsPerYear, setPaymentsPerYear] = useState(1);
  // const [paymentsPerYearInput, setPaymentsPerYearInput] = useState('1');
  // const [minPartialPayment, setMinPartialPayment] = useState(5);
  // const [minPartialPaymentInput, setMinPartialPaymentInput] = useState('5');
  // const [preclosureCharges, setPreclosureCharges] = useState(2);
  // const [preclosureChargesInput, setPreclosureChargesInput] = useState('2');

  // const [optimizationResults, setOptimizationResults] = useState<{
  //   strategies: PartialPaymentStrategy[];
  //   totalInterestSaved: number;
  //   totalTenureReduced: number;
  // } | null>(null);

  const [errors, setErrors] = useState({
    loanAmount: false,
    interestRate: false,
    loanTenure: false,
    // lockInPeriod: false,
    // paymentsPerYear: false,
    // minPartialPayment: false,
    // preclosureCharges: false
  });

  const handleLoanAmountChange = (value: string) => {
    setLoanAmountInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 100000 && numValue <= 10000000) {
        setLoanAmount(numValue);
        setErrors(prev => ({ ...prev, loanAmount: false }));
      } else {
        setErrors(prev => ({ ...prev, loanAmount: true }));
      }
    }
  };

  const handleInterestRateChange = (value: string) => {
    setInterestRateInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 1 && numValue <= 30) {
        setInterestRate(numValue);
        setErrors(prev => ({ ...prev, interestRate: false }));
      } else {
        setErrors(prev => ({ ...prev, interestRate: true }));
      }
    }
  };

  const handleLoanTenureChange = (value: string) => {
    setLoanTenureInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (numValue >= 1 && numValue <= 30) {
        setLoanTenure(numValue);
        setErrors(prev => ({ ...prev, loanTenure: false }));
      } else {
        setErrors(prev => ({ ...prev, loanTenure: true }));
      }
    }
  };

  // const handleLockInPeriodChange = (value: string) => {
  //   setLockInPeriodInput(value);
  //   const numValue = parseFloat(value);
  //   if (!isNaN(numValue)) {
  //     if (numValue >= 0 && numValue <= loanTenure * 12) {
  //       setLockInPeriod(numValue);
  //       setErrors(prev => ({ ...prev, lockInPeriod: false }));
  //     } else {
  //       setErrors(prev => ({ ...prev, lockInPeriod: true }));
  //     }
  //   }
  // };

  // const handlePaymentsPerYearChange = (value: string) => {
  //   setPaymentsPerYearInput(value);
  //   const numValue = parseFloat(value);
  //   if (!isNaN(numValue)) {
  //     if (numValue >= 1 && numValue <= 12) {
  //       setPaymentsPerYear(numValue);
  //       setErrors(prev => ({ ...prev, paymentsPerYear: false }));
  //     } else {
  //       setErrors(prev => ({ ...prev, paymentsPerYear: true }));
  //     }
  //   }
  // };

  // const handleMinPartialPaymentChange = (value: string) => {
  //   setMinPartialPaymentInput(value);
  //   const numValue = parseFloat(value);
  //   if (!isNaN(numValue)) {
  //     if (numValue >= 1 && numValue <= 100) {
  //       setMinPartialPayment(numValue);
  //       setErrors(prev => ({ ...prev, minPartialPayment: false }));
  //     } else {
  //       setErrors(prev => ({ ...prev, minPartialPayment: true }));
  //     }
  //   }
  // };

  // const handlePreclosureChargesChange = (value: string) => {
  //   setPreclosureChargesInput(value);
  //   const numValue = parseFloat(value);
  //   if (!isNaN(numValue)) {
  //     if (numValue >= 0 && numValue <= 5) {
  //       setPreclosureCharges(numValue);
  //       setErrors(prev => ({ ...prev, preclosureCharges: false }));
  //     } else {
  //       setErrors(prev => ({ ...prev, preclosureCharges: true }));
  //     }
  //   }
  // };

  const calculateLoan = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (Object.values(errors).some(error => error)) return;

    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;

    // Calculate monthly payment using the formula:
    // P = (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const paymentSchedule: LoanPayment[] = [];
    let remainingBalance = loanAmount;
    let currentDate = new Date(startDate);

    for (let i = 0; i < totalMonths; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      paymentSchedule.push({
        date: new Date(currentDate),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: remainingBalance > 0 ? remainingBalance : 0
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    setPayments(paymentSchedule);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Loan Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Loan Amount (₹)</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.loanAmount ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={loanAmountInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleLoanAmountChange(value);
                  }}
                />
              </div>
              {errors.loanAmount && (
                <div className="text-right text-xs text-red-500">
                  Invalid amount
                </div>
              )}
            </div>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => {
                const value = e.target.value;
                setLoanAmount(parseFloat(value));
                setLoanAmountInput(value);
                setErrors(prev => ({ ...prev, loanAmount: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.loanAmount ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹1,00,000</span>
              <span>₹1,00,00,000</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Interest Rate (%) (Annual)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.interestRate ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={interestRateInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length <= 2) {
                      handleInterestRateChange(value);
                    }
                  }}
                />
              </div>
              {errors.interestRate && (
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
              value={interestRate}
              onChange={(e) => {
                const value = e.target.value;
                setInterestRate(parseFloat(value));
                setInterestRateInput(value);
                setErrors(prev => ({ ...prev, interestRate: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.interestRate ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Loan Tenure (Years)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.loanTenure ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={loanTenureInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleLoanTenureChange(value);
                  }}
                />
              </div>
              {errors.loanTenure && (
                <div className="text-right text-xs text-red-500">
                  Invalid tenure
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={loanTenure}
              onChange={(e) => {
                const value = e.target.value;
                setLoanTenure(parseFloat(value));
                setLoanTenureInput(value);
                setErrors(prev => ({ ...prev, loanTenure: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.loanTenure ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border border-foreground rounded-lg bg-background text-foreground"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>

          {/* Commented out optimization-related input fields */}
          {/* <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Lock-in Period (Months)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.lockInPeriod ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={lockInPeriodInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleLockInPeriodChange(value);
                  }}
                />
              </div>
              {errors.lockInPeriod && (
                <div className="text-right text-xs text-red-500">
                  Invalid period
                </div>
              )}
            </div>
            <input
              type="range"
              min="0"
              max={loanTenure * 12}
              value={lockInPeriod}
              onChange={(e) => {
                const value = e.target.value;
                setLockInPeriod(parseFloat(value));
                setLockInPeriodInput(value);
                setErrors(prev => ({ ...prev, lockInPeriod: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.lockInPeriod ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 Months</span>
              <span>{loanTenure * 12} Months</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Partial Payments per Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.paymentsPerYear ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={paymentsPerYearInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handlePaymentsPerYearChange(value);
                  }}
                />
              </div>
              {errors.paymentsPerYear && (
                <div className="text-right text-xs text-red-500">
                  Invalid count
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={paymentsPerYear}
              onChange={(e) => {
                const value = e.target.value;
                setPaymentsPerYear(parseFloat(value));
                setPaymentsPerYearInput(value);
                setErrors(prev => ({ ...prev, paymentsPerYear: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.paymentsPerYear ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 Payment</span>
              <span>12 Payments</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Min. Partial Payment (%)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.minPartialPayment ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={minPartialPaymentInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleMinPartialPaymentChange(value);
                  }}
                />
              </div>
              {errors.minPartialPayment && (
                <div className="text-right text-xs text-red-500">
                  Invalid percentage
                </div>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={minPartialPayment}
              onChange={(e) => {
                const value = e.target.value;
                setMinPartialPayment(parseFloat(value));
                setMinPartialPaymentInput(value);
                setErrors(prev => ({ ...prev, minPartialPayment: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.minPartialPayment ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Preclosure Charges (%)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-24 p-2 border rounded-lg bg-background text-foreground text-right ${
                    errors.preclosureCharges ? 'border-red-500 bg-red-50 text-black' : 'border-foreground'
                  }`}
                  value={preclosureChargesInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length <= 2) {
                      handlePreclosureChargesChange(value);
                    }
                  }}
                />
              </div>
              {errors.preclosureCharges && (
                <div className="text-right text-xs text-red-500">
                  Invalid charges
                </div>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={preclosureCharges}
              onChange={(e) => {
                const value = e.target.value;
                setPreclosureCharges(parseFloat(value));
                setPreclosureChargesInput(value);
                setErrors(prev => ({ ...prev, preclosureCharges: false }));
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                errors.preclosureCharges ? 'bg-red-200' : 'bg-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>5%</span>
            </div>
          </div> */}

          <button 
            className={`w-full py-2 rounded-lg transition-colors ${
              Object.values(errors).some(error => error)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-200 text-background border border-green-950 hover:bg-green-300'
            }`}
            onClick={calculateLoan}
            disabled={Object.values(errors).some(error => error)}
          >
            Calculate Loan Schedule
          </button>
        </div>

        {payments.length > 0 && (
          <div className="bg-background border border-foreground rounded-lg p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-background">
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="text-lg font-semibold">₹{payments[0].payment.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Total Interest</p>
                  <p className="text-lg font-semibold">₹{payments.reduce((sum, p) => sum + p.interest, 0).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payment</p>
                  <p className="text-lg font-semibold">₹{(payments[0].payment * payments.length).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Payment Schedule</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 text-sm font-bold sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Principal</th>
                          <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Interest</th>
                          <th className="px-6 py-3 text-left text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(payment.date, 'MMM yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payment.payment.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payment.principal.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payment.interest.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{payment.remainingBalance.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator; 