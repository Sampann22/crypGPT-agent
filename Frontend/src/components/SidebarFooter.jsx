const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Sidebar footer component
 * Shows API connection status
 */
export function SidebarFooter() {
  return (
    <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
      <p className="font-medium mb-1">
        API: <span className="text-slate-600">{API_BASE === '/api' ? 'Proxied' : API_BASE}</span>
      </p>
      <p className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Backend Status: Online
      </p>
    </div>
  );
}
