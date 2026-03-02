import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const CHAT_TIMEOUT_MS = Number(import.meta.env.VITE_CHAT_TIMEOUT) || 90000; // 90s for LLM
const MAX_HISTORY_MESSAGES = 20; // last N messages to send for chat memory

const chatClient = axios.create({
  baseURL: API_BASE,
  timeout: CHAT_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Build history array for API from messages state (role + content only)
 */
function buildHistory(messages, max = MAX_HISTORY_MESSAGES) {
  return messages
    .slice(-max)
    .map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content : ''
    }))
    .filter(m => m.content.trim());
}

/**
 * Custom hook to handle chat message sending and receiving
 * Uses axios for timeout and clearer error handling
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const { data } = await chatClient.post('/chat', {
        query,
        maxTokens: 2000,
        history: buildHistory(messages)
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        intent: data.intent,
        responseSource: data.responseSource,
        tokenData: data.realTimeData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message || err.message || (err.code === 'ECONNABORTED' ? 'Request took too long. Please try again.' : 'Failed to get response'))
        : (err instanceof Error ? err.message : 'An error occurred');
      setError(message);
      if (import.meta.env.DEV) {
        console.error('Chat error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    setError
  };
}
