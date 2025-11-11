/**
 * Sync Queue Utilities
 * Handles request queuing for offline scenarios
 */

/**
 * Queued Request Interface
 */
interface QueuedRequest {
  id: string;
  type: 'performance' | 'campaign' | 'status';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  timestamp: Date;
  retries: number;
  maxRetries: number;
}

/**
 * Sync Queue State
 */
interface SyncQueueState {
  requests: QueuedRequest[];
  isProcessing: boolean;
  isOnline: boolean;
}

/**
 * Sync Queue Manager
 */
class SyncQueueManager {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private isOnline = navigator.onLine;
  private processingInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.listeners.forEach((listener) => listener(true));
    this.processQueue();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.listeners.forEach((listener) => listener(false));
  }

  /**
   * Add request to queue
   */
  queueRequest(
    type: QueuedRequest['type'],
    method: QueuedRequest['method'],
    url: string,
    data?: any,
    params?: Record<string, any>,
    maxRetries: number = 3
  ): string {
    const request: QueuedRequest = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      method,
      url,
      data,
      params,
      timestamp: new Date(),
      retries: 0,
      maxRetries,
    };

    this.queue.push(request);
    
    // Try to process if online
    if (this.isOnline) {
      this.processQueue();
    }

    return request.id;
  }

  /**
   * Process queued requests
   */
  async processQueue(): Promise<void> {
    if (!this.isOnline || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const request = this.queue[0];

      try {
        await this.executeRequest(request);
        // Request succeeded, remove from queue
        this.queue.shift();
      } catch (error) {
        // Request failed
        request.retries++;

        if (request.retries >= request.maxRetries) {
          // Max retries reached, remove from queue
          console.error(`Request ${request.id} failed after ${request.maxRetries} retries`);
          this.queue.shift();
        } else {
          // Move to end of queue for retry
          this.queue.shift();
          this.queue.push(request);
        }
      }
    }

    this.isProcessing = false;

    // Schedule next processing attempt if queue not empty
    if (this.queue.length > 0 && this.isOnline) {
      this.scheduleNextProcess();
    }
  }

  /**
   * Execute a queued request
   */
  private async executeRequest(_request: QueuedRequest): Promise<void> {
    // This is a placeholder - in production, this would execute the actual request
    // For MVP, we'll simulate request execution
    // In production, this would use the appropriate service method
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Schedule next queue processing
   */
  private scheduleNextProcess(): void {
    if (this.processingInterval) {
      clearTimeout(this.processingInterval);
    }

    this.processingInterval = setTimeout(() => {
      this.processQueue();
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Get queue status
   */
  getQueueStatus(): SyncQueueState {
    return {
      requests: [...this.queue],
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
    };
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Check if online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add online/offline listener
   */
  addConnectionListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners = [];
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueManager();

// Export types
export type { QueuedRequest, SyncQueueState };

