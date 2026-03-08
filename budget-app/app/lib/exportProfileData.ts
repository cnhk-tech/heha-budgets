/**
 * Export profile data in an import-friendly format.
 * Produces: manifest.json, categories.json, budgets.json zipped together.
 */

import JSZip from 'jszip';
import { getCategories, getBudgets } from '@/app/db';
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

export async function exportProfileData(user: User): Promise<Blob> {
  const [categories, budgetHistories] = await Promise.all([
    getCategories(user.id),
    getBudgets(user.id),
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

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('categories.json', JSON.stringify(categoriesExport, null, 2));
  zip.file('budgets.json', JSON.stringify(budgetsExport, null, 2));

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
  return `heha-budgets-export-${safe}-${date}.zip`;
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
