import { getDB } from './connection';
import { BudgetHistory, SpendingTransaction, Stores, TransactionStatus } from './types';

const storeName = Stores.Transactions;

export async function addSpendingTransaction(row: Omit<SpendingTransaction, 'id'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const addReq = store.add(row);
    addReq.onsuccess = () => resolve(addReq.result as number);
    addReq.onerror = () => reject(addReq.error);
  });
}

export type GetTransactionsOptions = {
  categoryId?: number;
};

/** Newest first. */
export async function getSpendingTransactions(
  userId: number,
  options?: GetTransactionsOptions
): Promise<SpendingTransaction[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const idx = store.index('userId');
    const range = IDBKeyRange.only(userId);
    const results: SpendingTransaction[] = [];
    const cursorReq = idx.openCursor(range);

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        const v = cursor.value as SpendingTransaction;
        if (options?.categoryId == null || v.categoryId === options.categoryId) {
          results.push(v);
        }
        cursor.continue();
      } else {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/**
 * Delete one transaction. If status was success, subtracts the amount from that category's
 * spent for the stored budget month (same month/year as the log) in one IndexedDB transaction.
 */
export async function removeSpendingTransaction(userId: number, transactionId: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([Stores.Transactions, Stores.Budgets], 'readwrite');
    const txStore = tx.objectStore(Stores.Transactions);
    const budgetStore = tx.objectStore(Stores.Budgets);

    const fail = (err: Error) => {
      tx.abort();
      reject(err);
    };

    const getTxReq = txStore.get(transactionId);
    getTxReq.onsuccess = () => {
      const row = getTxReq.result as SpendingTransaction | undefined;
      if (!row || row.userId !== userId) {
        fail(new Error('Transaction not found.'));
        return;
      }

      const finalize = () => {
        txStore.delete(transactionId);
      };

      if (row.status !== 'success') {
        finalize();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        return;
      }

      const getBudgetReq = budgetStore.get([userId, row.year, row.month]);
      getBudgetReq.onsuccess = () => {
        const budgetHistory = getBudgetReq.result as BudgetHistory | undefined;
        if (!budgetHistory) {
          fail(
            new Error(
              `No budget for ${row.month} ${row.year}. Create that month’s budget before deleting this success entry, or the spend cannot be reversed.`
            )
          );
          return;
        }
        let found = false;
        const updatedBudgets = budgetHistory.budgets.map((b) => {
          if (b.categoryId !== row.categoryId) return b;
          found = true;
          const newSpent = Math.max(0, b.spent - row.amount);
          return {
            ...b,
            spent: newSpent,
            left: b.budget - newSpent,
          };
        });
        if (!found) {
          fail(new Error('Category is not in that month’s budget; cannot reverse spend.'));
          return;
        }
        budgetStore.put({ ...budgetHistory, budgets: updatedBudgets });
        finalize();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      getBudgetReq.onerror = () => fail(new Error(getBudgetReq.error?.message ?? 'Failed to read budget'));
    };
    getTxReq.onerror = () => fail(new Error(getTxReq.error?.message ?? 'Failed to read transaction'));
  });
}

export async function deleteSpendingTransactionsByUserId(userId: number): Promise<void> {
  const all = await getSpendingTransactions(userId);
  if (all.length === 0) return;
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const t of all) {
      if (t.id != null) store.delete(t.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function buildTransactionPayload(
  userId: number,
  categoryId: number,
  categoryName: string,
  amount: number,
  year: number,
  month: string,
  status: TransactionStatus,
  reason?: string,
): Omit<SpendingTransaction, 'id'> {
  return {
    userId,
    categoryId,
    categoryName: categoryName || 'Category',
    amount,
    year,
    month,
    status,
    createdAt: new Date().toISOString(),
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  };
}
