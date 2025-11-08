import {
  cachePerformanceMetrics,
  getCachedPerformanceMetrics,
  clearCachedPerformanceMetrics,
  cleanupExpiredCache,
} from '../indexedDB';
import { PerformanceMetrics, TimeRangeConfig } from '../../types/performance.types';

// Mock IDBKeyRange
global.IDBKeyRange = {
  only: jest.fn((value) => ({ value })),
} as any;

// Mock IndexedDB
const mockDB = {
  transaction: jest.fn(),
  objectStoreNames: {
    contains: jest.fn(),
  },
};

const mockStore = {
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  index: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockStore),
};

const mockIndex = {
  openCursor: jest.fn(),
};

// Mock indexedDB
global.indexedDB = {
  open: jest.fn(),
} as any;

describe('IndexedDB Performance Caching', () => {
  const mockMetrics: PerformanceMetrics = {
    impressions: 10000,
    clicks: 500,
    ctr: 5.0,
    conversions: 50,
    cpa: 20.0,
    roas: 2.5,
    spend: 1000,
    revenue: 2500,
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-08'),
    },
    campaignId: 'campaign-123',
    lastUpdated: new Date(),
  };

  const mockTimeRange: TimeRangeConfig = { type: '7d' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock indexedDB.open to return a promise-like request
    (global.indexedDB.open as jest.Mock).mockImplementation((name, version) => {
      const request = {
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
        result: mockDB,
      } as any;

      // Use Promise.resolve to ensure callback fires after current event loop
      Promise.resolve().then(() => {
        if (request.onsuccess) {
          request.onsuccess({ target: { result: mockDB } });
        }
      });

      return request;
    });

    mockDB.transaction.mockReturnValue(mockTransaction);
    mockDB.objectStoreNames.contains.mockReturnValue(true);
    mockTransaction.objectStore.mockReturnValue(mockStore);
    mockStore.index.mockReturnValue(mockIndex);
  });

  describe('cachePerformanceMetrics', () => {
    it('should cache performance metrics', async () => {
      // Mock store.put to return a promise-like request
      mockStore.put.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
        } as any;

        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
        });

        return request;
      });

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

      expect(mockStore.put).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock store.put to trigger error
      mockStore.put.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          error: new Error('DB Error'),
        } as any;

        setImmediate(() => {
          if (request.onerror) {
            request.onerror({});
          }
        });

        return request;
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

      // Give async operations time to complete
      await new Promise(resolve => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cache performance metrics:',
        expect.anything()
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCachedPerformanceMetrics', () => {
    it('should return cached metrics if available and not expired', async () => {
      mockStore.get.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: {
            metrics: mockMetrics,
            cachedAt: new Date().toISOString(),
          },
        } as any;

        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
        });

        return request;
      });

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toEqual(mockMetrics);
    });

    it('should return null if cache is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 20); // 20 minutes ago

      mockStore.get.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: {
            metrics: mockMetrics,
            cachedAt: expiredDate.toISOString(),
          },
        } as any;

        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
        });

        return request;
      });

      mockStore.delete.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
        } as any;

        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
        });

        return request;
      });

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toBeNull();
    });

    it('should return null if no cache found', async () => {
      mockStore.get.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: undefined,
        } as any;

        Promise.resolve().then(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
        });

        return request;
      });

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toBeNull();
    });
  });

  describe('clearCachedPerformanceMetrics', () => {
    it('should clear cached metrics for a campaign', async () => {
      const cursor = {
        delete: jest.fn(),
        continue: jest.fn(),
      };

      // Set up a one-shot callback to simulate end of cursor
      let hasBeenCalled = false;

      mockIndex.openCursor.mockImplementation((range) => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          error: null,
        } as any;

        // Use setImmediate to properly handle microtasks
        setImmediate(() => {
          if (request.onsuccess && !hasBeenCalled) {
            hasBeenCalled = true;
            const event = {
              target: {
                result: cursor,
              },
            };
            request.onsuccess(event);
          } else if (request.onsuccess && hasBeenCalled) {
            // Second call with null result to indicate end
            const event = {
              target: {
                result: null,
              },
            };
            request.onsuccess(event);
          }
        });

        return request;
      });

      await clearCachedPerformanceMetrics('campaign-123');

      // Verify the mock was called
      expect(mockIndex.openCursor).toHaveBeenCalled();
    }, 10000);
  });

  describe('cleanupExpiredCache', () => {
    it('should cleanup expired cache entries', async () => {
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 20);

      const cursor = {
        value: {
          cachedAt: expiredDate.toISOString(),
        },
        delete: jest.fn(),
        continue: jest.fn(),
      };

      let hasBeenCalled = false;

      mockIndex.openCursor.mockImplementation(() => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          error: null,
        } as any;

        // Use setImmediate to properly handle callbacks
        setImmediate(() => {
          if (request.onsuccess && !hasBeenCalled) {
            hasBeenCalled = true;
            const event = {
              target: {
                result: cursor,
              },
            };
            request.onsuccess(event);
          } else if (request.onsuccess && hasBeenCalled) {
            // Second call with null result to indicate end
            const event = {
              target: {
                result: null,
              },
            };
            request.onsuccess(event);
          }
        });

        return request;
      });

      await cleanupExpiredCache();

      // Verify the mock was called
      expect(mockIndex.openCursor).toHaveBeenCalled();
    }, 10000);
  });
});

