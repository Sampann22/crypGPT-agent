import { SidebarHeader } from './SidebarHeader';
import { TokenInfo } from './TokenInfo';
import { QuickQuestions } from './QuickQuestions';
import { SidebarFooter } from './SidebarFooter';

/**
 * Sidebar component
 * Contains logo, token info, quick questions, and API status
 */
export function Sidebar({ tokenData, onSelectQuestion, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 h-screen bg-white border-r border-slate-200 flex flex-col shadow-lg md:shadow-sm z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarHeader onClose={onClose} />
        <TokenInfo tokenData={tokenData} />
        <QuickQuestions onSelectQuestion={() => {
          onSelectQuestion.apply(this, arguments);
          onClose();
        }} />
        <SidebarFooter />
      </div>
    </>
  );
}
