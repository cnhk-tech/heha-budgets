export enum Stores {
  Users = 'users',
  AppMeta = 'appMeta',
  Categories = 'categories',
  Budgets = 'budgets',
  Transactions = 'transactions',
}

export type TransactionStatus = 'success' | 'failed';

/** Logged when user completes or cancels a Pay flow (UPI), per category. */
export interface SpendingTransaction {
  id?: number;
  userId: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  year: number;
  month: string;
  status: TransactionStatus;
  createdAt: string;
  /** UPI VPA (e.g. name@upi) used for the pay intent. */
  upiId?: string;
  payeeName?: string;
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
