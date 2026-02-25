/**
 * Sidebar footer component
 * Shows backend online status
 */
export function SidebarFooter() {
  return (
    <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
      <p className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="font-medium">Backend Status</span>
      </p>
      <p className="text-slate-400 mt-1 text-xs">Online</p>
    </div>
  );
}
