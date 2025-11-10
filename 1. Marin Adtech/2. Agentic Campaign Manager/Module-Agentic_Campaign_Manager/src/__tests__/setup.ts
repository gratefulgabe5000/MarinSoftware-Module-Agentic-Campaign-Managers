import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();

// Mock IndexedDB for Jest tests
class MockIDBRequest {
  onerror: ((event: any) => void) | null = null;
  onsuccess: ((event: any) => void) | null = null;
  result: any = null;
  error: any = null;

  triggerSuccess(result: any) {
    this.result = result;
    if (this.onsuccess) {
      this.onsuccess({ target: { result } } as any);
    }
  }

  triggerError(error: any) {
    this.error = error;
    if (this.onerror) {
      this.onerror({ target: { error } } as any);
    }
  }
}

class MockIDBDatabase {
  private stores: Map<string, Map<string, any>> = new Map();

  createObjectStore(name: string) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new MockIDBObjectStore(this.stores.get(name)!);
  }

  transaction(storeNames: string | string[], mode?: string) {
    const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
    const objectStores = stores.map((name) => {
      if (!this.stores.has(name)) {
        this.stores.set(name, new Map());
      }
      return new MockIDBObjectStore(this.stores.get(name)!);
    });
    return new MockIDBTransaction(objectStores);
  }
}

class MockIDBObjectStore {
  constructor(private data: Map<string, any>) {}

  put(value: any, key?: any) {
    const request = new MockIDBRequest();
    const storeKey = key || value.id || JSON.stringify(value);
    this.data.set(storeKey, value);
    request.triggerSuccess(storeKey);
    return request;
  }

  get(key: any) {
    const request = new MockIDBRequest();
    const value = this.data.get(key);
    request.triggerSuccess(value);
    return request;
  }

  getAll() {
    const request = new MockIDBRequest();
    request.triggerSuccess(Array.from(this.data.values()));
    return request;
  }

  delete(key: any) {
    const request = new MockIDBRequest();
    this.data.delete(key);
    request.triggerSuccess(undefined);
    return request;
  }

  clear() {
    const request = new MockIDBRequest();
    this.data.clear();
    request.triggerSuccess(undefined);
    return request;
  }
}

class MockIDBTransaction {
  constructor(private objectStores: MockIDBObjectStore[]) {}

  objectStore(name: string) {
    return this.objectStores[0] || new MockIDBObjectStore(new Map());
  }
}

class MockIDBOpenDBRequest extends MockIDBRequest {
  onupgradeneeded: ((event: any) => void) | null = null;

  triggerUpgrade(db: MockIDBDatabase) {
    if (this.onupgradeneeded) {
      this.onupgradeneeded({ target: { result: db } } as any);
    }
  }
}

class MockIndexedDB {
  private databases: Map<string, MockIDBDatabase> = new Map();

  open(name: string, version?: number) {
    const request = new MockIDBOpenDBRequest();

    if (!this.databases.has(name)) {
      this.databases.set(name, new MockIDBDatabase());
    }

    const db = this.databases.get(name)!;

    // Simulate async behavior
    Promise.resolve().then(() => {
      request.triggerUpgrade(db);
      request.triggerSuccess(db);
    });

    return request;
  }

  deleteDatabase(name: string) {
    const request = new MockIDBRequest();
    this.databases.delete(name);
    request.triggerSuccess(undefined);
    return request;
  }
}

(global as any).indexedDB = new MockIndexedDB();

