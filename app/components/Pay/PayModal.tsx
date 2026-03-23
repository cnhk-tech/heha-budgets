'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ModalPortal } from '@/app/components/ModalPortal';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import { addExpense } from '@/app/db/budgets';
import { addSpendingTransaction, buildTransactionPayload } from '@/app/db/transactions';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import {
  parseUPIString,
  buildUpiPayUrl,
  openUpiDeepLink,
  makeUpiTransactionRef,
} from '@/app/lib/upi';

type PayMode = 'scan' | 'upi';
type PayStep = 'form' | 'awaiting' | 'recording' | 'done';

const QR_READER_ID = 'pay-modal-qr-reader';

/** Prefer rear/environment camera; deprioritize front/selfie by device label (browser-dependent). */
function sortCamerasBackFirst(cameras: Array<{ id: string; label: string }>) {
  const score = (label: string) => {
    const l = label.toLowerCase();
    if (
      /back|rear|environment|world|wide|tele|ultra|primary|camera\s*2|camera\s*3|0\s*\)|\boutward/i.test(l) &&
      !/front|user|face|selfie|facetime|inward/i.test(l)
    ) {
      return 3;
    }
    if (/front|user|face|selfie|facetime|inward|1\s*\)/i.test(l)) return 0;
    return 1;
  };
  return [...cameras].sort((a, b) => score(b.label) - score(a.label));
}

