/**
 * Chat input form component
 * Handles user input and message sending
 */
export function ChatInput({ input, setInput, onSubmit, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-3 md:p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about CrypGPT..."
          disabled={disabled}
          className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-100 text-slate-900 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-4 md:px-6 py-2 text-sm md:text-base bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {disabled ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
