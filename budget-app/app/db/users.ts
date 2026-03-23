import { DB_VERSION } from './constants';
import { dbReady } from './ready';
import { User, Stores } from './types';

const META_KEY_CURRENT_USER_ID = 'currentUserId';

export async function getCurrentUserId(): Promise<number | null> {
  await dbReady;
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.AppMeta, 'readonly');
      const store = tx.objectStore(Stores.AppMeta);
      const getRequest = store.get(META_KEY_CURRENT_USER_ID);
      getRequest.onsuccess = () => {
        const row = getRequest.result;
        resolve(row?.value != null ? Number(row.value) : null);
      };
      getRequest.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

export async function setCurrentUserId(userId: number | null): Promise<void> {
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.AppMeta, 'readwrite');
      const store = tx.objectStore(Stores.AppMeta);
      store.put({ key: META_KEY_CURRENT_USER_ID, value: userId });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getCurrentUserId();
  if (id == null) return null;
  return getUserById(id);
}

export async function getUserById(id: number): Promise<User | null> {
  await dbReady;
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Users, 'readonly');
      const store = tx.objectStore(Stores.Users);
      const getRequest = store.get(id);
      getRequest.onsuccess = () => resolve(getRequest.result ?? null);
      getRequest.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

export async function getUsers(): Promise<User[]> {
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Users, 'readonly');
      const store = tx.objectStore(Stores.Users);
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result ?? []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addUser(name: string, currency: string = 'USD'): Promise<User> {
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Users, 'readwrite');
      const store = tx.objectStore(Stores.Users);
      const addRequest = store.add({ name: name.trim(), currency });
      addRequest.onsuccess = () => {
        const user: User = { id: addRequest.result as number, name: name.trim(), currency };
        resolve(user);
      };
      addRequest.onerror = () => reject(addRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateUser(id: number, updates: { name?: string; currency?: string }): Promise<void> {
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Users, 'readwrite');
      const store = tx.objectStore(Stores.Users);
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('User not found'));
          return;
        }
        const updated = {
          ...existing,
          ...(updates.name !== undefined && { name: updates.name.trim() }),
          ...(updates.currency !== undefined && { currency: updates.currency }),
        };
        store.put(updated);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function findUserByName(name: string): Promise<User | null> {
  const users = await getUsers();
  const trimmed = name.trim().toLowerCase();
  return users.find((u) => u.name.toLowerCase() === trimmed) ?? null;
}

export async function deleteUser(userId: number): Promise<void> {
  const { getCategories, deleteCategory } = await import('./categories');
  const { deleteBudgetsByUserId } = await import('./budgets');
  const { deleteSpendingTransactionsByUserId } = await import('./transactions');
  const currentId = await getCurrentUserId();
  if (currentId === userId) {
    await setCurrentUserId(null);
  }
  const categories = await getCategories(userId);
  for (const cat of categories) {
    await deleteCategory(cat.id);
  }
  await deleteBudgetsByUserId(userId);
  await deleteSpendingTransactionsByUserId(userId);
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Users, 'readwrite');
      const store = tx.objectStore(Stores.Users);
      store.delete(userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export type { User } from './types';
