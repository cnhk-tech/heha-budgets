import { getDB } from './connection';
import { Category, Stores } from './types';

const storeName = Stores.Categories;

const getNextCategoryId = async (): Promise<number> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const categories = getAllRequest.result;
        if (categories.length === 0) {
          resolve(1);
        } else {
          const maxId = Math.max(...categories.map((cat) => cat.id));
          resolve(maxId + 1);
        }
      };

      getAllRequest.onerror = () => {
        resolve(1);
      };
    });
  } catch {
    return 1;
  }
};

const addCategory = async (category: Omit<Category, 'id'>): Promise<boolean> => {
  try {
    const nextId = await getNextCategoryId();
    const data: Category = {
      ...category,
      id: nextId,
    };
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const addRequest = store.add(data);

      addRequest.onsuccess = () => {
        resolve(true);
      };

      addRequest.onerror = () => {
        reject(addRequest.error!);
      };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg) console.error(msg);
    return false;
  }
};

const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
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
    });
  } catch (e) {
    console.error(e);
    return false;
  }
};

const updateCategory = async (id: number, data: Category): Promise<boolean> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
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
    });
  } catch (e) {
    console.error(e);
    return false;
  }
};

/** Get categories for a user. */
const getCategories = async (userId: number): Promise<Category[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
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
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

export { addCategory, getCategories, deleteCategory, updateCategory };
