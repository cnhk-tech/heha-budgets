'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { getBudgets, getCategories } from '../../db';
import { Budget, BudgetHistory, Category } from '@/app/db/types';

const DashboardPage = () => {
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<BudgetHistory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

  const currentDate = new Date('2025-03-11');
  const currentMonth = format(currentDate, 'MMMM');
  const daysLeftInMonth = differenceInDays(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), currentDate);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [budgets, categories] = await Promise.all([
          getBudgets("year", currentDate.getFullYear()) as Promise<BudgetHistory[]>,
          getCategories() as Promise<Category[]>
        ]);

        const currentMonthData = budgets.find(b => b.month === currentMonth);
        setCurrentMonthBudgets(currentMonthData ? [currentMonthData] : []);
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTotalBudget = (budgets: BudgetHistory[]) => {
    return budgets.reduce((acc, curr) => 
      acc + curr.budgets.reduce((sum: number, budget: Budget) => sum + budget.budget, 0), 0
    );
  };

  const getTotalSpent = (budgets: BudgetHistory[]) => {
    return budgets.reduce((acc, curr) => 
      acc + curr.budgets.reduce((sum: number, budget: Budget) => sum + budget.spent, 0), 0
    );
  };

  const getTotalLeft = (budgets: BudgetHistory[]) => {
    return budgets.reduce((acc, curr) => 
      acc + curr.budgets.reduce((sum: number, budget: Budget) => sum + budget.left, 0), 0
    );
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  const getCategoryIcon = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📁';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400">
              Budget Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Track your monthly budgets and expenses</p>
          </div>
          <div className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {daysLeftInMonth} days left in {currentMonth}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Budget</h3>
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-4">
              {formatCurrency(getTotalBudget(currentMonthBudgets))}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Spent</h3>
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-4">
              {formatCurrency(getTotalSpent(currentMonthBudgets))}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Remaining</h3>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-4">
              {formatCurrency(getTotalLeft(currentMonthBudgets))}
            </p>
          </div>
        </div>

        {/* Monthly Budget Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Budget Categories</h2>
            {currentMonthBudgets.length === 0 && (
              <button
                onClick={() => setShowAddBudgetModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Add Budget
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
            </div>
          ) : currentMonthBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMonthBudgets[0].budgets.map((budget: Budget, index: number) => (
                <div key={`${budget.categoryId}-${index}`} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <span className="text-xl">{getCategoryIcon(budget.categoryId)}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {getCategoryName(budget.categoryId)}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(budget.budget)} budget
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      budget.spent > budget.budget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatCurrency(budget.left)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                      <span>Remaining: {formatCurrency(budget.left)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          budget.spent > budget.budget ? 'bg-rose-600' : 'bg-gradient-to-r from-sky-600 to-emerald-600'
                        }`}
                        style={{ width: `${Math.min((budget.spent / budget.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No budget set for {currentMonth}</p>
              <button
                onClick={() => setShowAddBudgetModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Add Budget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default DashboardPage;
