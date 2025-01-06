import { DB_VERSION } from "./constants";
import { Stores } from "./types";

const storeName = Stores.Budgets;

const getBudgets = <T>(conditionIndex?: string, conditionValue?: IDBValidKey): Promise<T[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      console.log('request.onsuccess - getAllData');
      const db = request.result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      if (!conditionIndex && !conditionValue) {
        const res = store.getAll();
        res.onsuccess = () => {
          resolve(res.result);
        };
      } else {
        const storeIndex = store.index(conditionIndex!);
        const cursorRequest = storeIndex.openCursor(conditionValue);

        const results: T[] = [];

        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results); // No more matching records
          }
        };

      }
    };
  });
};

export { getBudgets };