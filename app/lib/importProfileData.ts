/**
 * Unified import: reads an H² export .zip, remaps category IDs, and writes
 * categories → budgets → transactions in one go for a target user.
 */

import JSZip from 'jszip';
import { addCategory, getCategories, importBudgetForMonth, addExpense } from '@/app/db';
import { addSpendingTransaction } from '@/app/db/transactions';
import { Categorytype } from '@/app/db/types';
import type { Category, TransactionStatus } from '@/app/db/types';
import type {
  ExportManifest,
  ExportCategory,
  ExportBudgetMonth,
  ExportTransaction,
} from './exportProfileData';

const SUPPORTED_SCHEMA = 1;

export type ImportSummary = {
  categories: number;
  budgetMonths: number;
  transactions: number;
};

export type ImportPreview = {
  manifest: ExportManifest;
  categories: ExportCategory[];
  budgets: ExportBudgetMonth[];
  transactions: ExportTransaction[];
};

/** Parse the zip and return a preview of what will be imported. */
export async function parseImportZip(file: File): Promise<ImportPreview> {
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) throw new Error('Invalid backup: missing manifest.json');
  const manifest = JSON.parse(await manifestFile.async('string')) as ExportManifest;
  if (manifest.schemaVersion !== SUPPORTED_SCHEMA) {
    throw new Error(`Unsupported backup version ${manifest.schemaVersion} (expected ${SUPPORTED_SCHEMA}).`);
  }

  const catFile = zip.file('categories.json');
  const categories: ExportCategory[] = catFile
    ? JSON.parse(await catFile.async('string'))
    : [];

  const budFile = zip.file('budgets.json');
  const budgets: ExportBudgetMonth[] = budFile
    ? JSON.parse(await budFile.async('string'))
    : [];

  const txFile = zip.file('transactions.json');
  const transactions: ExportTransaction[] = txFile
    ? JSON.parse(await txFile.async('string'))
    : [];

  return { manifest, categories, budgets, transactions };
}

/**
 * Import everything into the given user's profile.
 *
 * 1. Categories → matched by **name** (case-insensitive). Missing ones are created.
 * 2. Old→new category ID map is built.
 * 3. Budgets → category IDs remapped, then upserted per month.
 * 4. Transactions → category IDs remapped, inserted; success rows also update spent.
 */
export async function importAll(
  userId: number,
  preview: ImportPreview,
  onProgress?: (step: string) => void
): Promise<ImportSummary> {
  const summary: ImportSummary = { categories: 0, budgetMonths: 0, transactions: 0 };

  // --- 1. Categories: match by name or create new ---
  onProgress?.('Importing categories…');
  const existingCats = (await getCategories(userId)) as Category[];
  const nameToId = new Map(existingCats.map((c) => [c.name.trim().toLowerCase(), c.id]));
  const oldIdToNewId = new Map<number, number>();

  for (const cat of preview.categories) {
    const key = cat.name.trim().toLowerCase();
    const existing = nameToId.get(key);
    if (existing != null) {
      oldIdToNewId.set(cat.id, existing);
    } else {
      const ok = await addCategory({
        userId,
        name: cat.name.trim(),
        type: cat.type === 'Weekly' ? Categorytype.Weekly : Categorytype.Monthly,
        icon: cat.icon || '📁',
      });
      if (ok) {
        const refreshed = (await getCategories(userId)) as Category[];
        const created = refreshed.find((c) => c.name.trim().toLowerCase() === key);
        if (created) {
          oldIdToNewId.set(cat.id, created.id);
          nameToId.set(key, created.id);
        }
      }
      summary.categories++;
    }
  }

  const remap = (oldId: number) => oldIdToNewId.get(oldId) ?? oldId;

  // --- 2. Budgets: remap category IDs, upsert ---
  onProgress?.('Importing budgets…');
  for (const month of preview.budgets) {
    const remapped = month.budgets.map((b) => ({
      ...b,
      categoryId: remap(b.categoryId),
    }));
    await importBudgetForMonth(remapped, month.year, month.month, userId);
    summary.budgetMonths++;
  }

  // --- 3. Transactions: remap category IDs, insert + update spent ---
  onProgress?.('Importing transactions…');
  for (const tx of preview.transactions) {
    const newCatId = remap(tx.categoryId);
    await addSpendingTransaction({
      userId,
      categoryId: newCatId,
      categoryName: tx.categoryName,
      amount: tx.amount,
      year: tx.year,
      month: tx.month,
      status: tx.status as TransactionStatus,
      createdAt: tx.createdAt,
      ...(tx.upiId ? { upiId: tx.upiId } : {}),
      ...(tx.payeeName ? { payeeName: tx.payeeName } : {}),
    });
    if (tx.status === 'success') {
      try {
        await addExpense(userId, tx.year, tx.month, newCatId, tx.amount);
      } catch {
        // budget month may not exist for old transactions — skip spend update
      }
    }
    summary.transactions++;
  }

  return summary;
}
