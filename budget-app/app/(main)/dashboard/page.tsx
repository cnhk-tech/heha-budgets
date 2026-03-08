'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { getBudgets, getCategories } from '@/app/db';
import { Budget, BudgetHistory, Category } from '@/app/db/types';
import PayModal from '@/app/components/Pay/PayModal';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { useUser } from '@/app/contexts/UserContext';

const DashboardPage = () => {
  const { user } = useUser();
  const { formatCurrency } = useCurrency();
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<BudgetHistory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCategoryName, setPayCategoryName] = useState<string | undefined>(undefined);
  const [payBudgetLeft, setPayBudgetLeft] = useState<number | undefined>(undefined);
  const [payCategoryId, setPayCategoryId] = useState<number | undefined>(undefined);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = format(currentDate, 'MMMM');
  const daysLeftInMonth = differenceInDays(
    new Date(currentYear, currentDate.getMonth() + 1, 0),
    currentDate
  );

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [budgets, cats] = await Promise.all([
        getBudgets(user.id, 'year', currentYear) as Promise<BudgetHistory[]>,
        getCategories(user.id) as Promise<Category[]>,
      ]);
      const currentMonthData = budgets.find((b) => b.month === currentMonth);
      setCurrentMonthBudgets(currentMonthData ? [currentMonthData] : []);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const getTotalBudget = (budgets: BudgetHistory[]) =>
    budgets.reduce(
      (acc, curr) =>
        acc + curr.budgets.reduce((sum: number, b: Budget) => sum + b.budget, 0),
      0
    );
  const getTotalSpent = (budgets: BudgetHistory[]) =>
    budgets.reduce(
      (acc, curr) =>
        acc + curr.budgets.reduce((sum: number, b: Budget) => sum + b.spent, 0),
      0
    );
  const getTotalLeft = (budgets: BudgetHistory[]) =>
    budgets.reduce(
      (acc, curr) =>
        acc + curr.budgets.reduce((sum: number, b: Budget) => sum + b.left, 0),
      0
    );

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? `Category ${categoryId}`;
  const getCategoryIcon = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.icon ?? '📁';

  const totalBudget = getTotalBudget(currentMonthBudgets);
  const totalSpent = getTotalSpent(currentMonthBudgets);
  const totalLeft = getTotalLeft(currentMonthBudgets);
  const categoryCount = currentMonthBudgets[0]?.budgets.length ?? 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Overview
              </h1>
              <p className="text-muted-foreground mt-1">
                Your {currentMonth} {currentYear} budget at a glance
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-card border border-border w-fit"
              aria-label={`${daysLeftInMonth} days left in ${currentMonth}`}
            >
              <span className="text-base sm:text-2xl font-semibold sm:font-bold text-foreground tabular-nums">
                {daysLeftInMonth}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                <span className="sm:hidden">days left</span>
                <span className="hidden sm:inline">days left in {currentMonth}</span>
              </span>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-accent" />
            <p className="text-sm text-muted-foreground">Loading your budget…</p>
          </div>
        ) : (
          <>
            <section className="space-y-4" aria-labelledby="summary-heading">
              <div>
                <h2 id="summary-heading" className="text-lg font-semibold text-foreground">
                  This month&apos;s totals
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {categoryCount > 0
                    ? `Across ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}`
                    : 'Add a budget to see totals'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Budgeted
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Spent
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Remaining
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(totalLeft)}
                  </p>
                </div>
              </div>
            </section>

            <section
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
              aria-labelledby="categories-heading"
            >
              <div className="mb-6">
                <h2 id="categories-heading" className="text-lg font-semibold text-foreground">
                  Spending by category
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentMonth} {currentYear}
                </p>
              </div>

              {currentMonthBudgets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMonthBudgets[0].budgets.map((budget: Budget, index: number) => {
                    const utilization =
                      budget.budget > 0
                        ? Math.min((budget.spent / budget.budget) * 100, 100)
                        : 0;
                    const isOver = budget.spent > budget.budget;
                    const categoryName = getCategoryName(budget.categoryId);
                    return (
                      <div
                        key={`${budget.categoryId}-${index}`}
                        className="bg-background border border-border rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 bg-card rounded-lg border border-border shrink-0">
                              <span className="text-xl" aria-hidden>
                                {getCategoryIcon(budget.categoryId)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {categoryName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatCurrency(budget.budget)} budgeted
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold shrink-0 ${
                              isOver
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {formatCurrency(budget.left)} left
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Spent</span>
                            <span className="text-foreground font-medium">
                              {formatCurrency(budget.spent)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Utilization</span>
                            <span
                              className={
                                isOver
                                  ? 'text-rose-600 dark:text-rose-400 font-medium'
                                  : 'text-foreground font-medium'
                              }
                            >
                              {Math.round(utilization)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOver ? 'bg-rose-600' : 'bg-accent'
                              }`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPayCategoryName(categoryName);
                              setPayBudgetLeft(budget.left);
                              setPayCategoryId(budget.categoryId);
                              setShowPayModal(true);
                            }}
                            className="w-full mt-2 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-accent/10 hover:border-accent transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span aria-hidden>💳</span>
                            Pay
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-dashed border-border bg-background/50">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <p className="text-foreground font-medium">
                    No budget set for {currentMonth} {currentYear}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Add a budget on the Budgets page to track spending by category.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                      href="/budgets"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      Go to Budgets
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {showPayModal && user && (
              <PayModal
                onClose={() => {
                  setShowPayModal(false);
                  setPayBudgetLeft(undefined);
                  setPayCategoryId(undefined);
                  fetchData();
                }}
                categoryName={payCategoryName}
                budgetLeft={payBudgetLeft}
                categoryId={payCategoryId}
                year={currentYear}
                month={currentMonth}
                userId={user.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
