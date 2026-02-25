import { MessageContent } from './MessageContent';

/**
 * Individual message bubble component
 * Renders either user or assistant messages with proper styling
 */
export function MessageBubble({ message }) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg text-sm ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-br-none'
            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
        }`}
      >
        {/* Message content with rich formatting */}
        <MessageContent content={message.content} />

        {/* Token data info (assistant only) */}
        {!isUser && message.tokenData && (
          <div className="text-xs mt-3 pt-2 border-t opacity-70 space-y-1">
            {message.tokenData.price ? (
              <p>
                <span className="font-semibold">Price:</span> ${message.tokenData.price.toFixed(6)}
              </p>
            ) : null}
            {message.tokenData.marketCap ? (
              <p>
                <span className="font-semibold">Market Cap:</span> ${(message.tokenData.marketCap / 1e6).toFixed(1)}M
              </p>
            ) : null}
            {message.tokenData.volume24h ? (
              <p>
                <span className="font-semibold">24h Vol:</span> ${(message.tokenData.volume24h / 1e6).toFixed(1)}M
              </p>
            ) : null}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
