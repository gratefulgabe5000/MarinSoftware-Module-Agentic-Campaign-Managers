import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  KeywordGenerationRequest,
  GeneratedKeyword,
  KeywordValidationResult,
} from '../types/keyword-generation.types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Hook for keyword generation
 */
export function useKeywordGeneration() {
  const [keywords, setKeywords] = useState<GeneratedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const generateKeywords = useCallback(
    async (request: KeywordGenerationRequest) => {
      setLoading(true);
      setError(null);
      setProgress(null);

      try {
        const response = await axios.post<{
          success: boolean;
          keywords: GeneratedKeyword[];
          count: number;
        }>(`${API_BASE_URL}/campaigns/keywords/generate`, request, {
          timeout: 60000, // 60 seconds for LLM generation
        });

        if (response.data.success) {
          setKeywords(response.data.keywords);
          return response.data.keywords;
        } else {
          throw new Error('Failed to generate keywords');
        }
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'Failed to generate keywords';
        setError(errorMessage);
        setKeywords([]);
        throw err;
      } finally {
        setLoading(false);
        setProgress(null);
      }
    },
    []
  );

  const generateKeywordsForMultipleProducts = useCallback(
    async (
      products: KeywordGenerationRequest['product'][],
      patterns?: KeywordGenerationRequest['patterns'],
      onProgress?: (current: number, total: number) => void
    ) => {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: products.length });

      const allKeywords: GeneratedKeyword[] = [];

      try {
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          setProgress({ current: i + 1, total: products.length });
          onProgress?.(i + 1, products.length);

          try {
            const request: KeywordGenerationRequest = {
              product,
              patterns,
            };

            const response = await axios.post<{
              success: boolean;
              keywords: GeneratedKeyword[];
              count: number;
            }>(`${API_BASE_URL}/campaigns/keywords/generate`, request, {
              timeout: 60000,
            });

            if (response.data.success) {
              allKeywords.push(...response.data.keywords);
            }
          } catch (err) {
            console.error(`Error generating keywords for product ${i + 1}:`, err);
            // Continue with next product
          }
        }

        setKeywords(allKeywords);
        return allKeywords;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate keywords for multiple products';
        setError(errorMessage);
        setKeywords([]);
        throw err;
      } finally {
        setLoading(false);
        setProgress(null);
      }
    },
    []
  );

  const validateKeywords = useCallback(
    async (keywords: string[]): Promise<KeywordValidationResult[]> => {
      try {
        const response = await axios.post<{
          success: boolean;
          results: KeywordValidationResult[];
          validCount: number;
          invalidCount: number;
        }>(`${API_BASE_URL}/campaigns/keywords/validate`, { keywords }, {
          timeout: 30000,
        });

        if (response.data.success) {
          return response.data.results;
        } else {
          throw new Error('Failed to validate keywords');
        }
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'Failed to validate keywords';
        throw new Error(errorMessage);
      }
    },
    []
  );

  const clearKeywords = useCallback(() => {
    setKeywords([]);
    setError(null);
    setProgress(null);
  }, []);

  return {
    keywords,
    loading,
    error,
    progress,
    generateKeywords,
    generateKeywordsForMultipleProducts,
    validateKeywords,
    clearKeywords,
  };
}

