import { ChatHeader } from './ChatHeader';
import { MessagesContainer } from './MessagesContainer';
import { ChatInput } from './ChatInput';

/**
 * Main chat area component
 * Contains header, messages, input, and loading/error states
 */
export function ChatArea({
  messages,
  loading,
  error,
  input,
  setInput,
  onSendMessage,
  messagesEndRef
}) {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-zinc-100">
      <ChatHeader />
      <MessagesContainer
        messages={messages}
        loading={loading}
        error={error}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={onSendMessage}
        disabled={loading}
      />
    </div>
  );
}
