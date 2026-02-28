import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Custom hook to fetch and manage real-time token data
 * Fetches data on component mount and updates every 30 seconds
 */
export function useTokenData() {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/token-data`);
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
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 60000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { tokenData, loading, error };
}
