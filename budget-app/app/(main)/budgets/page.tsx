'use client';

import { useEffect, useState } from 'react';
import PastFiveYearsDropdown from '@/app/components/Dropdown/PastFiveYearsDropdown';
import BudgetFormModal from '@/app/components/Budget/BudgetFormModal';
import { getBudgets, getCategories } from '@/app/db';
import { BudgetHistory } from '@/app/db/types';
import { Category } from '@/app/db/types';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { useUser } from '@/app/contexts/UserContext';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import Link from 'next/link';

interface YearlyBudgetHistory {
  month: string;
  budget: number;
  spent: number;
  left: number;
}

const currentYear = new Date().getFullYear();
const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

const BudgetsPage = () => {
  const { user } = useUser();
  const { formatCurrency } = useCurrency();
  const [activeYear, setActiveYear] = useState(currentYear);
  const [budgetHistory, setBudgetHistory] = useState<BudgetHistory[]>([]);
  const [budgets, setBudgets] = useState<YearlyBudgetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetModalMode, setBudgetModalMode] = useState<'add' | 'edit'>('add');
  const [budgetModalMonth, setBudgetModalMonth] = useState<string>(currentMonthName);
  const [editingBudget, setEditingBudget] = useState<BudgetHistory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useLockBodyScroll(showBudgetModal);

  const getBudgetHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const budgetsOfTheYear: BudgetHistory[] = await getBudgets(user.id, 'year', activeYear);
      setBudgetHistory(budgetsOfTheYear);
    } catch (error) {
      console.error('Error fetching budget history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBudgetHistory();
  }, [activeYear, user?.id]);

  useEffect(() => {
    if (!user) return;
    getCategories(user.id).then((cats) => setCategories((cats ?? []) as Category[]));
  }, [user?.id]);

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

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getTotalBudget = () => budgets.reduce((acc, curr) => acc + curr.budget, 0);
  const getTotalSpent = () => budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const getTotalLeft = () => budgets.reduce((acc, curr) => acc + curr.left, 0);

  const isCurrentYear = activeYear === currentYear;
  const hasCurrentMonthBudget =
    isCurrentYear && budgetHistory.some((b) => b.month === currentMonthName);
  const canEditMonth = (month: string) => isCurrentYear && month === currentMonthName;

  const openAddForCurrentMonth = () => {
    if (categories.length === 0) return;
    setBudgetModalMode('add');
    setBudgetModalMonth(currentMonthName);
    setEditingBudget(null);
    setShowBudgetModal(true);
  };

  const hasCategories = categories.length > 0;

  const openEditMonth = (month: string) => {
    const existing = budgetHistory.find((b) => b.month === month);
    if (!existing) return;
    setBudgetModalMode('edit');
    setBudgetModalMonth(month);
    setEditingBudget(existing);
    setShowBudgetModal(true);
  };

  const closeBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const onBudgetModalSuccess = () => {
    getBudgetHistory();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Yearly Budgets
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                View and manage monthly budgets by year
              </p>
            </div>
            <div className="w-full md:w-auto">
              <PastFiveYearsDropdown selectedYear={activeYear} onYearChange={updateActiveYear} />
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="flex justify-center items-center h-48 md:h-64">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-2 border-border border-t-accent" />
          </div>
        )}

        {!isLoading && (
          <>
            <section aria-labelledby="year-summary-heading">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 id="year-summary-heading" className="text-lg font-semibold text-foreground">
                    {activeYear} at a glance
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Totals across all months in {activeYear}
                  </p>
                </div>
                {budgets.length > 0 && (
                  <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'cards'
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        viewMode === 'table'
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Budgeted in {activeYear}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1 md:mt-2">
                    {formatCurrency(getTotalBudget())}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Spent in {activeYear}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1 md:mt-2">
                    {formatCurrency(getTotalSpent())}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Remaining in {activeYear}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1 md:mt-2">
                    {formatCurrency(getTotalLeft())}
                  </p>
                </div>
              </div>
            </section>

            {isCurrentYear && !hasCurrentMonthBudget && (
              <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No budget for {currentMonthName} yet</h3>
                  {hasCategories ? (
                    <p className="text-sm text-muted-foreground mt-1">Add a budget for this month to start tracking.</p>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      Add at least one category first. Go to <Link href="/categories" className="underline font-medium text-foreground hover:text-accent">Categories</Link> to create one, then come back to add a budget.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={openAddForCurrentMonth}
                  disabled={!hasCategories}
                  className="shrink-0 px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
                >
                  Add budget for {currentMonthName}
                </button>
              </div>
            )}

            <section aria-labelledby="monthly-breakdown-heading">
              <h2 id="monthly-breakdown-heading" className="text-lg font-semibold text-foreground mb-4">
                By month
              </h2>
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {budgets.length ? (
                    budgets.map((budget) => {
                      const progress = getProgressPercentage(budget.spent, budget.budget);
                      const isOverBudget = budget.spent > budget.budget;
                      return (
                        <div
                          key={budget.month}
                          className="bg-card border border-border rounded-xl p-4 md:p-6"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base md:text-lg font-semibold text-foreground">{budget.month}</h3>
                            {canEditMonth(budget.month) && (
                              <button
                                type="button"
                                onClick={() => openEditMonth(budget.month)}
                                className="shrink-0 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-accent hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                title="Edit budget"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="flex justify-between items-start mt-2">
                            <div className="flex-1 min-w-0" />
                            <div className="flex flex-col items-end">
                              <span className={`text-sm md:text-base font-medium ${
                                isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {formatCurrency(budget.left)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isOverBudget ? 'Over budget' : 'Remaining'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-4">
                            <div className="flex justify-between text-xs md:text-sm mb-2">
                              <span className="text-sky-600 dark:text-sky-400">Budget: {formatCurrency(budget.budget)}</span>
                              <span className="text-rose-600 dark:text-rose-400">Spent: {formatCurrency(budget.spent)}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                                <div
                                  className={`absolute h-full transition-all duration-500 ${
                                    isOverBudget ? 'bg-rose-600' : 'bg-sky-600'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                                <div
                                  className={`absolute h-full transition-all duration-500 ${
                                    isOverBudget ? 'bg-rose-100' : 'bg-sky-100'
                                  }`}
                                  style={{ width: `${100 - progress}%`, left: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-sky-600'}`}>
                                  Utilized: {Math.round(progress)}%
                                </span>
                                <span className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-sky-600'}`}>
                                  Remaining: {Math.round(100 - progress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center">
                      <p className="text-foreground font-medium">No budgets recorded for {activeYear}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isCurrentYear
                          ? `Add a budget for ${currentMonthName} above to get started.`
                          : 'Budgets you add for the current year will show here.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {budgets.map((budget) => {
                          const progress = getProgressPercentage(budget.spent, budget.budget);
                          const isOverBudget = budget.spent > budget.budget;
                          return (
                            <tr key={budget.month} className="hover:bg-background/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{budget.month}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-600 dark:text-sky-400">{formatCurrency(budget.budget)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 dark:text-rose-400">{formatCurrency(budget.spent)}</td>
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
            </section>

            {showBudgetModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <BudgetFormModal
                  mode={budgetModalMode}
                  year={activeYear}
                  month={budgetModalMonth}
                  userId={user.id}
                  existingBudget={editingBudget}
                  onClose={closeBudgetModal}
                  onSuccess={onBudgetModalSuccess}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
