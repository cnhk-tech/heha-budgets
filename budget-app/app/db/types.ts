export enum Stores {
  Categories = 'categories',
  Budgets = 'budgets',
}

export enum Categorytype {
  Monthly = "Monthly",
  Weekly = "Weekly",
}
  
export type Budget = {
  categoryId: number;
  budget: number;
  spent: number;
  left: number;
}

export interface BudgetHistory {
  year: number;
  month: string;
  budgets: Budget[];
}

export interface Category {
  id: number;
  name: string;
  type: Categorytype;
  icon: string;
}
