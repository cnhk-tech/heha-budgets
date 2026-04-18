/**
 * Export profile data in an import-friendly format.
 * Produces: manifest.json, categories.json, budgets.json, transactions.json zipped together.
 */

import JSZip from 'jszip';
import { getCategories, getBudgets, getSpendingTransactions } from '@/app/db';
import type { User } from '@/app/db/types';

const SCHEMA_VERSION = 1;

export type ExportManifest = {
  schemaVersion: number;
  exportedAt: string;
  profile: { name: string; currency: string };
};

export type ExportCategory = {
  id: number;
  name: string;
  type: string;
  icon: string;
};

export type ExportBudgetEntry = {
  categoryId: number;
  budget: number;
  spent: number;
  left: number;
};

export type ExportBudgetMonth = {
  year: number;
  month: string;
  budgets: ExportBudgetEntry[];
};

export type ExportTransaction = {
  categoryId: number;
  categoryName: string;
  amount: number;
  year: number;
  month: string;
  status: string;
  createdAt: string;
  reason?: string;
  upiId?: string;
  payeeName?: string;
};

export async function exportProfileData(user: User): Promise<Blob> {
  const [categories, budgetHistories, spendingTxs] = await Promise.all([
    getCategories(user.id),
    getBudgets(user.id),
    getSpendingTransactions(user.id),
  ]);

  const manifest: ExportManifest = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: { name: user.name, currency: user.currency },
  };

  const categoriesExport: ExportCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
  }));

  const budgetsExport: ExportBudgetMonth[] = budgetHistories.map((b) => ({
    year: b.year,
    month: b.month,
    budgets: b.budgets.map((line) => ({
      categoryId: line.categoryId,
      budget: line.budget,
      spent: line.spent,
      left: line.left,
    })),
  }));

  const transactionsExport: ExportTransaction[] = spendingTxs.map((t) => ({
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    amount: t.amount,
    year: t.year,
    month: t.month,
    status: t.status,
    createdAt: t.createdAt,
    ...(t.reason ? { reason: t.reason } : {}),
    ...(t.upiId ? { upiId: t.upiId } : {}),
    ...(t.payeeName ? { payeeName: t.payeeName } : {}),
  }));

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('categories.json', JSON.stringify(categoriesExport, null, 2));
  zip.file('budgets.json', JSON.stringify(budgetsExport, null, 2));
  zip.file('transactions.json', JSON.stringify(transactionsExport, null, 2));

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getExportFilename(profileName: string): string {
  const safe = profileName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 30) || 'profile';
  const date = new Date().toISOString().slice(0, 10);
  return `h2-export-${safe}-${date}.zip`;
}

const EXPORT_SCHEMA_VERSION = 1;

/**
 * Parse an exported .zip file and return manifest + categories for import preview.
 */
export async function parseExportZip(file: File): Promise<{
  manifest: ExportManifest;
  categories: ExportCategory[];
}> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  const manifestFile = zip.file('manifest.json');
  const categoriesFile = zip.file('categories.json');
  if (!manifestFile || !categoriesFile) {
    throw new Error('Invalid export file: missing manifest.json or categories.json');
  }
  const manifestStr = await manifestFile.async('string');
  const categoriesStr = await categoriesFile.async('string');
  const manifest = JSON.parse(manifestStr) as ExportManifest;
  const categories = JSON.parse(categoriesStr) as ExportCategory[];
  if (manifest.schemaVersion !== EXPORT_SCHEMA_VERSION) {
    throw new Error(`Unsupported export version: ${manifest.schemaVersion}`);
  }
  if (!Array.isArray(categories)) {
    throw new Error('Invalid export file: categories.json must be an array');
  }
  return { manifest, categories };
}

/**
 * Parse a budgets.json (from export zip or standalone).
 * Returns structured array matching ExportBudgetMonth[].
 */
export async function parseBudgetsJson(file: File): Promise<ExportBudgetMonth[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of budget months.');
  }
  return data.map((item: unknown, index: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Invalid budget entry at position ${index}.`);
    }
    const o = item as Record<string, unknown>;
    const year = typeof o.year === 'number' ? o.year : NaN;
    const month = typeof o.month === 'string' ? o.month.trim() : '';
    if (!year || !month) {
      throw new Error(`Budget at position ${index} is missing year or month.`);
    }
    if (!Array.isArray(o.budgets)) {
      throw new Error(`Budget at position ${index} has no budgets array.`);
    }
    const budgets: ExportBudgetEntry[] = (o.budgets as unknown[]).map((b: unknown) => {
      const bo = b as Record<string, unknown>;
      return {
        categoryId: typeof bo.categoryId === 'number' ? bo.categoryId : 0,
        budget: typeof bo.budget === 'number' ? bo.budget : 0,
        spent: typeof bo.spent === 'number' ? bo.spent : 0,
        left: typeof bo.left === 'number' ? bo.left : 0,
      };
    });
    return { year, month, budgets };
  });
}

/**
 * Parse a transactions.json (from export zip or standalone).
 * Returns structured array matching ExportTransaction[].
 */
export async function parseTransactionsJson(file: File): Promise<ExportTransaction[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of transactions.');
  }
  return data.map((item: unknown, index: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Invalid transaction at position ${index}.`);
    }
    const o = item as Record<string, unknown>;
    const categoryId = typeof o.categoryId === 'number' ? o.categoryId : 0;
    const categoryName = typeof o.categoryName === 'string' ? o.categoryName : 'Category';
    const amount = typeof o.amount === 'number' ? o.amount : 0;
    const year = typeof o.year === 'number' ? o.year : NaN;
    const month = typeof o.month === 'string' ? o.month.trim() : '';
    const status = typeof o.status === 'string' ? o.status : 'success';
    const createdAt = typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString();
    if (!year || !month || amount <= 0) {
      throw new Error(`Transaction at position ${index} has missing/invalid year, month, or amount.`);
    }
    return {
      categoryId,
      categoryName,
      amount,
      year,
      month,
      status,
      createdAt,
      ...(typeof o.reason === 'string' && o.reason.trim() ? { reason: o.reason.trim() } : {}),
      ...(typeof o.upiId === 'string' && o.upiId.trim() ? { upiId: o.upiId.trim() } : {}),
      ...(typeof o.payeeName === 'string' && o.payeeName.trim() ? { payeeName: o.payeeName.trim() } : {}),
    };
  });
}

/**
 * Parse a .json file containing an array of category objects.
 * Each item must have name, type, and icon; id is optional (assigned by index).
 */
export async function parseCategoriesJson(file: File): Promise<ExportCategory[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of categories.');
  }
  const categories: ExportCategory[] = data.map((item: unknown, index: number) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Invalid category at position ${index}.`);
    }
    const o = item as Record<string, unknown>;
    const name = typeof o.name === 'string' ? o.name : '';
    const type = typeof o.type === 'string' ? o.type : 'Monthly';
    const icon = typeof o.icon === 'string' ? o.icon : '📁';
    if (!name.trim()) {
      throw new Error(`Category at position ${index} is missing a name.`);
    }
    return {
      id: typeof o.id === 'number' ? o.id : index,
      name: name.trim(),
      type: type === 'Weekly' ? 'Weekly' : 'Monthly',
      icon: icon || '📁',
    };
  });
  return categories;
}
