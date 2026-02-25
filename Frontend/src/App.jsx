import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useTokenData } from './hooks/useTokenData';
import { useChat } from './hooks/useChat';

/**
 * Main App Component
 * Orchestrates sidebar and chat area, manages state and API communication
 */
export function App() {
  const { tokenData } = useTokenData();
  const {
    messages,
    loading,
    error,
    sendMessage
  } = useChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (query) => {
    setSidebarOpen(false);
    await sendMessage(query);
  };

  // Handle quick question click
  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  // Close sidebar on mobile navigation
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen md:h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        tokenData={tokenData}
        onSelectQuestion={handleQuickQuestion}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        loading={loading}
        error={error}
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        tokenData={tokenData}
      />
    </div>
  );
}
