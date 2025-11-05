/**
 * IndexedDB Utilities
 * Handles conversation history persistence in IndexedDB
 */

const DB_NAME = 'AgenticCampaignManager';
const DB_VERSION = 1;
const STORE_NAME = 'conversations';

/**
 * Initialize IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Save conversation to IndexedDB
 */
export const saveConversation = async (
  conversationId: string,
  messages: any[]
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const conversation = {
      id: conversationId,
      messages,
      timestamp: new Date().toISOString(),
    };

    await store.put(conversation);
  } catch (error) {
    console.error('Failed to save conversation:', error);
    throw error;
  }
};

/**
 * Load conversation from IndexedDB
 */
export const loadConversation = async (
  conversationId: string
): Promise<any[] | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(conversationId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.messages : null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

/**
 * Load all conversations from IndexedDB
 */
export const loadAllConversations = async (): Promise<any[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
};

/**
 * Clear conversation from IndexedDB
 */
export const clearConversation = async (
  conversationId: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await store.delete(conversationId);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
    throw error;
  }
};

/**
 * Clear all conversations from IndexedDB
 */
export const clearAllConversations = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await store.clear();
  } catch (error) {
    console.error('Failed to clear all conversations:', error);
    throw error;
  }
};