/** Human-readable camera errors (mobile often returns generic DOMException messages). */
function mapCameraError(err: unknown): string {
  if (err && typeof err === 'object' && 'name' in err) {
    const name = String((err as DOMException).name);
    if (name === 'NotAllowedError') {
      return 'Camera permission denied. Allow camera access in your browser or site settings, then try again.';
    }
    if (name === 'NotFoundError') {
      return 'No usable camera was found.';
    }
    if (name === 'NotReadableError' || name === 'AbortError' || name === 'OverconstrainedError') {
      return 'Camera is in use or not available. Close other apps using the camera, then try again.';
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/insecure|https|SSL|secure context/i.test(msg)) {
    return 'Camera needs a secure page (HTTPS). Open this app over HTTPS or use localhost for testing.';
  }
  if (/Permission|denied|blocked/i.test(msg)) {
    return 'Camera permission denied. Allow camera access in your browser settings, then try again.';
  }
  return msg || 'Could not start camera';
}

type Props = {
  onClose: () => void;
  categoryName?: string;
  budgetLeft?: number;
  categoryId?: number;
  year?: number;
  month?: string;
  userId?: number;
};

export default function PayModal({ onClose, categoryName, budgetLeft, categoryId, year, month, userId }: Props) {
  const { formatCurrency, currencySymbol } = useCurrency();
  useLockBodyScroll(true);
  const [mode, setMode] = useState<PayMode>('scan');
  const [step, setStep] = useState<PayStep>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [securePayContext, setSecurePayContext] = useState(true);
  const [scanResult, setScanResult] = useState<{
    upiId: string;
    payeeName: string;
    amount: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<Array<{ id: string; label: string }>>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const html5QrRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null);

  useEffect(() => {
    setSecurePayContext(typeof window !== 'undefined' && window.isSecureContext);
  }, []);

  const stopScanner = useCallback(() => {
    const qr = html5QrRef.current;
    html5QrRef.current = null;
    if (qr) {
      try {
        void qr.stop().catch(() => {});
      } catch {
        try {
          qr.clear();
        } catch {
          /* ignore */
        }
      }
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (mode !== 'scan') {
      setCameraIndex(0);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'scan' || scanResult !== null) {
      stopScanner();
      return;
    }
    setScanError(null);
    let mounted = true;

    const startScan = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const raw = await Html5Qrcode.getCameras();
        const cameras = sortCamerasBackFirst(raw);
        if (!cameras?.length) {
          if (mounted) setScanError('No camera found');
          return;
        }
        if (!mounted || !document.getElementById(QR_READER_ID)) return;

        if (mounted) setCameraDevices(cameras);

        const idx = Math.min(cameraIndex, cameras.length - 1);
        // Try selected camera first, then others (handles Overconstrained / busy camera on some phones).
        const tryOrder = [cameras[idx], ...cameras.filter((_, i) => i !== idx)];

        // Let the modal finish layout so the scanner box has non-zero size (fixes some mobile failures).
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
        await new Promise((r) => setTimeout(r, 120));
        if (!mounted || !document.getElementById(QR_READER_ID)) return;

        const scanConfig = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(160, Math.min(280, Math.floor(minEdge * 0.72)));
            return { width: size, height: size };
          },
        };

        const onDecoded = (decodedText: string) => {
          const parsed = parseUPIString(decodedText);
          if (parsed.upiId) {
            setScanResult(parsed);
            const qr = html5QrRef.current;
            qr?.stop().catch(() => {});
            html5QrRef.current = null;
            setIsScanning(false);
          }
        };

        let lastError: unknown;
        for (const cam of tryOrder) {
          if (!mounted) return;
          const html5Qr = new Html5Qrcode(QR_READER_ID);
          html5QrRef.current = html5Qr;
          try {
            // Device id only — facingMode + retry on same instance fails on many mobile WebViews.
            await html5Qr.start(cam.id, scanConfig, onDecoded, () => {});
            if (mounted) setIsScanning(true);
            return;
          } catch (e) {
            lastError = e;
            html5QrRef.current = null;
            try {
              html5Qr.clear();
            } catch {
              /* ignore */
            }
          }
        }
        if (mounted) setScanError(mapCameraError(lastError));
      } catch (e) {
        if (mounted) setScanError(mapCameraError(e));
      }
    };

    startScan();
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [mode, scanResult, stopScanner, cameraIndex]);

  const handleResetScan = () => {
    setScanResult(null);
    setScanError(null);
    setAmount('');
  };

  /** QR may omit `am`, or include `am=0` / empty — treat as “no fixed amount” so user can type it. */
  const scannedAmountParsed =
    scanResult?.amount != null && String(scanResult.amount).trim() !== ''
      ? parseFloat(String(scanResult.amount).replace(/,/g, ''))
      : NaN;
  const hasValidScannedAmount =
    scanResult !== null &&
    !Number.isNaN(scannedAmountParsed) &&
    scannedAmountParsed > 0;

  const currentAmount =
    mode === 'scan'
      ? hasValidScannedAmount
        ? scannedAmountParsed
        : parseFloat(amount) || 0
      : parseFloat(amount) || 0;
  const effectiveUpiId = mode === 'scan' ? (scanResult?.upiId ?? '') : upiId.trim();
  const effectivePayeeName = mode === 'scan' ? (scanResult?.payeeName ?? '') : '';
  const amountStr =
    mode === 'scan'
      ? hasValidScannedAmount
        ? String(scanResult!.amount).trim()
        : amount
      : amount;
  const isOverBudget =
    budgetLeft !== undefined && currentAmount > 0 && currentAmount > budgetLeft;
  const overBy = isOverBudget && budgetLeft !== undefined ? currentAmount - budgetLeft : 0;

  const canOpenUpi = currentAmount > 0 && effectiveUpiId.length > 0;

  const transactionRef = useMemo(
    () => makeUpiTransactionRef(),
    [effectiveUpiId, effectivePayeeName, amountStr, categoryName, mode]
  );

  const upiIntentUrl = useMemo(() => {
    if (!canOpenUpi) return '';
    const note = categoryName ? `H2 · ${categoryName}` : 'H2 budget';
    // Manual VPA: P2P-style link — no merchant QR fields; see buildUpiPayUrl p2pManual.
    if (mode === 'upi') {
      return buildUpiPayUrl(effectiveUpiId, effectivePayeeName, amountStr, {
        note,
        p2pManual: true,
      });
    }
    return buildUpiPayUrl(effectiveUpiId, effectivePayeeName, amountStr, {
      note,
      transactionRef,
    });
  }, [canOpenUpi, effectiveUpiId, effectivePayeeName, amountStr, categoryName, transactionRef, mode]);

  const handleOpenInPaymentApp = () => {
    if (!upiIntentUrl) return;
    setSubmitError(null);
    openUpiDeepLink(upiIntentUrl);
    setStep('awaiting');
  };

  const handleCopyUpiLink = async () => {
    if (!upiIntentUrl) return;
    setSubmitError(null);
    try {
      await navigator.clipboard.writeText(upiIntentUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setSubmitError(
        'Could not copy. Use HTTPS, try Chrome/Safari, or enter this UPI ID manually in your payment app.'
      );
    }
  };

  const logTransaction = async (status: 'success' | 'failed') => {
    if (
      userId == null ||
      categoryId == null ||
      year == null ||
      month == null ||
      currentAmount <= 0
    ) {
      return;
    }
    try {
      await addSpendingTransaction(
        buildTransactionPayload(
          userId,
          categoryId,
          categoryName ?? 'Category',
          currentAmount,
          year,
          month,
          status,
          effectivePayeeName,
          effectiveUpiId
        )
      );
    } catch (err) {
      console.error('Failed to log transaction', err);
    }
  };

  const handlePaymentSuccess = async () => {
    if (currentAmount <= 0) return;
    setSubmitError(null);
    setStep('recording');
    try {
      if (userId != null && categoryId != null && year != null && month != null) {
        await addExpense(userId, year, month, categoryId, currentAmount);
        await logTransaction('success');
      }
      setStep('done');
      setTimeout(() => onClose(), 1500);
    } catch (e) {
      await logTransaction('failed');
      setSubmitError(e instanceof Error ? e.message : 'Failed to record payment');
      setStep('awaiting');
    }
  };

  const handlePaymentFailed = async () => {
    await logTransaction('failed');
    stopScanner();
    onClose();
  };

  return (
    <ModalPortal className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pay</h2>
            <p className="text-sm text-muted-foreground">
              {categoryName ? `Pay for ${categoryName}` : 'Scan UPI QR or enter details'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { stopScanner(); onClose(); }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/50"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {step === 'awaiting' || step === 'recording' ? (
            <div className="space-y-6 py-4">
              {step === 'recording' ? (
                <div className="rounded-xl bg-muted/50 border border-border p-8 flex flex-col items-center justify-center gap-4">
                  <span className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
                  <p className="text-foreground font-medium">Recording payment…</p>
                  <p className="text-sm text-muted-foreground">Updating your budget</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted/50 border border-border p-5 text-center space-y-2">
                    <p className="text-foreground font-medium">Payment app opened</p>
                    <p className="text-sm text-muted-foreground">
                      Complete the payment there, then return here and tell us what happened.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handlePaymentSuccess}
                      className="flex-1 py-3.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      Payment successful
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentFailed}
                      className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted/50"
                    >
                      Failed
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      if (upiIntentUrl) openUpiDeepLink(upiIntentUrl);
                    }}
                    disabled={!upiIntentUrl}
                    className="w-full py-2.5 text-sm font-medium rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open payment app again
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Use this if the app closed when you tapped outside it, or you need another try.
                  </p>
                  {submitError && (
                    <p className="text-sm text-rose-600 dark:text-rose-400 text-center">{submitError}</p>
                  )}
                </>
              )}
            </div>
          ) : step === 'done' ? (
            <div className="py-8 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-foreground font-semibold">Payment recorded</p>
              <p className="text-sm text-muted-foreground">Updating your budget…</p>
            </div>
          ) : (
            <>
          {!securePayContext && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-950 dark:text-amber-100">
              <p className="font-medium">Connection not secure (not HTTPS)</p>
              <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
                Payment apps and the camera often block this. Use HTTPS in production, or localhost for testing. If
                nothing opens, use &quot;Copy payment link&quot; below or paste the UPI ID in your app.
              </p>
            </div>
          )}
          <p className="text-sm font-medium text-muted-foreground">Choose an option</p>
          <div className="flex rounded-xl bg-background border border-border p-1">
            <button
              type="button"
              onClick={() => setMode('scan')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                mode === 'scan' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Scan QR
            </button>
            <button
              type="button"
              onClick={() => { stopScanner(); setMode('upi'); setScanResult(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                mode === 'upi' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Use UPI ID
            </button>
          </div>

          {categoryName != null && budgetLeft !== undefined && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-2.5">
              <p className="text-sm text-muted-foreground">
                Budget left for <span className="font-medium text-foreground">{categoryName}</span>:{' '}
                <span className="font-semibold text-foreground">{formatCurrency(budgetLeft)}</span>
              </p>
            </div>
          )}

          {mode === 'scan' && (
            <div className="space-y-3">
              {!scanResult ? (
                <>
                  <div
                    id={QR_READER_ID}
                    className="min-h-[220px] overflow-hidden rounded-xl border border-border bg-background"
                  />
                  {cameraDevices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCameraIndex((i) => (i + 1) % cameraDevices.length)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                      aria-label="Switch camera"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Switch camera
                      <span className="text-muted-foreground">
                        ({cameraIndex + 1}/{cameraDevices.length})
                      </span>
                    </button>
                  )}
                  {scanError && <p className="text-sm text-rose-600 dark:text-rose-400">{scanError}</p>}
                  {!scanError && !isScanning && (
                    <p className="text-sm text-muted-foreground">Point camera at UPI QR code</p>
                  )}
                </>
              ) : (
                <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Scanned</p>
                  <p className="text-sm text-foreground break-all">{scanResult.upiId}</p>
                  {!hasValidScannedAmount && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        This QR didn&apos;t include a payment amount, or the amount was zero. Enter how much you&apos;re paying.
                      </p>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-ring"
                        autoFocus
                      />
                    </div>
                  )}
                  {hasValidScannedAmount && (
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(scannedAmountParsed)}</p>
                  )}
                  {isOverBudget && (
                    <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3">
                      <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                        This amount exceeds your remaining budget by {formatCurrency(overBy)}. You can still pay; this category will show a negative balance.
                      </p>
                    </div>
                  )}
                  {submitError && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{submitError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResetScan}
                      className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border text-foreground"
                    >
                      Scan again
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenInPaymentApp}
                      className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!upiIntentUrl}
                    >
                      Open in payment app
                    </button>
                  </div>
                  {upiIntentUrl && (
                    <button
                      type="button"
                      onClick={handleCopyUpiLink}
                      className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border/60 bg-transparent"
                    >
                      {linkCopied ? 'Payment link copied' : 'Copy payment link (if app did not open)'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Opens a standard person-to-person UPI request (no merchant QR fields). The payee label uses your VPA if a name isn&apos;t provided.
                </p>
              </div>
              {isOverBudget && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    This amount exceeds your remaining budget by {formatCurrency(overBy)}. You can still pay; this category will show a negative balance.
                  </p>
                </div>
              )}
              {submitError && (
                <p className="text-sm text-rose-600 dark:text-rose-400">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleOpenInPaymentApp}
                disabled={!upiIntentUrl}
                className="w-full py-3 text-sm font-medium rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open in payment app — {formatCurrency(parseFloat(amount) || 0)}
              </button>
              {upiIntentUrl && (
                <button
                  type="button"
                  onClick={handleCopyUpiLink}
                  className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border/60 bg-transparent"
                >
                  {linkCopied ? 'Payment link copied' : 'Copy payment link (if app did not open)'}
                </button>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
