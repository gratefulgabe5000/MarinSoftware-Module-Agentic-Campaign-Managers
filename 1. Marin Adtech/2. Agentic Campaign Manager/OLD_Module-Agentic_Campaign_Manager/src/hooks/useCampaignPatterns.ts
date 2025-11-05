import { useState, useEffect, useCallback } from 'react';
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
  }
) {
  const [patterns, setPatterns] = useState<CampaignPatterns | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = useCallback(async () => {
    if (!accountId) {
      setError('Account ID is required');
      return;
    }

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

      const response = await axios.get<{
        success: boolean;
        patterns: CampaignPatterns;
        extractedAt: string;
        sourceCampaigns: string[];
        dateRange?: { startDate: string; endDate: string };
      }>(`${API_BASE_URL}/campaigns/query-patterns`, {
        params,
        timeout: 30000,
      });

      if (response.data.success) {
        setPatterns(response.data.patterns);
      } else {
        throw new Error('Failed to fetch patterns');
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch campaign patterns';
      setError(errorMessage);
      setPatterns(null);
    } finally {
      setLoading(false);
    }
  }, [accountId, options]);

  const refresh = useCallback(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  useEffect(() => {
    if (options?.autoFetch !== false && accountId) {
      fetchPatterns();
    }
  }, [accountId, options?.autoFetch, fetchPatterns]);

  return {
    patterns,
    loading,
    error,
    fetchPatterns,
    refresh,
  };
}

