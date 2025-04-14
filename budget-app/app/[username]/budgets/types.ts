type Budget = {
  category: number;
  budget: number;
  spent: number;
  left: number;
};

type BudgetHistory = {
  year: number;
  month: string;
  budgets: Budget[];
};

type YearlyBudgetHistory = {
  month: string;
  budget: number;
  spent: number;
  left: number;
};

export type { YearlyBudgetHistory, BudgetHistory };