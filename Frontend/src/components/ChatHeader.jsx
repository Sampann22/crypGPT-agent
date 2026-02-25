/**
 * Chat header component
 * Displays title and subtitle of the chat interface
 */
export function ChatHeader() {
  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <h2 className="text-xl font-bold text-slate-900">CrypGPT AI Assistant</h2>
      <p className="text-sm text-slate-500">
        Ask anything about CrypGPT token and ecosystem
      </p>
    </div>
  );
}
