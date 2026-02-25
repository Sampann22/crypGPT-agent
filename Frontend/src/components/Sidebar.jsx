import { SidebarHeader } from './SidebarHeader';
import { TokenInfo } from './TokenInfo';
import { QuickQuestions } from './QuickQuestions';
import { SidebarFooter } from './SidebarFooter';

/**
 * Sidebar component
 * Contains logo, token info, quick questions, and API status
 */
export function Sidebar({ tokenData, onSelectQuestion }) {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <SidebarHeader />
      <TokenInfo tokenData={tokenData} />
      <QuickQuestions onSelectQuestion={onSelectQuestion} />
      <SidebarFooter />
    </div>
  );
}
