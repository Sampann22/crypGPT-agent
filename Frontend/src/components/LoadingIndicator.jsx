/**
 * Loading indicator component
 * Shows animated loading state while waiting for bot response
 */
export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
          <div
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}
