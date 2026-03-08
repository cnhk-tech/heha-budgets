export enum Stores {
  Users = 'users',
  AppMeta = 'appMeta',
  Categories = 'categories',
  Budgets = 'budgets',
}

export interface User {
  id: number;
  name: string;
  currency: string;
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
  userId: number;
  year: number;
  month: string;
  budgets: Budget[];
}

export interface Category {
  id: number;
  userId: number;
  name: string;
  type: Categorytype;
  icon: string;
}
