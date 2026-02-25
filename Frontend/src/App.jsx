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
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (query) => {
    await sendMessage(query);
  };

  // Handle quick question click
  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      {/* Sidebar */}
      <Sidebar
        tokenData={tokenData}
        onSelectQuestion={handleQuickQuestion}
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
      />
    </div>
  );
}
