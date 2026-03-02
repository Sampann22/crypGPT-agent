import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const OPENROUTER_TIMEOUT_MS = Number(process.env.OPENR_TIMEOUT) || 60000; // 60s default
const OPENROUTER_MAX_RETRIES = 2;
const MAX_HISTORY_MESSAGES = 20; // last N user+assistant turns for context

/**
 * Get user-friendly message for OpenRouter errors
 */
function getUserFriendlyErrorMessage(errorMessage) {
  if (!errorMessage) return "The AI service is temporarily unavailable. Please try again in a moment.";
  const lower = errorMessage.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("free-models-per-day") || lower.includes("credits")) {
    return "Daily request limit reached. Please try again later or add credits on OpenRouter.";
  }
  if (lower.includes("provider returned error") || lower.includes("timeout") || lower.includes("unavailable") || lower.includes("econnreset")) {
    return "The AI provider is busy or temporarily unavailable. Please try again in a few moments.";
  }
  return "The AI service could not complete your request. Please try again.";
}

/**
 * Generate response using OpenRouter (with optional chat history)
 * @param {string} systemPrompt
 * @param {string} userPrompt - Current turn user message (or full prompt for this request)
 * @param {Object} options - { temperature, maxTokens, conversationHistory }
 * @param {Array} options.conversationHistory - Optional. [{ role: 'user'|'assistant', content: string }, ...]
 */
async function generateResponse(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500, conversationHistory = [] } = options;

  try {
    return await generateWithOpenRouter(
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      conversationHistory
    );
  } catch (error) {
    const friendlyMessage = getUserFriendlyErrorMessage(error.message);
    const err = new Error(friendlyMessage);
    err.originalMessage = error.message;
    err.isRateLimit = /rate limit|free-models-per-day|credits/i.test(error.message || "");
    throw err;
  }
}

/**
 * OpenRouter API Integration (axios + retry + timeout + chat history)
 */
async function generateWithOpenRouter(
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens,
  conversationHistory = []
) {
  const apiKey = process.env.OPENR_API_KEY;

  if (!apiKey) {
    throw new Error("OPENR_API_KEY not set. Add it to your .env file.");
  }

  const model = process.env.OPENR_MODEL || "google/gemma-2-9b-it:free";
  const url = process.env.OPENR_URL || "https://openrouter.ai/api/v1/chat/completions";

  // Trim history to avoid token overflow; only user/assistant, valid roles
  const trimmedHistory = conversationHistory
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY_MESSAGES);

  const messages = [
    { role: "system", content: systemPrompt },
    ...trimmedHistory,
    { role: "user", content: userPrompt }
  ];

  const payload = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  let lastError;
  for (let attempt = 0; attempt <= OPENROUTER_MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://crypgptai.vercel.app",
          "X-Title": "CrypGPT AI Agent"
        },
        timeout: OPENROUTER_TIMEOUT_MS,
        validateStatus: () => true
      });

      const data = response.data;

      if (response.status !== 200 || data.error) {
        const msg = data?.error?.message || data?.error?.code || response.statusText || "Unknown error";
        if (/rate limit|free-models-per-day|credits/i.test(msg)) {
          throw new Error(msg);
        }
        lastError = new Error(msg);
        if (attempt < OPENROUTER_MAX_RETRIES) continue;
        throw lastError;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error("No content returned from the model.");
        if (attempt < OPENROUTER_MAX_RETRIES) continue;
        throw lastError;
      }

      return content.trim();
    } catch (err) {
      if (err.response?.data?.error?.message) {
        const msg = err.response.data.error.message;
        if (/rate limit|free-models-per-day|credits/i.test(msg)) {
          throw new Error(msg);
        }
        lastError = new Error(msg);
      } else if (axios.isAxiosError(err)) {
        lastError = err.code === "ECONNABORTED"
          ? new Error("Request timeout. The AI is taking too long. Please try again.")
          : new Error(err.message || "Network error");
      } else {
        lastError = err;
      }
      if (attempt === OPENROUTER_MAX_RETRIES) throw lastError;
    }
  }

  throw lastError || new Error("The AI service could not complete your request.");
}

export const aiService = {
  generateResponse,
  getCurrentProvider: () => "openrouter"
};
