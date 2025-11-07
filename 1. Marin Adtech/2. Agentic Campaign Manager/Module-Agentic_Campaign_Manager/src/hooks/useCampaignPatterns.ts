import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  CampaignPatterns,
  PatternExtractionRequest,
} from '../types/campaign-patterns.types';

const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3001/api';

/**
 * Hook for fetching and managing campaign patterns
 */
export function useCampaignPatterns(
  accountId?: string,
  options?: {
    dateRange?: { startDate: string; endDate: string };
    campaignIds?: string[];
    minCTR?: number;
    minConversions?: number;
    autoFetch?: boolean;
    productName?: string; // Optional product name for product-specific patterns
  }
) {
  const [patterns, setPatterns] = useState<CampaignPatterns | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const hasFetchedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const fetchPatterns = useCallback(async () => {
    if (!accountId) {
      setError('Account ID is required');
      return;
    }

    // Prevent concurrent requests using ref (avoids dependency issues)
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        accountId,
      };

      if (options?.dateRange) {
        params.startDate = options.dateRange.startDate;
        params.endDate = options.dateRange.endDate;
      }

      if (options?.campaignIds && options.campaignIds.length > 0) {
        params.campaignIds = options.campaignIds;
      }

      if (options?.minCTR !== undefined) {
        params.minCTR = options.minCTR;
      }

      if (options?.minConversions !== undefined) {
        params.minConversions = options.minConversions;
      }

      if (options?.productName) {
        params.productName = options.productName;
      }

      const response = await axios.get<{
        success: boolean;
        patterns: CampaignPatterns;
        extractedAt: string;
        sourceCampaigns: string[];
        dateRange?: { startDate: string; endDate: string };
        isMockData?: boolean;
      }>(`${API_BASE_URL}/campaigns/query-patterns`, {
        params,
        timeout: 30000,
      });

      if (response.data.success) {
        setPatterns(response.data.patterns);
        setIsMockData(response.data.isMockData || false);
        hasFetchedRef.current = true;
      } else {
        throw new Error('Failed to fetch patterns');
      }
    } catch (err) {
      // If API fails, provide user-friendly error message
      let errorMessage = 'Failed to fetch campaign patterns';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_INSUFFICIENT_RESOURCES' || err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again or use default patterns.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setPatterns(null);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [accountId, options?.dateRange, options?.campaignIds, options?.minCTR, options?.minConversions, options?.productName]);

  const refresh = useCallback(() => {
    hasFetchedRef.current = false;
    fetchPatterns();
  }, [fetchPatterns]);

  useEffect(() => {
    // Only fetch once when component mounts or accountId changes
    if (options?.autoFetch !== false && accountId && !hasFetchedRef.current && !isLoadingRef.current) {
      // Reset fetch flag when accountId changes
      if (hasFetchedRef.current) {
        hasFetchedRef.current = false;
      }
      fetchPatterns();
    }
    // Note: Intentionally not including fetchPatterns in deps to prevent infinite loops
    // The refs ensure we only fetch once per accountId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return {
    patterns,
    loading,
    error,
    isMockData,
    fetchPatterns,
    refresh,
  };
}

