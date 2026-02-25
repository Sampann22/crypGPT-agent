/**
 * Sidebar header component
 * Shows CrypGPT logo and branding
 */
export function SidebarHeader({ onClose }) {
  return (
    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
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
      <button
        onClick={onClose}
        className="md:hidden text-slate-600 hover:text-slate-900 transition"
        aria-label="Close sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
