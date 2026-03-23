'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Category, Categorytype } from '@/app/db/types';
import { getCategories, addCategory } from '@/app/db';
import CategoryList from '@/app/components/Category/List';
import AddCategory from '@/app/components/Category/Add';
import { useUser } from '@/app/contexts/UserContext';
import { parseCategoriesJson, type ExportCategory } from '@/app/lib/exportProfileData';
import { ModalPortal } from '@/app/components/ModalPortal';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';

export default function CategoriesPage() {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<Categorytype | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isExiting, setIsExiting] = useState(false);
  const [importPreview, setImportPreview] = useState<ExportCategory[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [emptyImportWarning, setEmptyImportWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    const fetchedCategories = (await getCategories(user.id)) as Category[];
    setCategories(fetchedCategories);
  }, [user]);

  useLockBodyScroll(showAddForm || !!importPreview || !!emptyImportWarning);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategoryClick = (type: Categorytype, editingCategory?: Category) => {
    setSelectedType(type);
    setEditingCategory(editingCategory);
    setIsExiting(false);
    setShowAddForm(true);
  };

  const handleCategoryUpdate = () => {
    setIsExiting(true);
    setTimeout(() => {
      fetchCategories();
      setShowAddForm(false);
      setEditingCategory(undefined);
      setIsExiting(false);
    }, 200);
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setImportError(null);
    setImportPreview(null);
    if (!file || !file.name.toLowerCase().endsWith('.json')) {
      setImportError('Please choose a .json file (e.g. categories export).');
      return;
    }
    try {
      const list = await parseCategoriesJson(file);
      if (list.length === 0) {
        setEmptyImportWarning('No categories found in the file. The file is empty or has no valid categories.');
        return;
      }
      setImportPreview(list);
      setSelectedIndices(new Set(list.map((_, i) => i)));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON or format.');
    }
  };

  const toggleSelectAll = () => {
    if (!importPreview) return;
    if (selectedIndices.size === importPreview.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(importPreview.map((_, i) => i)));
    }
  };

  const toggleCategory = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleImportSelected = async () => {
    if (!user || !importPreview) return;
    const toAdd = importPreview.filter((_, i) => selectedIndices.has(i));
    if (toAdd.length === 0) return;
    setImporting(true);
    try {
      for (const c of toAdd) {
        const type = c.type === Categorytype.Weekly ? Categorytype.Weekly : Categorytype.Monthly;
        await addCategory({ userId: user.id, name: c.name, type, icon: c.icon });
      }
      setImportSuccess(toAdd.length);
      setImportPreview(null);
      setSelectedIndices(new Set());
      setImportError(null);
      setTimeout(() => setImportSuccess(null), 4000);
      fetchCategories();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to add some categories.');
    } finally {
      setImporting(false);
    }
  };

  const closeImportPreview = () => {
    setImportPreview(null);
    setImportError(null);
    setSelectedIndices(new Set());
  };

  const closeEmptyImportWarning = () => {
    setEmptyImportWarning(null);
  };

  if (!user) return null;

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        <header>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Categories
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">
                Organize your spending with monthly and weekly categories. Add emojis and names to stay on track.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Import from file
              </button>
              {importError && (
                <p className="text-sm text-destructive" role="alert">{importError}</p>
              )}
              {importSuccess !== null && (
                <p className="text-sm text-green-600 dark:text-green-400" role="status">
                  Imported {importSuccess} categor{importSuccess === 1 ? 'y' : 'ies'}.
                </p>
              )}
            </div>
          </div>
        </header>

        {showAddForm && selectedType && (
        <ModalPortal
          className={`flex items-center justify-center p-4 transition-[background-color,filter] duration-300 ease-out ${
            isExiting ? 'bg-black/0 backdrop-blur-0' : 'bg-black/50 backdrop-blur-sm'
          }`}
        >
          <div
            className={`transition-all duration-300 ease-out ${
              isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-scale-in'
            }`}
          >
            <AddCategory
              requestCategoryType={selectedType}
              onClose={handleCategoryUpdate}
              editingCategory={editingCategory}
              userId={user.id}
            />
          </div>
        </ModalPortal>
      )}

        {importPreview && (
          <ModalPortal className="flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-border">
                <h2 id="import-modal-title" className="text-lg font-semibold text-foreground">
                  Import categories
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {importPreview.length} categor{importPreview.length === 1 ? 'y' : 'ies'} from file
                </p>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {selectedIndices.size === importPreview.length ? 'Deselect all' : 'Select all'}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {selectedIndices.size} of {importPreview.length} selected
                  </span>
                </div>
                <ul className="space-y-2">
                  {importPreview.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <input
                        type="checkbox"
                        id={`import-cat-${i}`}
                        checked={selectedIndices.has(i)}
                        onChange={() => toggleCategory(i)}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      <label htmlFor={`import-cat-${i}`} className="flex-1 flex items-center gap-2 cursor-pointer">
                        <span className="text-lg" aria-hidden>{c.icon}</span>
                        <span className="text-foreground font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">({c.type})</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t border-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeImportPreview}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={importing || selectedIndices.size === 0}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-accent-foreground border-t-transparent inline-block align-middle mr-1" />
                      Importing…
                    </>
                  ) : (
                    <>Import selected ({selectedIndices.size})</>
                  )}
                </button>
              </div>
            </div>
          </ModalPortal>
        )}

        {emptyImportWarning && (
          <ModalPortal className="flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="empty-import-warning-title">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6">
              <h2 id="empty-import-warning-title" className="text-lg font-semibold text-foreground">
                No categories in file
              </h2>
              <p className="text-sm text-muted-foreground mt-2">{emptyImportWarning}</p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeEmptyImportWarning}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90"
                >
                  Back to categories
                </button>
              </div>
            </div>
          </ModalPortal>
        )}

        <CategoryList
          categories={categories}
          onAddCategoryClick={handleAddCategoryClick}
          onCategoryUpdate={handleCategoryUpdate}
        />
      </div>
    </div>
  );
}
