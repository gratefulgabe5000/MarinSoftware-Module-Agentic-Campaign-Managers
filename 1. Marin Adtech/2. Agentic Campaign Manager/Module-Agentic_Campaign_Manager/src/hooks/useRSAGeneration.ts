import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  RSAGenerationRequest,
  GeneratedRSA,
  AdCopyValidationRequest,
  AdCopyValidationResult,
} from '../types/rsa-generation.types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Hook for RSA generation
 */
export function useRSAGeneration() {
  const [rsas, setRSAs] = useState<GeneratedRSA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const generateRSA = useCallback(
    async (request: RSAGenerationRequest): Promise<GeneratedRSA> => {
      setLoading(true);
      setError(null);
      setProgress(null);

      try {
        const response = await axios.post<{
          success: boolean;
          rsa: GeneratedRSA;
        }>(`${API_BASE_URL}/campaigns/ads/generate-rsa`, request, {
          timeout: 60000, // 60 seconds for LLM generation
        });

        if (response.data.success) {
          setRSAs((prev) => [...prev, response.data.rsa]);
          return response.data.rsa;
        } else {
          throw new Error('Failed to generate RSA');
        }
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'Failed to generate RSA';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        setProgress(null);
      }
    },
    []
  );

  const generateRSAsForMultipleAdGroups = useCallback(
    async (
      requests: RSAGenerationRequest[],
      onProgress?: (current: number, total: number) => void
    ): Promise<GeneratedRSA[]> => {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: requests.length });

      const allRSAs: GeneratedRSA[] = [];

      try {
        for (let i = 0; i < requests.length; i++) {
          const request = requests[i];
          setProgress({ current: i + 1, total: requests.length });
          onProgress?.(i + 1, requests.length);

          try {
            const rsa = await generateRSA(request);
            allRSAs.push(rsa);
          } catch (err) {
            console.error(`Error generating RSA for ad group ${i + 1}:`, err);
            // Continue with next ad group
          }
        }

        setRSAs(allRSAs);
        return allRSAs;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate RSAs for multiple ad groups';
        setError(errorMessage);
        setRSAs([]);
        throw err;
      } finally {
        setLoading(false);
        setProgress(null);
      }
    },
    [generateRSA]
  );

  const validateAdCopy = useCallback(
    async (request: AdCopyValidationRequest): Promise<AdCopyValidationResult> => {
      try {
        const response = await axios.post<{
          success: boolean;
          valid: boolean;
          headlineErrors: string[];
          descriptionErrors: string[];
          headlineWarnings: string[];
          descriptionWarnings: string[];
        }>(`${API_BASE_URL}/campaigns/ads/validate`, request, {
          timeout: 30000,
        });

        if (response.data.success) {
          return {
            valid: response.data.valid,
            headlineErrors: response.data.headlineErrors,
            descriptionErrors: response.data.descriptionErrors,
            headlineWarnings: response.data.headlineWarnings,
            descriptionWarnings: response.data.descriptionWarnings,
          };
        } else {
          throw new Error('Failed to validate ad copy');
        }
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'Failed to validate ad copy';
        throw new Error(errorMessage);
      }
    },
    []
  );

  const clearRSAs = useCallback(() => {
    setRSAs([]);
    setError(null);
    setProgress(null);
  }, []);

  return {
    rsas,
    loading,
    error,
    progress,
    generateRSA,
    generateRSAsForMultipleAdGroups,
    validateAdCopy,
    clearRSAs,
  };
}

