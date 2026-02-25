import dotenv from 'dotenv';

dotenv.config();

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini';

/**
 * Generate response using selected LLM provider
 */
async function generateResponse(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500 } = options;

  try {
    switch (LLM_PROVIDER.toLowerCase()) {
      case 'openai':
        return await generateWithOpenAI(systemPrompt, userPrompt, temperature, maxTokens);
      case 'claude':
        return await generateWithClaude(systemPrompt, userPrompt, temperature, maxTokens);
      case 'gemini':
      default:
        return await generateWithGemini(systemPrompt, userPrompt, temperature, maxTokens);
    }
  } catch (error) {
    console.error(`Error with ${LLM_PROVIDER}:`, error.message);
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}

/**
 * Generate response using Google Gemini API
 */
async function generateWithGemini(systemPrompt, userPrompt, temperature, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set in environment variables');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature:0.4,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content in Gemini response');
  }

  return content.trim();
}

/**
 * Generate response using OpenAI API
 */
async function generateWithOpenAI(systemPrompt, userPrompt, temperature, maxTokens) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set in environment variables');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return content.trim();
}

/**
 * Generate response using Anthropic Claude API
 */
async function generateWithClaude(systemPrompt, userPrompt, temperature, maxTokens) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not set in environment variables');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: temperature * 0.5 // Claude uses different temperature scale
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in Claude response');
  }

  return content.trim();
}

export const aiService = {
  generateResponse,
  getCurrentProvider: () => LLM_PROVIDER
};
