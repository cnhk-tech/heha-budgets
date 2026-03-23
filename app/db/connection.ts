import { DB_VERSION } from './constants';
import { dbReady } from './ready';

const DB_NAME = 'myDB';

let cached: IDBDatabase | null = null;
let reopening: Promise<IDBDatabase> | null = null;

function attachLifecycle(db: IDBDatabase) {
  db.onclose = () => {
    cached = null;
  };
  db.onversionchange = () => {
    db.close();
    cached = null;
  };
}

/**
 * Called once from initDB success — reuses the same connection for all reads/writes.
 * Do not call db.close() on this instance; closing breaks the cache until reopen.
 */
export function registerDbConnection(db: IDBDatabase) {
  if (cached && cached !== db) {
    try {
      cached.close();
    } catch {
      /* ignore */
    }
  }
  cached = db;
  attachLifecycle(db);
}

function openFresh(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onsuccess = () => {
      registerDbConnection(req.result);
      resolve(req.result);
    };
  });
}

/**
 * Shared IndexedDB connection. Avoids opening a new connection on every query
 * (which was the main cause of slow page navigations).
 */
export async function getDB(): Promise<IDBDatabase> {
  const ok = await dbReady;
  if (!ok) {
    throw new Error('IndexedDB is not available or failed to initialize');
  }
  if (cached) return cached;
  if (!reopening) {
    reopening = openFresh().finally(() => {
      reopening = null;
    });
  }
  return reopening;
}
