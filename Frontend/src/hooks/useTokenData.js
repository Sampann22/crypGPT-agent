import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Custom hook to fetch and manage real-time token data
 * Fetches data on component mount once, then allows manual refresh on demand
 * Returns tokenData, loading state, error state, and a refresh function
 */
export function useTokenData() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokenData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/token-data`);
      if (response.ok) {
        const data = await response.json();
        setTokenData(data.data);
        setError(null);
      } else {
        setError('Failed to fetch token data');
      }
    } catch (err) {
      console.error('Error fetching token data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data once on component mount
  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  return { tokenData, loading, error, refresh: fetchTokenData };
}
