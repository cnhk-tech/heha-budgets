'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/app/db';
import { addBudgetForMonth, updateBudget } from '@/app/db';
import { Budget, BudgetHistory, Category } from '@/app/db/types';
import { useCurrency } from '@/app/contexts/CurrencyContext';

type Mode = 'add' | 'edit';

type Props = {
  mode: Mode;
  year: number;
  month: string;
  userId: number;
  existingBudget?: BudgetHistory | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BudgetFormModal({
  mode,
  year,
  month,
  userId,
  existingBudget,
  onClose,
  onSuccess,
}: Props) {
  const { formatCurrency, currencySymbol } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lines, setLines] = useState<{ categoryId: number; budget: number; spent: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cats = (await getCategories(userId)) as Category[];
      if (cancelled) return;
      setCategories(cats);
      if (mode === 'edit' && existingBudget?.budgets?.length) {
        setLines(
          existingBudget.budgets.map((b) => ({
            categoryId: b.categoryId,
            budget: b.budget,
            spent: b.spent,
          }))
        );
      } else {
        setLines([]);
      }
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mode, existingBudget, userId]);

  const getCategory = (id: number) => categories.find((c) => c.id === id);

  const setLineBudget = (categoryId: number, value: number) => {
    const v = Math.max(0, value);
    setLines((prev) => {
      const i = prev.findIndex((l) => l.categoryId === categoryId);
      if (i >= 0) {
        const n = [...prev];
        n[i] = { ...n[i], budget: v };
        return n;
      }
      return [...prev, { categoryId, budget: v, spent: 0 }];
    });
  };

  const addCategoryLine = (categoryId: number) => {
    if (lines.some((l) => l.categoryId === categoryId)) return;
    setLines((prev) => [...prev, { categoryId, budget: 0, spent: 0 }]);
  };

  const removeLine = (categoryId: number) => {
    setLines((prev) => prev.filter((l) => l.categoryId !== categoryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const budgets: Budget[] = lines
      .filter((l) => l.budget > 0)
      .map((l) => ({
        categoryId: l.categoryId,
        budget: l.budget,
        spent: l.spent,
        left: l.budget - l.spent,
      }));
    if (budgets.length === 0) {
      setError('Add at least one category with a budget amount.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await addBudgetForMonth(budgets, year, month, userId);
      } else {
        await updateBudget(userId, year, month, budgets);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryIdsInLines = new Set(lines.map((l) => l.categoryId));
  const availableToAdd = categories.filter((c) => !categoryIdsInLines.has(c.id));

  if (isLoading) {
    return (
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {mode === 'add' ? `Add budget` : `Edit budget`} — {month} {year}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {lines.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              {mode === 'add' ? 'Add categories below, then enter the budget amount for each.' : 'No categories in this budget.'}
            </p>
          )}
          {lines.length > 0 && (
            <p className="text-sm text-muted-foreground pb-1">
              Enter how much you want to budget for each category this month. Amounts are in {currencySymbol}.
            </p>
          )}
          {lines.map((line) => {
            const cat = getCategory(line.categoryId);
            if (!cat) return null;
            return (
              <div
                key={line.categoryId}
                className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
              >
                <span className="text-2xl shrink-0" aria-hidden>{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{cat.name}</p>
                  {mode === 'edit' && line.spent > 0 && (
                    <p className="text-xs text-muted-foreground">Spent: {formatCurrency(line.spent)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor={`budget-${line.categoryId}`} className="sr-only">Budget amount for {cat.name} ({currencySymbol})</label>
                  <div className="flex items-center rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent">
                    <input
                      id={`budget-${line.categoryId}`}
                      type="number"
                      min={0}
                      step={1}
                      value={line.budget || ''}
                      onChange={(e) => setLineBudget(line.categoryId, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      aria-label={`Budget amount for ${cat.name} in ${currencySymbol}`}
                      className="w-28 px-3 py-2.5 rounded-lg bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
                    />
                    <span className="pr-3 text-sm text-muted-foreground pointer-events-none" aria-hidden>
                      {currencySymbol}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.categoryId)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    aria-label={`Remove ${cat.name} from budget`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {availableToAdd.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Add category</p>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => addCategoryLine(cat.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {isSubmitting ? (mode === 'add' ? 'Adding…' : 'Saving…') : mode === 'add' ? 'Add budget' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
