import { getDB } from './connection';
import { Budget, BudgetHistory, Stores } from './types';

const storeName = Stores.Budgets;

/** Get budgets for a user. Optionally filter by 'year' or 'month'. */
const getBudgets = async (
  userId: number,
  conditionIndex?: string,
  conditionValue?: IDBValidKey
): Promise<BudgetHistory[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const results: BudgetHistory[] = [];
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        const v = cursor.value;
        if (v.userId === userId) {
          if (!conditionIndex || !conditionValue || v[conditionIndex] === conditionValue) {
            results.push(v);
          }
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    cursorRequest.onerror = () => reject(cursorRequest.error);
  });
};

const checkCategoryExists = async (categoryId: number, userId: number): Promise<boolean> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(Stores.Categories, 'readonly');
      const store = tx.objectStore(Stores.Categories);
      const getRequest = store.get(categoryId);
      getRequest.onsuccess = () => {
        const cat = getRequest.result;
        resolve(!!cat && cat.userId === userId);
      };
      getRequest.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};

const addBudget = async (budgetCategories: Budget[], userId: number): Promise<void> => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return addBudgetForMonth(budgetCategories, year, month, userId);
};

/** Add a new budget for a specific year and month. Fails if one already exists. */
const addBudgetForMonth = async (
  budgetCategories: Budget[],
  year: number,
  month: string,
  userId: number
): Promise<void> => {
  for (const category of budgetCategories) {
    const exists = await checkCategoryExists(category.categoryId, userId);
    if (!exists) {
      throw new Error(`Category with ID ${category.categoryId} does not exist`);
    }
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const key = [userId, year, month];
    const getRequest = store.get(key);

    getRequest.onsuccess = () => {
      if (getRequest.result) {
        reject(new Error(`Budget for ${month} ${year} already exists`));
        return;
      }
      const budgetEntry: BudgetHistory = {
        userId,
        month,
        year,
        budgets: budgetCategories.map((category) => ({
          ...category,
          spent: 0,
          left: category.budget,
        })),
      };
      const addRequest = store.add(budgetEntry);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(new Error('Failed to add budget entry'));
    };
    getRequest.onerror = () => reject(new Error('Failed to check existing budget'));
  });
};

/** Update an existing month's budgets (preserves spent, recalculates left). */
const updateBudget = async (
  userId: number,
  year: number,
  month: string,
  budgets: Budget[]
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const getRequest = store.get([userId, year, month]);

    getRequest.onsuccess = () => {
      const existing: BudgetHistory | undefined = getRequest.result;
      if (!existing) {
        reject(new Error(`No budget found for ${month} ${year}`));
        return;
      }
      const updated: BudgetHistory = {
        userId,
        year,
        month,
        budgets: budgets.map((b) => ({
          ...b,
          left: b.budget - b.spent,
        })),
      };
      const putRequest = store.put(updated);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(new Error('Failed to update budget'));
    };
    getRequest.onerror = () => reject(new Error('Failed to get budget'));
  });
};

const addExpense = async (
  userId: number,
  year: number,
  month: string,
  categoryId: number,
  amount: number
): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const getRequest = store.get([userId, year, month]);

    getRequest.onsuccess = () => {
      const budgetHistory: BudgetHistory = getRequest.result;
      if (!budgetHistory) {
        reject(new Error('No budget found for specified year and month'));
        return;
      }
      const updatedBudgets = budgetHistory.budgets.map((budget) => {
        if (budget.categoryId === categoryId) {
          const newSpent = budget.spent + amount;
          return {
            ...budget,
            spent: newSpent,
            left: budget.budget - newSpent,
          };
        }
        return budget;
      });
      store.put({ ...budgetHistory, budgets: updatedBudgets });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    getRequest.onerror = () => reject(new Error('Failed to get budget entry'));
  });
};

/** Delete all budget entries for a user (e.g. when deleting account). */
const deleteBudgetsByUserId = async (userId: number): Promise<void> => {
  const entries = await getBudgets(userId);
  if (entries.length === 0) return;
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const entry of entries) {
      store.delete([userId, entry.year, entry.month]);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export { getBudgets, addBudget, addBudgetForMonth, addExpense, updateBudget, deleteBudgetsByUserId };
