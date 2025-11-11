import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  AdGroupGenerationRequest,
  GeneratedAdGroup,
} from '../types/adgroup-generation.types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Hook for ad group generation
 */
export function useAdGroupGeneration() {
  const [adGroups, setAdGroups] = useState<GeneratedAdGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAdGroups = useCallback(
    async (request: AdGroupGenerationRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post<{
          success: boolean;
          adGroups: GeneratedAdGroup[];
          count: number;
        }>(`${API_BASE_URL}/campaigns/adgroups/generate`, request, {
          timeout: 30000,
        });

        if (response.data.success) {
          setAdGroups(response.data.adGroups);
          return response.data.adGroups;
        } else {
          throw new Error('Failed to generate ad groups');
        }
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'Failed to generate ad groups';
        setError(errorMessage);
        setAdGroups([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearAdGroups = useCallback(() => {
    setAdGroups([]);
    setError(null);
  }, []);

  return {
    adGroups,
    loading,
    error,
    generateAdGroups,
    clearAdGroups,
  };
}

