import { useState } from 'react';

/**
 * Token data display component
 * Shows real-time token price, market cap, and volume
 * Handles loading and error states, displays "N/A" for missing data
 * Includes a refresh button to manually update token data
 */
export function TokenInfo({ tokenData, tokenError, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };
  if (tokenError) {
    return (
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-xs font-semibold text-slate-600 uppercase mb-3 tracking-wide">
          Token Info
        </h3>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-700 font-medium">Error getting the live data</p>
          <button
            onClick={async () => {
              await onRefresh?.();
            }}
            className="mt-2 px-3 py-1 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 rounded transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-xs font-semibold text-slate-600 uppercase mb-3 tracking-wide">
          Token Info
        </h3>
        <p className="text-xs text-slate-400 italic">Loading market data...</p>
      </div>
    );
  }

  // Helper function to format currency values
  const formatCurrency = (value) => {
    if (!value || value === 0) return 'N/A';
    return `$${value.toFixed(6)}`;
  };

  const formatMarketCap = (value) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatVolume = (value) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const isDemo = tokenData.source === 'demo' || tokenData.source === 'mock';
  const sourceLabel = {
    'coingecko': '📊 CoinGecko',
    'coinmarketcap': '📈 CoinMarketCap',
    'demo': '📋 Demo Data',
    'mock': '📋 Demo Data'
  };

  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Token Info
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 text-slate-600 hover:text-slate-800 disabled:text-slate-400 rounded transition-colors duration-200 flex items-center gap-1 whitespace-nowrap"
          title="Refresh token data"
        >
          <span className={`inline-block ${isRefreshing ? 'animate-spin' : ''}`}>
            ↻
          </span>
          {isRefreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500 font-medium">Price (USD)</p>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(tokenData.price)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Market Cap</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatMarketCap(tokenData.marketCap)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">24h Volume</p>
          <p className="text-sm font-semibold text-slate-900">
            {formatVolume(tokenData.volume24h)}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <p className={`text-xs font-medium ${isDemo ? 'text-amber-600' : 'text-green-600'}`}>
            {sourceLabel[tokenData.source] || 'Live Data'}
          </p>
          {isDemo && (
            <p className="text-xs text-amber-500 mt-1 italic">
              For demonstration. Real data unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
