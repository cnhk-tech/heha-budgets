import { DB_VERSION } from "./constants";
import { dbReady } from "./ready";
import { Category, Stores } from "./types";

const storeName = Stores.Categories;

const getNextCategoryId = async (): Promise<number> => {
  await dbReady;
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
  await dbReady;
  const nextId = await getNextCategoryId();
  const data: Category = {
    ...category,
    id: nextId,
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

const deleteCategory = async (id: number): Promise<boolean> => {
  await dbReady;
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

const updateCategory = async (id: number, data: Category): Promise<boolean> => {
  await dbReady;
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

/** Get categories for a user. */
const getCategories = async (userId: number): Promise<Category[]> => {
  await dbReady;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index('userId');
      const cursorRequest = index.openCursor(IDBKeyRange.only(userId));
      const results: Category[] = [];
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export { addCategory, getCategories, deleteCategory, updateCategory };