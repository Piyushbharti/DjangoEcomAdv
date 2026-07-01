/**
 * IndexedDB helper for storing recent search history
 * 
 * Usage:
 *   import { saveSearch, getRecentSearches, deleteSearch, clearSearches } from './searchHistoryDB';
 *   
 *   await saveSearch('shoes');
 *   const searches = await getRecentSearches(); // [{id, keyword, timestamp}]
 *   await deleteSearch(id);
 *   await clearSearches();
 */

const DB_NAME = 'GreatKartDB';
const DB_VERSION = 1;
const STORE_NAME = 'searchHistory';
const MAX_SEARCHES = 10; // sirf last 10 searches rakho

// ============================================================
//  Open DB connection
// ============================================================
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('keyword', 'keyword', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================
//  Save a search keyword
// ============================================================
export async function saveSearch(keyword) {
  if (!keyword || !keyword.trim()) return;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Duplicate check — same keyword already hai toh delete karo (phir top pe aayega)
  const index = store.index('keyword');
  const existing = await new Promise((resolve) => {
    const req = index.getAll(keyword.trim().toLowerCase());
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });

  for (const item of existing) {
    store.delete(item.id);
  }

  // New entry add karo
  store.add({
    keyword: keyword.trim().toLowerCase(),
    displayText: keyword.trim(),
    timestamp: Date.now(),
  });

  // Max limit check — purane hata do
  const allReq = store.index('timestamp').openCursor(null, 'prev');
  let count = 0;
  allReq.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      count++;
      if (count > MAX_SEARCHES) {
        cursor.delete();
      }
      cursor.continue();
    }
  };

  await new Promise((resolve) => {
    tx.oncomplete = resolve;
  });

  db.close();
}

// ============================================================
//  Get recent searches (newest first)
// ============================================================
export async function getRecentSearches(limit = 10) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const results = [];
    const index = store.index('timestamp');
    const req = index.openCursor(null, 'prev'); // newest first

    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        db.close();
        resolve(results);
      }
    };

    req.onerror = () => {
      db.close();
      resolve([]);
    };
  });
}

// ============================================================
//  Delete a specific search
// ============================================================
export async function deleteSearch(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  await new Promise((resolve) => { tx.oncomplete = resolve; });
  db.close();
}

// ============================================================
//  Clear all search history
// ============================================================
export async function clearSearches() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  await new Promise((resolve) => { tx.oncomplete = resolve; });
  db.close();
}
