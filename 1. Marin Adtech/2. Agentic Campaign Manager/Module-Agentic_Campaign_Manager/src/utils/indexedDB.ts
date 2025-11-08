/**
 * IndexedDB Utilities
 * Handles conversation history, performance metrics, and campaign persistence in IndexedDB
 */

import type { PerformanceMetrics, TimeRangeConfig } from '../types/performance.types';
import type { Campaign } from '../types/campaign.types';

const DB_NAME = 'AgenticCampaignManager';
const DB_VERSION = 3; // Incremented for campaigns store
const CONVERSATION_STORE = 'conversations';
const PERFORMANCE_STORE = 'performance';
const CAMPAIGNS_STORE = 'campaigns';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

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

      // Create conversation store if it doesn't exist
      if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
        const conversationStore = db.createObjectStore(CONVERSATION_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create performance metrics store if it doesn't exist
      if (!db.objectStoreNames.contains(PERFORMANCE_STORE)) {
        const performanceStore = db.createObjectStore(PERFORMANCE_STORE, {
          keyPath: 'id',
          autoIncrement: false,
        });
        performanceStore.createIndex('campaignId', 'campaignId', { unique: false });
        performanceStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Create campaigns store if it doesn't exist
      if (!db.objectStoreNames.contains(CAMPAIGNS_STORE)) {
        const campaignsStore = db.createObjectStore(CAMPAIGNS_STORE, {
          keyPath: 'id',
          autoIncrement: false,
        });
        campaignsStore.createIndex('status', 'status', { unique: false });
        campaignsStore.createIndex('createdAt', 'createdAt', { unique: false });
        campaignsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
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
      const transaction = db.transaction([CONVERSATION_STORE], 'readwrite');
      const store = transaction.objectStore(CONVERSATION_STORE);

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
      const transaction = db.transaction([CONVERSATION_STORE], 'readonly');
      const store = transaction.objectStore(CONVERSATION_STORE);

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
      const transaction = db.transaction([CONVERSATION_STORE], 'readonly');
      const store = transaction.objectStore(CONVERSATION_STORE);

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
      const transaction = db.transaction([CONVERSATION_STORE], 'readwrite');
      const store = transaction.objectStore(CONVERSATION_STORE);

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
      const transaction = db.transaction([CONVERSATION_STORE], 'readwrite');
      const store = transaction.objectStore(CONVERSATION_STORE);

    await store.clear();
  } catch (error) {
    console.error('Failed to clear all conversations:', error);
    throw error;
  }
};

/**
 * Performance Metrics Caching
 */

/**
 * Generate cache key for performance metrics
 */
const generateCacheKey = (campaignId: string, timeRange: TimeRangeConfig): string => {
  const timeRangeStr = timeRange.type === 'custom' 
    ? `${timeRange.start?.toISOString()}-${timeRange.end?.toISOString()}`
    : timeRange.type;
  return `${campaignId}:${timeRangeStr}`;
};

/**
 * Cache performance metrics
 */
export const cachePerformanceMetrics = async (
  campaignId: string,
  metrics: PerformanceMetrics,
  timeRange: TimeRangeConfig
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PERFORMANCE_STORE], 'readwrite');
    const store = transaction.objectStore(PERFORMANCE_STORE);

    const cacheKey = generateCacheKey(campaignId, timeRange);
    const cachedData = {
      id: cacheKey,
      campaignId,
      metrics,
      timeRange,
      cachedAt: new Date().toISOString(),
    };

    await store.put(cachedData);
  } catch (error) {
    console.error('Failed to cache performance metrics:', error);
    // Don't throw - caching is optional
  }
};

/**
 * Get cached performance metrics
 */
export const getCachedPerformanceMetrics = async (
  campaignId: string,
  timeRange: TimeRangeConfig
): Promise<PerformanceMetrics | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PERFORMANCE_STORE], 'readonly');
    const store = transaction.objectStore(PERFORMANCE_STORE);

    const cacheKey = generateCacheKey(campaignId, timeRange);

    return new Promise((resolve, reject) => {
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is still valid (TTL check)
        const cachedAt = new Date(result.cachedAt);
        const now = new Date();
        const age = now.getTime() - cachedAt.getTime();

        if (age > CACHE_TTL) {
          // Cache expired, delete it
          const deleteTransaction = db.transaction([PERFORMANCE_STORE], 'readwrite');
          const deleteStore = deleteTransaction.objectStore(PERFORMANCE_STORE);
          deleteStore.delete(cacheKey);
          resolve(null);
          return;
        }

        resolve(result.metrics);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get cached performance metrics:', error);
    return null;
  }
};

/**
 * Clear cached performance metrics for a campaign
 */
export const clearCachedPerformanceMetrics = async (
  campaignId: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PERFORMANCE_STORE], 'readwrite');
    const store = transaction.objectStore(PERFORMANCE_STORE);
    const index = store.index('campaignId');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.only(campaignId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to clear cached performance metrics:', error);
    throw error;
  }
};

/**
 * Clear all expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PERFORMANCE_STORE], 'readwrite');
    const store = transaction.objectStore(PERFORMANCE_STORE);
    const index = store.index('cachedAt');
    const now = new Date();

    return new Promise((resolve, reject) => {
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) {
          resolve();
          return;
        }

        const cachedAt = new Date(cursor.value.cachedAt);
        const age = now.getTime() - cachedAt.getTime();

        if (age > CACHE_TTL) {
          cursor.delete();
        }
        cursor.continue();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to cleanup expired cache:', error);
    // Don't throw - cleanup is optional
  }
};

/**
 * Clear all performance metrics cache
 */
export const clearAllPerformanceCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([PERFORMANCE_STORE], 'readwrite');
    const store = transaction.objectStore(PERFORMANCE_STORE);

    await store.clear();
  } catch (error) {
    console.error('Failed to clear all performance cache:', error);
    throw error;
  }
};

/**
 * Campaign Storage
 */

/**
 * Save a campaign to IndexedDB
 */
export const saveCampaign = async (campaign: Campaign): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readwrite');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    await store.put(campaign);
  } catch (error) {
    console.error('Failed to save campaign:', error);
    throw error;
  }
};

/**
 * Save multiple campaigns to IndexedDB
 */
export const saveCampaigns = async (campaigns: Campaign[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readwrite');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    for (const campaign of campaigns) {
      await store.put(campaign);
    }
  } catch (error) {
    console.error('Failed to save campaigns:', error);
    throw error;
  }
};

/**
 * Load a campaign from IndexedDB
 */
export const loadCampaign = async (campaignId: string): Promise<Campaign | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readonly');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(campaignId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load campaign:', error);
    return null;
  }
};

/**
 * Load all campaigns from IndexedDB
 */
export const loadAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readonly');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const campaigns = request.result || [];
        resolve(campaigns);
      };

      request.onerror = () => {
        console.error('Error loading campaigns:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    return [];
  }
};

/**
 * Delete a campaign from IndexedDB
 */
export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readwrite');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    await store.delete(campaignId);
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    throw error;
  }
};

/**
 * Clear all campaigns from IndexedDB
 */
export const clearAllCampaigns = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CAMPAIGNS_STORE], 'readwrite');
    const store = transaction.objectStore(CAMPAIGNS_STORE);

    await store.clear();
  } catch (error) {
    console.error('Failed to clear all campaigns:', error);
    throw error;
  }
};

