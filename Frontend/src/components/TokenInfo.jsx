/**
 * Token data display component
 * Shows real-time token price, market cap, and volume
 * Handles loading and error states, displays "N/A" for missing data
 */
export function TokenInfo({ tokenData }) {
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
      <h3 className="text-xs font-semibold text-slate-600 uppercase mb-3 tracking-wide">
        Token Info
      </h3>
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
