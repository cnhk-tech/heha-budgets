/**
 * Resolved when the DB has been initialized (all object stores created).
 * All DB operations should await this before opening transactions.
 */
let resolveReady: (value: boolean) => void;
export const dbReady = new Promise<boolean>((resolve) => {
  resolveReady = resolve;
});
export function setDBReady(value: boolean = true) {
  resolveReady(value);
}
