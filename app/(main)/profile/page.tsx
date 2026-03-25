'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { useCurrency, CURRENCIES, type CurrencyCode } from '@/app/contexts/CurrencyContext';
import { exportProfileData, downloadBlob, getExportFilename } from '@/app/lib/exportProfileData';
import { parseImportZip, importAll, type ImportPreview, type ImportSummary } from '@/app/lib/importProfileData';
import { deleteUser } from '@/app/db';
import { ModalPortal } from '@/app/components/ModalPortal';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { currency, setCurrency } = useCurrency();
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useLockBodyScroll(showDeleteConfirm || showImport);

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setDeleteConfirmName('');
    setDeleteError(null);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmName('');
    setDeleteError(null);
  };

  const nameMatches = user?.name.trim().toLowerCase() === deleteConfirmName.trim().toLowerCase();

  const handleDeleteAccount = async () => {
    if (!user || !nameMatches) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(user.id);
      await logout();
      router.push('/');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const blob = await exportProfileData(user);
      downloadBlob(blob, getExportFilename(user.name));
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (importFileRef.current) importFileRef.current.value = '';
    if (!file) return;
    setImportError(null);
    setImportPreview(null);
    setImportResult(null);
    setImportProgress(null);
    try {
      const preview = await parseImportZip(file);
      setImportPreview(preview);
      setShowImport(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not read backup file.');
      setShowImport(true);
    }
  };

  const handleImportConfirm = async () => {
    if (!user || !importPreview) return;
    setImporting(true);
    setImportError(null);
    try {
      const result = await importAll(user.id, importPreview, setImportProgress);
      setImportResult(result);
      setImportPreview(null);
      setImportProgress(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setShowImport(false);
    setImportPreview(null);
    setImportError(null);
    setImportResult(null);
    setImportProgress(null);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">Your account and display preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
          <p className="text-foreground font-medium">{user?.name ?? '—'}</p>
        </div>

        <div>
          <label htmlFor="profile-currency" className="block text-sm font-medium text-foreground mb-2">
            Display currency
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            All amounts on the site will be shown in this currency (display only, no conversion).
          </p>
          <select
            id="profile-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Account</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Back up your data or permanently delete this profile.
        </p>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-border">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Backup profile data</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Download a .zip of your categories and budgets. You can restore it into another profile later.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 inline-flex items-center justify-center gap-2 min-w-[10.5rem] px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-accent-foreground border-t-transparent" />
                  Exporting…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Backup (.zip)
                </>
              )}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-border">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Restore from backup</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Import categories, budgets, and transactions from an H² backup .zip. Category IDs are remapped automatically.
              </p>
            </div>
            <div>
              <input
                ref={importFileRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                disabled={importing}
                className="shrink-0 inline-flex items-center justify-center gap-2 min-w-[10.5rem] px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import (.zip)
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently remove this profile and all its categories and budgets. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={openDeleteConfirm}
              className="shrink-0 inline-flex items-center justify-center gap-2 min-w-[10.5rem] px-4 py-2.5 text-sm font-medium rounded-xl border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {showImport && (
        <ModalPortal className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-title">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto space-y-4">
            <h2 id="import-title" className="text-lg font-semibold text-foreground">Restore from backup</h2>

            {importResult && (
              <div className="rounded-xl bg-accent/10 border border-accent/30 px-4 py-4 space-y-2">
                <p className="text-sm font-semibold text-accent">Import complete</p>
                <ul className="text-sm text-foreground space-y-1">
                  {importResult.categories > 0 && <li>{importResult.categories} new {importResult.categories === 1 ? 'category' : 'categories'} created</li>}
                  <li>{importResult.budgetMonths} budget month{importResult.budgetMonths === 1 ? '' : 's'} imported</li>
                  <li>{importResult.transactions} transaction{importResult.transactions === 1 ? '' : 's'} imported</li>
                </ul>
              </div>
            )}

            {importError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
                <p className="text-sm text-rose-600 dark:text-rose-400">{importError}</p>
              </div>
            )}

            {importing && importProgress && (
              <div className="flex items-center gap-3 py-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent shrink-0" />
                <p className="text-sm text-muted-foreground">{importProgress}</p>
              </div>
            )}

            {importPreview && !importResult && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Backup from <strong className="text-foreground">{importPreview.manifest.profile.name}</strong>
                  {' '}({new Date(importPreview.manifest.exportedAt).toLocaleDateString()})
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/50 border border-border px-3 py-3 text-center">
                    <p className="text-xl font-bold text-foreground">{importPreview.categories.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{importPreview.categories.length === 1 ? 'Category' : 'Categories'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 border border-border px-3 py-3 text-center">
                    <p className="text-xl font-bold text-foreground">{importPreview.budgets.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Budget month{importPreview.budgets.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 border border-border px-3 py-3 text-center">
                    <p className="text-xl font-bold text-foreground">{importPreview.transactions.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Transaction{importPreview.transactions.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Categories are matched by <strong>name</strong>. New ones will be created. Existing budget months will be <strong>overwritten</strong>. Transactions are always added (not deduplicated).
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeImport}
                disabled={importing}
                className="min-h-[44px] w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 sm:w-auto sm:min-w-[6rem]"
              >
                {importResult ? 'Done' : 'Cancel'}
              </button>
              {importPreview && !importResult && (
                <button
                  type="button"
                  onClick={handleImportConfirm}
                  disabled={importing}
                  className="min-h-[44px] w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50 sm:w-auto sm:min-w-[6rem]"
                >
                  {importing ? 'Importing…' : 'Import all'}
                </button>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

      {showDeleteConfirm && (
        <ModalPortal className="flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 id="delete-account-title" className="text-lg font-semibold text-foreground">
              Delete account?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              This will permanently delete <strong>{user?.name}</strong> and all associated categories and budgets. This cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You can back up your data first using <strong>Backup profile data (.zip)</strong> above to download your categories and budgets.
            </p>
            <label htmlFor="delete-confirm-name" className="block text-sm font-medium text-foreground mt-4 mb-1">
              Type <strong>{user?.name}</strong> to confirm
            </label>
            <input
              id="delete-confirm-name"
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Profile name"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              autoComplete="off"
              disabled={deleting}
            />
            {deleteError && (
              <p className="mt-2 text-sm text-destructive" role="alert">{deleteError}</p>
            )}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="min-w-[10.5rem] px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!nameMatches || deleting}
                className="min-w-[10.5rem] px-4 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
      </div>
    </div>
  );
}
