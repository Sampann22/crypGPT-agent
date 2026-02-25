/**
 * Chat header component
 * Displays title, subtitle, and mobile menu toggle
 */
export function ChatHeader({ onMenuClick, tokenData }) {
  return (
    <div className="bg-white border-b border-slate-200 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden text-slate-600 hover:text-slate-900 transition"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">CrypGPT AI Assistant</h2>
              <p className="text-xs md:text-sm text-slate-500">
                Ask anything about CrypGPT token and ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile token info */}
      {tokenData && (
        <div className="md:hidden grid grid-cols-3 gap-3 p-2 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">Price</p>
            <p className="text-sm font-bold text-slate-900">
              ${tokenData.price?.toFixed(6) || 'N/A'}
            </p>
          </div>
          <div className="text-center border-l border-r border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Market Cap</p>
            <p className="text-sm font-bold text-slate-900">
              {tokenData.marketCap ? (
                tokenData.marketCap >= 1e9 ? `$${(tokenData.marketCap / 1e9).toFixed(2)}B` :
                tokenData.marketCap >= 1e6 ? `$${(tokenData.marketCap / 1e6).toFixed(1)}M` :
                `$${tokenData.marketCap.toLocaleString()}`
              ) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">24h Vol</p>
            <p className="text-sm font-bold text-slate-900">
              {tokenData.volume24h ? (
                tokenData.volume24h >= 1e9 ? `$${(tokenData.volume24h / 1e9).toFixed(2)}B` :
                tokenData.volume24h >= 1e6 ? `$${(tokenData.volume24h / 1e6).toFixed(1)}M` :
                `$${tokenData.volume24h.toLocaleString()}`
              ) : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
