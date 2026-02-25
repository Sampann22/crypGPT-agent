/**
 * Sidebar header component
 * Shows CrypGPT logo and branding
 */
export function SidebarHeader() {
  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-slate-900">CrypGPT</h1>
      </div>
    </div>
  );
}
