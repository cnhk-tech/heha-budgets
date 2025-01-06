import { categories as initialCategories, budgets as initialBudgets } from '@/app/data';
import { Stores } from './types';
import { DB_VERSION } from './constants';
import { addCategory, getCategories } from './categories';
import { getBudgets } from './budgets';

const initDB = (): Promise<boolean> => {
  let request: IDBOpenDBRequest;
  let db: IDBDatabase;

  return new Promise((resolve) => {
    // open the connection
    request = indexedDB.open('myDB', DB_VERSION);

    request.onupgradeneeded = () => {
      db = request.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(Stores.Categories)) {
        console.log('Creating Categories store');
        const objectStore = db.createObjectStore(Stores.Categories, { keyPath: 'name' });
        objectStore.createIndex("icon", "icon", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        initialCategories.forEach((categories) => (objectStore.add(categories)));
      }

      if (!db.objectStoreNames.contains(Stores.Budgets)) {
        console.log('Creating Budgets store');
        const objectStore = db.createObjectStore(Stores.Budgets, { keyPath: ['year', 'month'] });
        objectStore.createIndex("year", "year", { unique: false });
        objectStore.createIndex("month", "month", { unique: false });
        initialBudgets.forEach((budget) => (objectStore.add(budget)));
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      console.log('request.onsuccess - initDB', DB_VERSION);
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export {
  initDB,
  addCategory,
  getCategories,
  getBudgets,
}