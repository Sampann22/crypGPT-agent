import dotenv from "dotenv";
dotenv.config();

/**
 * Generate response using OpenRouter ONLY
 */
async function generateResponse(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500 } = options;

  try {
    return await generateWithOpenRouter(
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens
    );
  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}

/**
 * OpenRouter API Integration
 */
async function generateWithOpenRouter(
  systemPrompt,
  userPrompt,
  temperature,
  maxTokens
) {
  const apiKey = process.env.OPENR_API_KEY;

  if (!apiKey) {
    throw new Error("OPENR_API_KEY not set in environment variables");
  }

  const model =
    process.env.OPENR_MODEL || "amazon/nova-2-lite-v1:free";

  const url =
    process.env.OPENR_URL ||
    "https://openrouter.ai/api/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://yourdomain.com", // required by OpenRouter
      "X-Title": "Crypto AI Agent"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API error: ${
        error?.error?.message || response.statusText || "Unknown error"
      }`
    );
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from OpenRouter");
  }

  return content.trim();
}

export const aiService = {
  generateResponse,
  getCurrentProvider: () => "openrouter"
};