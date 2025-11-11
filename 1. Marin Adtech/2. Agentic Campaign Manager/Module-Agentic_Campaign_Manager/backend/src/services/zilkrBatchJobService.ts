/**
 * Zilkr Batch Job Service
 * Implements Zilkr Dispatcher API batch job operations for bulk campaign creation
 */

import axios from 'axios';
import * as AWSXRay from 'aws-xray-sdk-core';
import config from '../config/env';
import {
  BatchOperation,
  BatchJobRequest,
  BatchJobResponse,
  BatchJobStatus,
  AddBatchOperationsRequest,
  AddBatchOperationsResponse,
  BatchJobResultsResponse,
  BatchJobResult,
  ZilkrCampaignRequest,
} from '../types/zilkrDispatcher.types';

/**
 * Zilkr Batch Job Service
 * Handles batch job operations for bulk campaign creation
 */
export class ZilkrBatchJobService {
  private apiUrl: string; // Full ALB URL (e.g., http://meridian-dispatcher-alb-dev-1234567890.us-east-1.elb.amazonaws.com)
  private accountId: string;
  private publisher: string;
  private httpClient: ReturnType<typeof axios.create>;

  constructor(accountId?: string, publisher: string = 'google') {
    // Use DISPATCHER_URL from environment (InfraDocs pattern - set by CloudFormation)
    // Fallback to baseUrl for local development
    const dispatcherUrl = process.env.DISPATCHER_URL || config.zilkrDispatcher.baseUrl;
    if (!dispatcherUrl) {
      throw new Error('DISPATCHER_URL or ZILKR_DISPATCHER_BASE_URL must be set');
    }

    this.apiUrl = dispatcherUrl; // Full ALB URL, not base path
    this.accountId = accountId || config.zilkrDispatcher.accountId;
    this.publisher = publisher;

    // Create axios instance with timeout
    // Note: X-Ray tracing will be added per-request in methods
    this.httpClient = axios.create({
      baseURL: this.apiUrl, // Full URL including protocol
      timeout: config.zilkrDispatcher.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Build API endpoint path
   * NOTE: Actual API uses /api/v2/dispatcher/ (verified via testing)
   * InfraDocs shows /dispatcher/ but actual API requires /api/v2/dispatcher/
   * The 404 error when using /dispatcher/ confirms the actual API path is /api/v2/dispatcher/
   */
  private buildApiPath(endpoint: string): string {
    // Actual API path format: /api/v2/dispatcher/${publisher}/batch-jobs
    // Verified: /dispatcher/ returns 404, /api/v2/dispatcher/ returns 200/500 (but endpoint exists)
    return `/api/v2/dispatcher/${this.publisher}${endpoint}`;
  }

  /**
   * Delay helper for polling
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a new batch job
   *
   * Creates an empty batch job that operations can be added to. The job must be
   * created before adding operations. Operations can be added in chunks of up to
   * 1000 per request.
   *
   * @returns Promise<{ batchJobId: string }> Unique batch job ID for subsequent operations
   *
   * @example
   * ```typescript
   * const service = new ZilkrBatchJobService();
   * const { batchJobId } = await service.createBatchJob();
   * console.log('Created batch job:', batchJobId);
   * // Then add operations and run the job
   * ```
   *
   * @error Throws error if API returns non-201 status or if request fails
   */
  async createBatchJob(): Promise<{ batchJobId: string }> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.createBatchJob');

    try {
      const request: BatchJobRequest = {
        accountId: this.accountId,
        publisher: this.publisher,
      };

      const response = await this.httpClient.post<BatchJobResponse>(
        this.buildApiPath('/batch-jobs'), // InfraDocs format: /dispatcher/${publisher}/batch-jobs
        request
      );

      subsegment?.close();

      return { batchJobId: response.data.id };
    } catch (error: any) {
      subsegment?.close();
      throw new Error(`Failed to create batch job: ${error.message}`);
    }
  }

  /**
   * Add operations to an existing batch job
   * @param batchJobId - The batch job ID
   * @param operations - Array of operations to add (max 1000 per request)
   * @param sequenceToken - Optional sequence token from previous add operations call
   * @returns Sequence token and total operations added
   */
  async addOperationsToBatch(
    batchJobId: string,
    operations: BatchOperation[],
    sequenceToken?: string
  ): Promise<{ sequenceToken?: string; totalOperationsAdded: number }> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.addOperationsToBatch');

    try {
      // Validate batchJobId
      if (!batchJobId || typeof batchJobId !== 'string' || batchJobId.trim().length === 0) {
        subsegment?.close();
        throw new Error('batchJobId is required and must be a non-empty string');
      }

      // Validate operations (max 1000 per request)
      if (operations.length > 1000) {
        subsegment?.close();
        throw new Error('Maximum 1000 operations per request');
      }

      if (operations.length === 0) {
        subsegment?.close();
        throw new Error('At least one operation is required');
      }

      const payload: AddBatchOperationsRequest = {
        operations,
      };
      if (sequenceToken) {
        payload.sequenceToken = sequenceToken;
      }

      const response = await this.httpClient.put<AddBatchOperationsResponse>(
        this.buildApiPath(`/batch-jobs/${batchJobId}/operations`), // InfraDocs format
        payload
      );

      subsegment?.close();

      return {
        sequenceToken: response.data.sequenceToken,
        totalOperationsAdded: response.data.operationsAdded,
      };
    } catch (error: any) {
      subsegment?.close();
      throw new Error(`Failed to add operations to batch: ${error.message}`);
    }
  }

  /**
   * Run a batch job (start execution)
   *
   * Starts the execution of a batch job. All operations must be added before
   * calling this method. Once started, the job will process operations asynchronously.
   * Use pollBatchJobStatus to monitor completion.
   *
   * @param batchJobId - The batch job ID to run (required)
   * @returns Promise<void> Resolves when job execution has started
   *
   * @example
   * ```typescript
   * const batchJobId = '...';
   * await service.runBatchJob(batchJobId);
   * console.log('Batch job started, polling status...');
   * const status = await service.pollBatchJobStatus(batchJobId);
   * ```
   *
   * @error Throws error if batchJobId is empty or invalid
   * @error Throws error if API request fails (network error, etc.)
   */
  async runBatchJob(batchJobId: string): Promise<void> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.runBatchJob');

    try {
      // Validate batchJobId
      if (!batchJobId || typeof batchJobId !== 'string' || batchJobId.trim().length === 0) {
        subsegment?.close();
        throw new Error('batchJobId is required and must be a non-empty string');
      }

      await this.httpClient.post(
        this.buildApiPath(`/batch-jobs/${batchJobId}/run`) // InfraDocs format
      );

      subsegment?.close();
    } catch (error: any) {
      subsegment?.close();
      throw new Error(`Failed to run batch job: ${error.message}`);
    }
  }

