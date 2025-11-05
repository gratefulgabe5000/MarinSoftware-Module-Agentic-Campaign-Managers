import {
  cachePerformanceMetrics,
  getCachedPerformanceMetrics,
  clearCachedPerformanceMetrics,
  cleanupExpiredCache,
} from '../indexedDB';
import { PerformanceMetrics, TimeRangeConfig } from '../../types/performance.types';

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
    
    // Mock indexedDB.open
    (global.indexedDB.open as jest.Mock).mockImplementation((name, version) => {
      const request = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      } as any;

      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess({ target: { result: mockDB } });
        }
      }, 0);

      return request;
    });

    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockStore);
    mockStore.index.mockReturnValue(mockIndex);
  });

  describe('cachePerformanceMetrics', () => {
    it('should cache performance metrics', async () => {
      const putRequest = {
        onsuccess: null,
        onerror: null,
      } as any;

      mockStore.put.mockReturnValue(putRequest);

      setTimeout(() => {
        if (putRequest.onsuccess) {
          putRequest.onsuccess({});
        }
      }, 0);

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

      expect(mockStore.put).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const putRequest = {
        onsuccess: null,
        onerror: null,
      } as any;

      mockStore.put.mockReturnValue(putRequest);

      setTimeout(() => {
        if (putRequest.onerror) {
          putRequest.onerror({});
        }
      }, 0);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCachedPerformanceMetrics', () => {
    it('should return cached metrics if available and not expired', async () => {
      const getRequest = {
        onsuccess: null,
        onerror: null,
        result: {
          metrics: mockMetrics,
          cachedAt: new Date().toISOString(),
        },
      } as any;

      mockStore.get.mockReturnValue(getRequest);

      setTimeout(() => {
        if (getRequest.onsuccess) {
          getRequest.onsuccess({});
        }
      }, 0);

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toEqual(mockMetrics);
    });

    it('should return null if cache is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 20); // 20 minutes ago

      const getRequest = {
        onsuccess: null,
        onerror: null,
        result: {
          metrics: mockMetrics,
          cachedAt: expiredDate.toISOString(),
        },
      } as any;

      mockStore.get.mockReturnValue(getRequest);

      const deleteRequest = {
        onsuccess: null,
        onerror: null,
      } as any;

      mockStore.delete.mockReturnValue(deleteRequest);

      setTimeout(() => {
        if (getRequest.onsuccess) {
          getRequest.onsuccess({});
        }
        if (deleteRequest.onsuccess) {
          deleteRequest.onsuccess({});
        }
      }, 0);

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toBeNull();
    });

    it('should return null if no cache found', async () => {
      const getRequest = {
        onsuccess: null,
        onerror: null,
        result: undefined,
      } as any;

      mockStore.get.mockReturnValue(getRequest);

      setTimeout(() => {
        if (getRequest.onsuccess) {
          getRequest.onsuccess({});
        }
      }, 0);

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

      mockIndex.openCursor.mockImplementation((range) => {
        const request = {
          onsuccess: null,
          onerror: null,
          result: cursor,
        } as any;

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
          // Simulate cursor continue
          cursor.continue();
          // Second call returns null (end of cursor)
          setTimeout(() => {
            request.result = null;
            if (request.onsuccess) {
              request.onsuccess({});
            }
          }, 0);
        }, 0);

        return request;
      });

      await clearCachedPerformanceMetrics('campaign-123');

      expect(cursor.delete).toHaveBeenCalled();
    });
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

      mockIndex.openCursor.mockImplementation(() => {
        const request = {
          onsuccess: null,
          onerror: null,
          result: cursor,
        } as any;

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess({});
          }
          cursor.continue();
          setTimeout(() => {
            request.result = null;
            if (request.onsuccess) {
              request.onsuccess({});
            }
          }, 0);
        }, 0);

        return request;
      });

      await cleanupExpiredCache();

      expect(cursor.delete).toHaveBeenCalled();
    });
  });
});

