import { categories as initialCategories, budgets as initialBudgets } from '@/app/data';
import { DB_VERSION } from './constants';
import { setDBReady } from './ready';
import { addCategory, getCategories } from './categories';
import { getBudgets, addBudget, addBudgetForMonth, addExpense, updateBudget, deleteBudgetsByUserId } from './budgets';
import { Stores } from './types';

const BUDGETS_TEMP = 'BudgetsV3Temp';

const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // --- v3: Users and AppMeta ---
      if (!db.objectStoreNames.contains(Stores.Users)) {
        db.createObjectStore(Stores.Users, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(Stores.AppMeta)) {
        db.createObjectStore(Stores.AppMeta, { keyPath: 'key' });
      }

      if (oldVersion > 0 && oldVersion < 3) {
        // Migrate from v2 to v3
        const tx = request.transaction!;
        const userStore = tx.objectStore(Stores.Users);
        const addUserReq = userStore.add({ name: 'Demo User', currency: 'USD' });

        addUserReq.onsuccess = () => {
          const defaultUserId = addUserReq.result as number;
          const metaStore = tx.objectStore(Stores.AppMeta);
          metaStore.put({ key: 'currentUserId', value: defaultUserId });

          // Categories: add userId to each record, then create index
          const catStore = tx.objectStore(Stores.Categories);
          const catCursorReq = catStore.openCursor();

          catCursorReq.onsuccess = () => {
            const cursor = catCursorReq.result;
            if (cursor) {
              cursor.update({ ...cursor.value, userId: defaultUserId });
              cursor.continue();
            } else {
              if (!catStore.indexNames.contains('userId')) {
                catStore.createIndex('userId', 'userId', { unique: false });
              }
              // Budgets: copy to temp with userId, delete old, create new, copy back
              migrateBudgetsStore(tx, defaultUserId);
            }
          };
        };
      } else if (oldVersion === 0 || !db.objectStoreNames.contains(Stores.Categories)) {
        // Fresh install: create Categories and Budgets with v3 schema (empty), then add default user and seed
        if (!db.objectStoreNames.contains(Stores.Categories)) {
          const catStore = db.createObjectStore(Stores.Categories, { keyPath: 'id' });
          catStore.createIndex('userId', 'userId', { unique: false });
          catStore.createIndex('icon', 'icon', { unique: false });
          catStore.createIndex('type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains(Stores.Budgets)) {
          const budgetStore = db.createObjectStore(Stores.Budgets, {
            keyPath: ['userId', 'year', 'month'],
          });
          budgetStore.createIndex('year', 'year', { unique: false });
          budgetStore.createIndex('month', 'month', { unique: false });
        }
        const tx = request.transaction!;
        const userStore = tx.objectStore(Stores.Users);
        const metaStore = tx.objectStore(Stores.AppMeta);
        const catStore = tx.objectStore(Stores.Categories);
        const budgetStore = tx.objectStore(Stores.Budgets);
        const addReq = userStore.add({ name: 'Demo User', currency: 'USD' });
        addReq.onsuccess = () => {
          const defaultUserId = addReq.result as number;
          metaStore.put({ key: 'currentUserId', value: defaultUserId });
          initialCategories.forEach((c) => catStore.add({ ...c, userId: defaultUserId }));
          initialBudgets.forEach((b) =>
            budgetStore.add({ ...b, userId: defaultUserId })
          );
        };
      }
    };

    function migrateBudgetsStore(tx: IDBTransaction, defaultUserId: number) {
      const db = request.result;
      const oldStore = tx.objectStore(Stores.Budgets);
      const tempStore = db.createObjectStore(BUDGETS_TEMP, {
        keyPath: ['userId', 'year', 'month'],
      });
      const copyReq = oldStore.openCursor();

      copyReq.onsuccess = () => {
        const cursor = copyReq.result;
        if (cursor) {
          const v = cursor.value;
          tempStore.add({
            userId: defaultUserId,
            year: v.year,
            month: v.month,
            budgets: v.budgets,
          });
          cursor.continue();
        } else {
          db.deleteObjectStore(Stores.Budgets);
          const newStore = db.createObjectStore(Stores.Budgets, {
            keyPath: ['userId', 'year', 'month'],
          });
          newStore.createIndex('year', 'year', { unique: false });
          newStore.createIndex('month', 'month', { unique: false });
          const copyBackReq = tx.objectStore(BUDGETS_TEMP).openCursor();
          copyBackReq.onsuccess = () => {
            const c = copyBackReq.result;
            if (c) {
              newStore.add(c.value);
              c.continue();
            } else {
              db.deleteObjectStore(BUDGETS_TEMP);
            }
          };
        }
      };
    }

    request.onsuccess = () => {
      console.log('request.onsuccess - initDB', DB_VERSION);
      setDBReady(true);
      resolve(true);
    };

    request.onerror = () => {
      setDBReady(false);
      resolve(false);
    };
  });
};

// Ensure DB is initialized as soon as the db module is first used
initDB();

export {
  initDB,
  addCategory,
  getCategories,
  getBudgets,
  addBudget,
  addBudgetForMonth,
  addExpense,
  updateBudget,
  deleteBudgetsByUserId,
};
export { getCurrentUser, getCurrentUserId, setCurrentUserId, getUsers, addUser, updateUser, findUserByName, getUserById, deleteUser } from './users';
