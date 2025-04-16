import { DB_VERSION } from "./constants";
import { Stores } from "./types";

const storeName = Stores.Categories;

const addCategory = <T>(data: T): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      console.log('request.onsuccess - addData');
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const addRequest = store.add(data);

      addRequest.onsuccess = () => {
        resolve(true);
      };

      addRequest.onerror = () => {
        reject(addRequest.error!);
      };
    };

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        console.error(error);
      }
      resolve(false);
    };
  });
};

const deleteCategory = (name: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const deleteRequest = store.delete(name);

      deleteRequest.onsuccess = () => {
        resolve(true);
      };

      deleteRequest.onerror = () => {
        console.error(deleteRequest.error);
        resolve(false);
      };
    };

    request.onerror = () => {
      console.error(request.error);
      resolve(false);
    };
  });
};

const updateCategory = <T>(name: string, data: T): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const updateRequest = store.put({ ...data, name });

      updateRequest.onsuccess = () => {
        resolve(true);
      };

      updateRequest.onerror = () => {
        console.error(updateRequest.error);
        resolve(false);
      };
    };

    request.onerror = () => {
      console.error(request.error);
      resolve(false);
    };
  });
};

const getCategories = <T>(conditionIndex?: string, conditionValue?: IDBValidKey): Promise<T[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    if (!conditionIndex && !conditionValue) {
        console.log('request.onsuccess - getAllData');
        const res = store.getAll();
        res.onsuccess = () => {
          resolve(res.result);
        };
      } else {
        console.log('request.onsuccess - getAllData based on condition');
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

export { addCategory, getCategories, deleteCategory, updateCategory };