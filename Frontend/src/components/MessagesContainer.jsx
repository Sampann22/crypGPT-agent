import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorAlert } from './ErrorAlert';

/**
 * Messages container component
 * Displays all chat messages, loading state, and errors
 */
export function MessagesContainer({ messages, loading, error, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Welcome to CrypGPT
            </h3>
            <p className="text-slate-500">
              Ask me about CrypGPT tokenomics, roadmap, use cases, or anything else!
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && <LoadingIndicator />}
          {error && <ErrorAlert message={error} />}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
