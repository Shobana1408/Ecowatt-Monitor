import { useState, useEffect, useCallback } from 'react';
import { apiService, SummaryData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useSummary = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchSummary = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch summary');
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (!authLoading) {
      fetchSummary();
    }
  }, [fetchSummary, authLoading]);

  return { summary, isLoading, error, refreshSummary: fetchSummary };
};

