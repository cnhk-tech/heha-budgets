'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLockBodyScroll } from '@/app/hooks/useLockBodyScroll';
import { addExpense } from '@/app/db/budgets';
import { useCurrency } from '@/app/contexts/CurrencyContext';

function parseUPIString(text: string): { upiId: string; payeeName: string; amount: string } {
  try {
    if (text.startsWith('upi://') || text.startsWith('UPI://')) {
      const url = new URL(text);
      return {
        upiId: url.searchParams.get('pa') ?? '',
        payeeName: url.searchParams.get('pn') ?? '',
        amount: url.searchParams.get('am') ?? '',
      };
    }
  } catch {
    // not a valid UPI URL
  }
  return { upiId: '', payeeName: '', amount: '' };
}

/** Build UPI deep link so opening it launches the user's payment app (GPay, PhonePe, etc.). */
function buildUpiPayUrl(pa: string, pn: string, am: string): string {
  const params = new URLSearchParams();
  params.set('pa', pa.trim());
  if (pn.trim()) params.set('pn', pn.trim());
  if (am.trim()) {
    const num = parseFloat(am.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) params.set('am', num.toFixed(2));
  }
  return `upi://pay?${params.toString()}`;
}

type PayMode = 'scan' | 'upi';
type PayStep = 'form' | 'awaiting' | 'recording' | 'done';

const QR_READER_ID = 'pay-modal-qr-reader';

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
  const [scanResult, setScanResult] = useState<{
    upiId: string;
    payeeName: string;
    amount: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null);

  const stopScanner = useCallback(() => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setIsScanning(false);
  }, []);

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
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras?.length) {
          setScanError('No camera found');
          return;
        }
        if (!mounted || !document.getElementById(QR_READER_ID)) return;

        const html5Qr = new Html5Qrcode(QR_READER_ID);
        html5QrRef.current = html5Qr;
        await html5Qr.start(
          cameras[0].id,
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            const parsed = parseUPIString(decodedText);
            if (parsed.upiId) {
              setScanResult(parsed);
              html5Qr.stop().catch(() => {});
              html5QrRef.current = null;
              setIsScanning(false);
            }
          },
          () => {}
        );
        if (mounted) setIsScanning(true);
      } catch (e) {
        if (mounted) setScanError(e instanceof Error ? e.message : 'Could not start camera');
      }
    };

    startScan();
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [mode, scanResult, stopScanner]);

  const handleResetScan = () => {
    setScanResult(null);
    setScanError(null);
    setAmount('');
  };

  const currentAmount =
    mode === 'scan'
      ? scanResult?.amount
        ? parseFloat(scanResult.amount) || 0
        : parseFloat(amount) || 0
      : parseFloat(amount) || 0;
  const effectiveUpiId = mode === 'scan' ? (scanResult?.upiId ?? '') : upiId.trim();
  const effectivePayeeName = mode === 'scan' ? (scanResult?.payeeName ?? '') : '';
  const amountStr =
    mode === 'scan'
      ? (scanResult?.amount ? scanResult.amount : amount)
      : amount;
  const isOverBudget =
    budgetLeft !== undefined && currentAmount > 0 && currentAmount > budgetLeft;
  const overBy = isOverBudget && budgetLeft !== undefined ? currentAmount - budgetLeft : 0;

  const canOpenUpi = currentAmount > 0 && effectiveUpiId.length > 0;

  const handleOpenInPaymentApp = () => {
    if (!canOpenUpi) return;
    setSubmitError(null);
    const upiUrl = buildUpiPayUrl(effectiveUpiId, effectivePayeeName, amountStr);
    window.location.href = upiUrl;
    setStep('awaiting');
  };

  const handlePaymentSuccess = async () => {
    if (currentAmount <= 0) return;
    setSubmitError(null);
    setStep('recording');
    try {
      if (userId != null && categoryId != null && year != null && month != null) {
        await addExpense(userId, year, month, categoryId, currentAmount);
      }
      setStep('done');
      setTimeout(() => onClose(), 1500);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to record payment');
      setStep('awaiting');
    }
  };

  const handlePaymentFailed = () => {
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                      Failed / Cancelled
                    </button>
                  </div>
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
                    className="rounded-xl overflow-hidden border border-border bg-background min-h-[220px]"
                  />
                  {scanError && <p className="text-sm text-rose-600 dark:text-rose-400">{scanError}</p>}
                  {!scanError && !isScanning && (
                    <p className="text-sm text-muted-foreground">Point camera at UPI QR code</p>
                  )}
                </>
              ) : (
                <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Scanned</p>
                  <p className="text-sm text-foreground break-all">{scanResult.upiId}</p>
                  {!scanResult.amount && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                  {scanResult.amount && <p className="text-lg font-semibold text-foreground">{formatCurrency(parseFloat(scanResult.amount) || 0)}</p>}
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
                      disabled={step === 'recording'}
                    >
                      Scan again
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenInPaymentApp}
                      className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canOpenUpi}
                    >
                      Open in payment app
                    </button>
                  </div>
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
                disabled={!amount || !upiId.trim() || !canOpenUpi}
                className="w-full py-3 text-sm font-medium rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open in payment app — {formatCurrency(parseFloat(amount) || 0)}
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
