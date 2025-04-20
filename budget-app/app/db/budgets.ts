import { DB_VERSION } from "./constants";
import { Budget, BudgetHistory, Stores } from "./types";
const storeName = Stores.Budgets;

const getBudgets = (conditionIndex?: string, conditionValue?: IDBValidKey): Promise<BudgetHistory[]> => {
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

        const results: BudgetHistory[] = [];

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

const checkCategoryExists = async (categoryId: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(Stores.Categories, 'readonly');
      const store = tx.objectStore(Stores.Categories);
      const getRequest = store.get(categoryId);

      getRequest.onsuccess = () => {
        resolve(!!getRequest.result);
      };

      getRequest.onerror = () => {
        resolve(false);
      };
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

const addBudget = async (budgetCategories: Budget[]): Promise<void> => {
  // First check if all categories exist
  for (const category of budgetCategories) {
    const exists = await checkCategoryExists(category.categoryId);
    if (!exists) {
      throw new Error(`Category with ID ${category.categoryId} does not exist`);
    }
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Get current month and year
      const date = new Date();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      // Create budget entry
      const budgetEntry: BudgetHistory = {
        month,
        year,
        budgets: budgetCategories.map(category => ({
          ...category,
          spent: 0, // Initialize spent as 0
          left: category.budget // Initialize left as full budget amount
        }))
      };

      // Add to store
      const addRequest = store.add(budgetEntry);

      addRequest.onsuccess = () => {
        resolve();
      };

      addRequest.onerror = () => {
        reject(new Error('Failed to add budget entry'));
      };

      tx.oncomplete = () => {
        db.close();
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };
  });
};

const addExpense = (year: number, month: string, categoryId: number, amount: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('myDB', DB_VERSION);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Get the budget entry for the specified year and month
      const getRequest = store.get([year, month]);

      getRequest.onsuccess = () => {
        const budgetHistory: BudgetHistory = getRequest.result;
        
        if (!budgetHistory) {
          reject(new Error('No budget found for specified year and month'));
          return;
        }

        // Find and update the category
        const updatedBudgets = budgetHistory.budgets.map(budget => {
          if (budget.categoryId === categoryId) {
            const newSpent = budget.spent + amount;
            return {
              ...budget,
              spent: newSpent,
              left: budget.budget - newSpent
            };
          }
          return budget;
        });

        // Update the store with modified budgets
        const updateRequest = store.put({
          ...budgetHistory,
          budgets: updatedBudgets
        });

        updateRequest.onsuccess = () => {
          resolve();
        };

        updateRequest.onerror = () => {
          reject(new Error('Failed to update budget with expense'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get budget entry'));
      };

      tx.oncomplete = () => {
        db.close();
      };
    };

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };
  });
};


export { getBudgets, addBudget, addExpense };