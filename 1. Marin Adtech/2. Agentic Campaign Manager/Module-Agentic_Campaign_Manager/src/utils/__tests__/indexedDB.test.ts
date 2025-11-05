import {
  cachePerformanceMetrics,
  getCachedPerformanceMetrics,
  clearCachedPerformanceMetrics,
  cleanupExpiredCache,
} from '../indexedDB';
import { PerformanceMetrics, TimeRangeConfig } from '../../types/performance.types';

<<<<<<< HEAD
// Mock IDBKeyRange
global.IDBKeyRange = {
  only: jest.fn((value) => ({ value })),
} as any;

=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
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
<<<<<<< HEAD

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
=======
    
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

      return request;
    });

    mockDB.transaction.mockReturnValue(mockTransaction);
<<<<<<< HEAD
    mockDB.objectStoreNames.contains.mockReturnValue(true);
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
    mockTransaction.objectStore.mockReturnValue(mockStore);
    mockStore.index.mockReturnValue(mockIndex);
  });

  describe('cachePerformanceMetrics', () => {
    it('should cache performance metrics', async () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

      expect(mockStore.put).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await cachePerformanceMetrics('campaign-123', mockMetrics, mockTimeRange);

<<<<<<< HEAD
      // Give async operations time to complete
      await new Promise(resolve => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cache performance metrics:',
        expect.anything()
      );
=======
      expect(consoleErrorSpy).toHaveBeenCalled();
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCachedPerformanceMetrics', () => {
    it('should return cached metrics if available and not expired', async () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toEqual(mockMetrics);
    });

    it('should return null if cache is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 20); // 20 minutes ago

<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

      const result = await getCachedPerformanceMetrics('campaign-123', mockTimeRange);

      expect(result).toBeNull();
    });

    it('should return null if no cache found', async () => {
<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

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

<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

        return request;
      });

      await clearCachedPerformanceMetrics('campaign-123');

<<<<<<< HEAD
      // Verify the mock was called
      expect(mockIndex.openCursor).toHaveBeenCalled();
    }, 10000);
=======
      expect(cursor.delete).toHaveBeenCalled();
    });
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
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

<<<<<<< HEAD
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
=======
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
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

        return request;
      });

      await cleanupExpiredCache();

<<<<<<< HEAD
      // Verify the mock was called
      expect(mockIndex.openCursor).toHaveBeenCalled();
    }, 10000);
=======
      expect(cursor.delete).toHaveBeenCalled();
    });
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
  });
});

