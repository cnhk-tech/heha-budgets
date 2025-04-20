'use client';

import { useEffect, useState } from "react";
import PastFiveYearsDropdown from "@/app/components/Dropdown/PastFiveYearsDropdown";
import { getBudgets } from "@/app/db";
import { BudgetHistory } from "@/app/db/types";

interface YearlyBudgetHistory {
  month: string;
  budget: number;
  spent: number;
  left: number;
}

const BudgetsPage = () => {
  const [activeYear, setActiveYear] = useState(0);
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [budgets, setBudgets] = useState<YearlyBudgetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const getBudgetHistory = async () => {
    setIsLoading(true);
    try {
      const budgetsOfTheYear: BudgetHistory[] = await getBudgets("year", activeYear);
      setBudgetHistory(budgetsOfTheYear);
    } catch (error) {
      console.error("Error fetching budget history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBudgetHistory();
  }, [activeYear]);

  useEffect(() => {
    const result: YearlyBudgetHistory[] = budgetHistory.map((budget) => ({
      month: budget.month,
      budget: budget.budgets.reduce((acc, curr) => acc + curr.budget, 0),
      spent: budget.budgets.reduce((acc, curr) => acc + curr.spent, 0),
      left: budget.budgets.reduce((acc, curr) => acc + curr.left, 0),
    }));
    setBudgets(result);
  }, [budgetHistory]);

  const updateActiveYear = (year: number) => {
    setActiveYear(year);
    setViewMode('cards');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getTotalBudget = () => {
    return budgets.reduce((acc, curr) => acc + curr.budget, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((acc, curr) => acc + curr.spent, 0);
  };

  const getTotalLeft = () => {
    return budgets.reduce((acc, curr) => acc + curr.left, 0);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Budget Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Track and manage your monthly budgets</p>
          </div>
          <div className="w-full md:w-auto">
            <PastFiveYearsDropdown updateActiveYear={updateActiveYear} />
          </div>
        </div>

        {activeYear === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 text-center">
            <div className="text-base md:text-lg text-gray-500 dark:text-gray-400">
              Select a year to view your budget history
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-48 md:h-64">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {activeYear !== 0 && !isLoading && (
          <>
            {/* Summary Cards */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Overview</h2>
              {budgets.length > 0 && (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Table
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 shadow-md">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Budget</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{formatCurrency(getTotalBudget())}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 shadow-md">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{formatCurrency(getTotalSpent())}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 shadow-md">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Remaining</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{formatCurrency(getTotalLeft())}</p>
              </div>
            </div>

            {/* Budget View */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {budgets.length ? (
                  budgets.map((budget) => {
                    const progress = getProgressPercentage(budget.spent, budget.budget);
                    const isOverBudget = budget.spent > budget.budget;

                    return (
                      <div
                        key={budget.month}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{budget.month}</h3>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm md:text-base font-medium ${
                              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {formatCurrency(budget.left)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {isOverBudget ? 'Over Budget' : 'Saved'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 md:mt-4">
                          <div className="flex justify-between text-xs md:text-sm mb-2">
                            <span className="text-sky-600 dark:text-sky-400">Budget: {formatCurrency(budget.budget)}</span>
                            <span className="text-rose-600 dark:text-rose-400">Spent: {formatCurrency(budget.spent)}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
                              <div 
                                className={`absolute h-full transition-all duration-500 ${
                                  isOverBudget 
                                    ? 'bg-rose-600' 
                                    : 'bg-sky-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                              <div 
                                className={`absolute h-full transition-all duration-500 ${
                                  isOverBudget 
                                    ? 'bg-rose-100' 
                                    : 'bg-sky-100'
                                }`}
                                style={{ 
                                  width: `${100 - progress}%`,
                                  left: `${progress}%`
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className={`font-medium ${
                                isOverBudget ? 'text-rose-600' : 'text-sky-600'
                              }`}>
                                Utilized: {Math.round(progress)}%
                              </span>
                              <span className={`font-medium ${
                                isOverBudget ? 'text-rose-600' : 'text-sky-600'
                              }`}>
                                Remaining: {Math.round(100 - progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 text-center">
                    <div className="text-base md:text-lg text-gray-500 dark:text-gray-400">
                      No budget data available for {activeYear}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {budgets.map((budget) => {
                        const progress = getProgressPercentage(budget.spent, budget.budget);
                        const isOverBudget = budget.spent > budget.budget;
                        return (
                          <tr key={budget.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{budget.month}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-600 dark:text-sky-400">{formatCurrency(budget.budget)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 dark:text-rose-400">
                              {formatCurrency(budget.spent)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {formatCurrency(budget.left)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'
                            }`}>
                              {Math.round(progress)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
