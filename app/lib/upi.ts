/**
 * UPI payment links for opening payment apps from a browser / PWA.
 *
 * On Android Chrome, uses `intent://` URIs which create a proper Android Intent
 * (the standard inter-app communication mechanism). This is more reliable than
 * raw `upi://` custom scheme links — Chrome handles the Intent natively, and
 * payment apps receive it through the standard Android Intent system rather than
 * as an untrusted custom-scheme redirect.
 *
 * On iOS / non-Android, falls back to `upi://` deep links.
 *
 * @see https://developer.chrome.com/docs/android/intents
 * @see https://www.npci.org.in/what-we-do/upi/product-overview
 */

/** Standard NPCI params we preserve from scanned QR codes. */
const STANDARD_UPI_PARAMS = new Set([
  'pa', 'pn', 'am', 'cu', 'tr', 'tn', 'mc', 'tid', 'mid', 'url',
  'mode', 'orgid', 'sign', 'qrMedium', 'purpose',
]);

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

export function parseUPIString(text: string): {
  upiId: string;
  payeeName: string;
  amount: string;
  /** Cleaned URL with only standard NPCI params (app-specific ones like GPay `aid` stripped). */
  cleanUrl: string;
} {
  try {
    if (text.startsWith('upi://') || text.startsWith('UPI://')) {
      const url = new URL(text);
      const clean = new URL('upi://pay');
      for (const [key, value] of url.searchParams) {
        if (STANDARD_UPI_PARAMS.has(key)) {
          clean.searchParams.set(key, value);
        }
      }
      return {
        upiId: url.searchParams.get('pa') ?? '',
        payeeName: url.searchParams.get('pn') ?? '',
        amount: url.searchParams.get('am') ?? '',
        cleanUrl: clean.toString(),
      };
    }
  } catch {
    // not a valid UPI URL
  }
  return { upiId: '', payeeName: '', amount: '', cleanUrl: '' };
}

/**
 * Take a clean scanned UPI URL and set/update the amount.
 * Preserves standard NPCI params (mc, tr, tid, etc.) from merchant QRs.
 */
export function patchAmountOnCleanUrl(cleanUrl: string, am: string): string {
  try {
    const url = new URL(cleanUrl);
    const num = parseFloat(am.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      url.searchParams.set('am', String(num));
    } else {
      url.searchParams.delete('am');
    }
    return url.toString();
  } catch {
    return cleanUrl;
  }
}

/** When payee name is unknown, use the part before @ so `pn` is still set. */
function deriveDisplayNameFromVpa(pa: string): string {
  const trimmed = pa.trim();
  const at = trimmed.indexOf('@');
  const local = at > 0 ? trimmed.slice(0, at) : trimmed;
  const safe = local.replace(/[^a-zA-Z0-9._\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  return (safe || trimmed).slice(0, 99);
}

/**
 * Build a `upi://pay?...` URL from manual UPI ID entry.
 * Only `pa`, `pn`, and `am` — the standard P2P shape.
 */
export function buildUpiPayUrl(
  pa: string,
  pn: string,
  am: string,
): string {
  const params = new URLSearchParams();
  const paTrim = pa.trim();
  params.set('pa', paTrim);
  const pnTrim = pn.trim();
  const payeeName = pnTrim || deriveDisplayNameFromVpa(paTrim);
  if (payeeName) params.set('pn', payeeName);
  if (am.trim()) {
    const num = parseFloat(am.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      params.set('am', String(num));
    }
  }
  return `upi://pay?${params.toString()}`;
}

/**
 * Convert a `upi://pay?...` URL to an Android `intent://` URI.
 *
 * Format: intent://pay?<params>#Intent;scheme=upi;action=android.intent.action.VIEW;end
 *
 * Chrome on Android intercepts `intent://` and creates a real Android Intent,
 * which goes through the standard intent resolution system. Payment apps see
 * this as a proper app-to-app intent rather than a browser custom-scheme redirect.
 */
function toAndroidIntent(upiUrl: string): string {
  const withoutScheme = upiUrl.replace(/^upi:\/\//i, '');
  return `intent://${withoutScheme}#Intent;scheme=upi;action=android.intent.action.VIEW;end`;
}

/**
 * Open a UPI payment link.
 *
 * - Android Chrome: converts to `intent://` URI for proper Intent handling
 * - iOS / other: uses `upi://` deep link with <a> click
 */
export function openUpiDeepLink(upiUrl: string): void {
  const url = isAndroid() ? toAndroidIntent(upiUrl) : upiUrl;
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