  /**
   * Poll batch job status until completion
   * @param batchJobId - The batch job ID
   * @param maxAttempts - Maximum number of polling attempts (default: 120)
   * @param intervalMs - Initial polling interval in milliseconds (default: 5000)
   * @returns Final batch job status
   */
  async pollBatchJobStatus(
    batchJobId: string,
    maxAttempts: number = 120,
    intervalMs: number = 5000
  ): Promise<BatchJobResponse> {
    // Validate batchJobId
    if (!batchJobId || typeof batchJobId !== 'string' || batchJobId.trim().length === 0) {
      throw new Error('batchJobId is required and must be a non-empty string');
    }

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const segment = AWSXRay.getSegment();
        const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.pollBatchJobStatus');

        const response = await this.httpClient.get<BatchJobResponse>(
          this.buildApiPath(`/batch-jobs/${batchJobId}`) // InfraDocs format
        );

        subsegment?.close();

        const status = response.data;

        // Check jobStatus field (not status field - BatchJobResponse has jobStatus)
        if (status.jobStatus === 'DONE' || status.jobStatus === 'FAILED' || status.jobStatus === 'CANCELLED') {
          return status;
        }

        // Exponential backoff (5s, 10s, 15s, max 30s)
        const delay = Math.min(intervalMs * (i + 1), 30000);
        await this.delay(delay);
      } catch (error: any) {
        if (i === maxAttempts - 1) {
          throw new Error(`Batch job polling failed: ${error.message}`);
        }
        // Continue polling on error
        await this.delay(intervalMs);
      }
    }

    throw new Error('Batch job timeout: exceeded max polling attempts');
  }

  /**
   * Get batch job results
   * @param batchJobId - The batch job ID
   * @returns Batch job results with summary and individual operation results
   */
  async getBatchJobResults(batchJobId: string): Promise<BatchJobResultsResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.getBatchJobResults');

    try {
      // Validate batchJobId
      if (!batchJobId || typeof batchJobId !== 'string' || batchJobId.trim().length === 0) {
        subsegment?.close();
        throw new Error('batchJobId is required and must be a non-empty string');
      }

      const response = await this.httpClient.get<BatchJobResultsResponse>(
        this.buildApiPath(`/batch-jobs/${batchJobId}/results`) // InfraDocs format
      );

      subsegment?.close();

      return response.data; // Returns { jobId, jobStatus, summary, results, nextPageToken }
    } catch (error: any) {
      subsegment?.close();
      throw new Error(`Failed to get batch job results: ${error.message}`);
    }
  }

  /**
   * Chunk operations into smaller arrays
   * @param items - Array of items to chunk
   * @param chunkSize - Size of each chunk
   * @returns Array of chunks
   */
  private chunkOperations<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Create batch operations from campaign requests
   * @param campaigns - Array of campaign requests
   * @returns Array of batch operations
   */
  private createBatchOperationsFromCampaigns(
    campaigns: ZilkrCampaignRequest[]
  ): BatchOperation[] {
    return campaigns.map((campaign) => ({
      operationType: 'CREATE' as const,
      resourceType: 'CAMPAIGN' as const,
      resource: {
        ...campaign,
        accountId: campaign.accountId || this.accountId,
      },
    }));
  }

  /**
   * Bulk create campaigns using batch job
   * High-level method that orchestrates the entire batch job flow:
   * 1. Create batch job
   * 2. Add operations in chunks of 1000
   * 3. Run batch job
   * 4. Poll until complete
   * 5. Get and return results
   *
   * @param campaigns - Array of campaign requests to create
   * @returns Batch job results with summary and individual operation results
   */
  async bulkCreateCampaigns(
    campaigns: ZilkrCampaignRequest[]
  ): Promise<BatchJobResultsResponse> {
    const segment = AWSXRay.getSegment();
    const subsegment = segment?.addNewSubsegment('ZilkrBatchJobService.bulkCreateCampaigns');

    try {
      // Validate campaigns array
      if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
        subsegment?.close();
        throw new Error('campaigns array is required and must contain at least one campaign');
      }

      // 1. Create batch job
      const { batchJobId } = await this.createBatchJob();

      // 2. Create batch operations from campaigns
      const operations = this.createBatchOperationsFromCampaigns(campaigns);

      // 3. Add operations in chunks of 1000 (Zilkr API limit)
      const chunks = this.chunkOperations(operations, 1000);
      let sequenceToken: string | undefined;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const result = await this.addOperationsToBatch(
          batchJobId,
          chunk,
          sequenceToken
        );
        sequenceToken = result.sequenceToken;
      }

      // 4. Run batch job
      await this.runBatchJob(batchJobId);

      // 5. Poll until complete
      const status = await this.pollBatchJobStatus(batchJobId);

      if (status.jobStatus === 'FAILED' || status.jobStatus === 'CANCELLED') {
        subsegment?.close();
        throw new Error(
          `Batch job ${status.jobStatus.toLowerCase()}: ${batchJobId}`
        );
      }

      // 6. Get results (includes summary)
      const results = await this.getBatchJobResults(batchJobId);

      subsegment?.close();

      return results; // Returns { jobId, jobStatus, summary: { total, successful, failed }, results, nextPageToken }
    } catch (error: any) {
      subsegment?.close();
      throw new Error(`Bulk campaign creation failed: ${error.message}`);
    }
  }
}

