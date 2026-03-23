/**
 * UPI deep links (NPCI-style) for opening payment apps from the browser.
 * @see https://www.npci.org.in/what-we-do/upi/product-overview
 */

const TX_REF_MAX = 35;

/** Alphanumeric transaction reference (NPCI commonly limits length). */
export function makeUpiTransactionRef(): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}${Math.random().toString(36).slice(2, 12)}`;
  const tr = `h2${raw}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return tr.slice(0, TX_REF_MAX);
}

function sanitizeUpiNote(note: string | undefined, maxLen: number): string | undefined {
  if (!note?.trim()) return undefined;
  const ascii = note.replace(/[^\x20-\x7E]/g, '').trim();
  if (!ascii) return undefined;
  return ascii.slice(0, maxLen);
}

export function parseUPIString(text: string): { upiId: string; payeeName: string; amount: string } {
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

export type BuildUpiPayUrlOpts = {
  /** Short note; non-ASCII stripped — some apps reject exotic characters in tn. */
  note?: string;
  /**
   * User typed VPA only (no scanned merchant QR). This is a normal P2P-style intent:
   * do not invent merchant ids (`mc`, `mid`, …). Some wallets treat `tr` as merchant-only and
   * behave better when it is omitted; `pn` is derived from the VPA handle if missing so payee
   * name is never empty.
   */
  p2pManual?: boolean;
};

/** When payee name is unknown, use the part before @ so `pn` is still set (many apps expect it). */
function deriveDisplayNameFromVpa(pa: string): string {
  const trimmed = pa.trim();
  const at = trimmed.indexOf('@');
  const local = at > 0 ? trimmed.slice(0, at) : trimmed;
  const safe = local.replace(/[^a-zA-Z0-9._\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  return (safe || trimmed).slice(0, 99);
}

/**
 * Build `upi://pay?...` for handoff to GPay / PhonePe / Paytm / bank UPI apps.
 * Always sets `cu=INR` when an amount is present (UPI is INR; avoids declines when profile currency ≠ INR).
 * For QR-backed flows, sets a unique `tr` — pass `transactionRef` from the caller so Open + Copy match.
 * For `p2pManual`, omits `tr` and fills `pn` from the VPA if needed (no fake merchant fields).
 */
export function buildUpiPayUrl(
  pa: string,
  pn: string,
  am: string,
  opts?: BuildUpiPayUrlOpts & { transactionRef?: string }
): string {
  const params = new URLSearchParams();
  const paTrim = pa.trim();
  params.set('pa', paTrim);
  const pnTrim = pn.trim();
  const payeeName =
    pnTrim || (opts?.p2pManual ? deriveDisplayNameFromVpa(paTrim) : '');
  if (payeeName) params.set('pn', payeeName);
  if (am.trim()) {
    const num = parseFloat(am.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      params.set('am', num.toFixed(2));
      params.set('cu', 'INR');
      if (!opts?.p2pManual) {
        params.set('tr', opts?.transactionRef ?? makeUpiTransactionRef());
      }
    }
  }
  const tn = sanitizeUpiNote(opts?.note, 48);
  if (tn) params.set('tn', tn);
  return `upi://pay?${params.toString()}`;
}

/**
 * Open a UPI deep link. Programmatic &lt;a&gt; click behaves better than location.assign
 * in some in-app browsers / WebViews that block scripted navigations to custom schemes.
 */
export function openUpiDeepLink(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('rel', 'noopener noreferrer');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.location.assign(url);
  }
}
