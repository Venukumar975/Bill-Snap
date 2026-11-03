/**
 * Storage Service using phone-native IndexedDB
 * 
 * - Unlimited offline storage for saved bills & receipt photos
 * - Non-blocking asynchronous reads/writes
 * - Indexed by date and category for fast future queries and analytics
 */

const DB_NAME = 'BillSnapDB';
const DB_VERSION = 1;
const STORE_NAME = 'bills';

/**
 * Opens or initializes the IndexedDB database
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error(`IndexedDB open error: ${event.target.error}`));
    };
  });
}

/**
 * Saves or updates a bill in IndexedDB
 */
export async function saveBill(bill) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Ensure all required fields exist
    const record = {
      id: bill.id || `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      merchant: bill.merchant || 'Unknown Store',
      date: bill.date || new Date().toISOString().split('T')[0],
      yearMonth: (bill.date || new Date().toISOString()).substring(0, 7),
      totalAmount: typeof bill.totalAmount === 'number' ? bill.totalAmount : parseFloat(bill.totalAmount) || 0,
      currency: bill.currency || '₹',
      category: bill.category || 'Other',
      imageDataUrl: bill.imageDataUrl || null,
      confidence: bill.confidence || {},
      createdAt: bill.createdAt || new Date().toISOString(),
      isSynced: false
    };

    const request = store.put(record);

    request.onsuccess = () => {
      resolve(record);
    };

    request.onerror = (event) => {
      reject(new Error(`Failed to save bill: ${event.target.error}`));
    };
  });
}

/**
 * Retrieves all saved bills, sorted by date (newest first)
 */
export async function getAllBills() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const bills = request.result || [];
      // Sort newest date first
      bills.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      resolve(bills);
    };

    request.onerror = (event) => {
      reject(new Error(`Failed to fetch bills: ${event.target.error}`));
    };
  });
}

/**
 * Deletes a single bill by its ID
 */
export async function deleteBill(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject(new Error(`Failed to delete bill: ${event.target.error}`));
    };
  });
}

/**
 * Clears all bills from the database
 */
export async function clearAllBills() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject(new Error(`Failed to clear bills: ${event.target.error}`));
    };
  });
}
