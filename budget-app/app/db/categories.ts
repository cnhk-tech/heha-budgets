import { DB_VERSION } from "./constants";
import { Category, Stores } from "./types";

const storeName = Stores.Categories;

const getNextCategoryId = (): Promise<number> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const categories = getAllRequest.result;
        if (categories.length === 0) {
          resolve(1); // Start with ID 1 if no categories exist
        } else {
          const maxId = Math.max(...categories.map(cat => cat.id));
          resolve(maxId + 1);
        }
      };

      getAllRequest.onerror = () => {
        resolve(1); // Fallback to ID 1 if error
      };
    };
  });
};

const addCategory = async (category: Omit<Category, 'id'>): Promise<boolean> => {
  const nextId = await getNextCategoryId();
  const data = {
    ...category,
    id: nextId
  };
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

const deleteCategory = (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const deleteRequest = store.delete(id);

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

const updateCategory = (id: number, data: Category): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const updateRequest = store.put(data);

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

const getCategories = (conditionIndex?: string, conditionValue?: IDBValidKey): Promise<Category[]> => {
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

        const results: Category[] = [];

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