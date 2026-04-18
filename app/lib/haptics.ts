/**
 * Safe haptic feedback via the Vibration API.
 * No-op on browsers/devices that don't support it (iOS Safari, desktop, etc.).
 */

function vibrate(pattern: number | number[]): void {
  try {
    navigator?.vibrate?.(pattern);
  } catch {
    /* unsupported — silently ignore */
  }
}

/** Light tap — button press, selection, navigation */
export function tapHaptic(): void {
  vibrate(8);
}

/** Key press — ultra-short for rapid input like numpad */
export function keypressHaptic(): void {
  vibrate(4);
}

/** Medium — confirm action, toggle, form submit */
export function confirmHaptic(): void {
  vibrate(18);
}

/** Heavy — destructive action like delete */
export function heavyHaptic(): void {
  vibrate(30);
}

/** Success — double pulse for completed operations */
export function successHaptic(): void {
  vibrate([12, 60, 12]);
}

/** Error / warning — triple short burst */
export function errorHaptic(): void {
  vibrate([20, 40, 20, 40, 20]);
}

/** Threshold crossed — swipe gesture passes commit point */
export function thresholdHaptic(): void {
  vibrate(15);
}
