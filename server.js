import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { aiService } from './services/aiService.js';
import { promptBuilder } from './services/promptBuilder.js';
import { realTimeDataService } from './services/realTimeDataService.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: "https://crypgptai.vercel.app/"
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    llmProvider: process.env.LLM_PROVIDER || 'gemini'
  });
});

/**
 * Main AI Assistant endpoint
 * POST /api/chat
 * Body: { query: string, context?: string, temperature?: number, maxTokens?: number }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { query, context = 'general', temperature, maxTokens } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Query must be a non-empty string'
      });
    }

    if (query.length > 2000) {
      return res.status(400).json({
        error: 'Query too long',
        message: 'Query must be less than 2000 characters'
      });
    }

    // Step 1: Check for financial advice requests
    const isFinancialAdvice = promptBuilder.detectFinancialIntent(query);
    if (isFinancialAdvice) {
      return res.json({
        response: 'I cannot provide financial advice, investment strategies, or price predictions. However, I\'m happy to explain CrypGPT\'s technology, tokenomics, roadmap, and use cases. What would you like to know?',
        intent: 'financial_advice_blocked',
        timestamp: new Date().toISOString(),
        responseSource: 'safety_filter'
      });
    }

    // Step 2: Detect intent from structured knowledge
    const intent = promptBuilder.detectIntent(query);

    // Step 3: Fetch real-time data if relevant for market-data queries
    let realTimeData = null;
    if (intent === 'market-data') {
      try {
        realTimeData = await realTimeDataService.fetchTokenData();
      } catch (err) {
        console.error('Error fetching real-time data:', err.message);
      }
    }

    // **THREE-TIER RESPONSE SYSTEM**
    
    // TIER 1: Try to answer directly from knowledge base (crisp, summarized)
    if (!promptBuilder.needsLlmExpansion(query, intent)) {
      const kbData = promptBuilder.getStructuredFact(intent);
      if (kbData) {
        const crispResponse = promptBuilder.formatKnowledgeBaseFact(intent, kbData);
        if (crispResponse) {
          // Add real-time data to response if available
          let finalResponse = crispResponse;
          if (realTimeData && intent === 'market-data') {
            const price = realTimeData.price.toFixed(6);
            const cap = realTimeData.marketCap.toLocaleString();
            const vol = realTimeData.volume24h.toLocaleString();
            finalResponse += '\n\n📊 **Current Market Data:**\n- Price: $' + price + '\n- Market Cap: $' + cap + '\n- 24h Volume: $' + vol;
          }
          return res.json({
            response: finalResponse,
            intent,
            responseSource: 'knowledge_base',
            realTimeData: realTimeData ? {
              price: realTimeData.price,
              marketCap: realTimeData.marketCap,
              volume24h: realTimeData.volume24h,
              lastUpdated: realTimeData.lastUpdated
            } : null,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // TIER 2: Check if whitepaper has relevant content
    const whitepaperContext = await promptBuilder.retrieveWhitepaperSections(query);
    if (whitepaperContext && !promptBuilder.needsLlmExpansion(query, intent)) {
      // Have whitepaper context but query doesn't need LLM expansion - use KB + whitepaper
      const systemPrompt = 'You are CrypGPT assistant. Answer the user\'s question using ONLY the provided knowledge and whitepaper excerpts below. Keep response CONCISE (2-3 sentences). Never make up information.\n\n' + whitepaperContext;
      
      const ltmResponse = await aiService.generateResponse(
        systemPrompt,
        query,
        {
          temperature: 0.3,
          maxTokens: 300
        }
      );

      return res.json({
        response: ltmResponse,
        intent,
        responseSource: 'knowledge_base_whitepaper',
        realTimeData: realTimeData ? {
          price: realTimeData.price,
          marketCap: realTimeData.marketCap,
          volume24h: realTimeData.volume24h,
          lastUpdated: realTimeData.lastUpdated
        } : null,
        timestamp: new Date().toISOString()
      });
    }

    // TIER 3: Use full LLM with complete system prompt (for complex/expansion queries)
    const systemPrompt = promptBuilder.buildSystemPrompt();
    const userPrompt = promptBuilder.buildUserPrompt(
      query,
      intent,
      realTimeData,
      whitepaperContext,
      context
    );

    const finalMaxTokens = promptBuilder.needsLlmExpansion(query, intent) ? 1000 : 400;
    const llmResponse = await aiService.generateResponse(
      systemPrompt,
      userPrompt,
      {
        temperature: temperature || 0.7,
        maxTokens: finalMaxTokens
      }
    );

    res.json({
      response: llmResponse,
      intent,
      responseSource: 'llm_generated',
      realTimeData: realTimeData ? {
        price: realTimeData.price,
        marketCap: realTimeData.marketCap,
        volume24h: realTimeData.volume24h,
        lastUpdated: realTimeData.lastUpdated
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Processing error',
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
});

/**
 * Quick fact endpoint (cached deterministic responses)
 * GET /api/facts/:topic
 * Topics: identity, tokenomics, roadmap, fundraising, usecases
 */
app.get('/api/facts/:topic', (req, res) => {
  try {
    const { topic } = req.params;
    const fact = promptBuilder.getStructuredFact(topic);

    if (!fact) {
      return res.status(404).json({
        error: 'Not found',
        message: `Topic '${topic}' not found`
      });
    }

    res.json({
      topic,
      data: fact,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching fact:', error);
    res.status(500).json({
      error: 'Error',
      message: 'An error occurred while fetching the requested information.'
    });
  }
});

/**
 * Intent detection endpoint (for debugging/testing)
 * POST /api/detect-intent
 * Body: { query: string }
 */
app.post('/api/detect-intent', (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Query must be a non-empty string'
      });
    }

    const intent = promptBuilder.detectIntent(query);
    const isFinancial = promptBuilder.detectFinancialIntent(query);

    res.json({
      query,
      detectedIntent: intent,
      isFinancialAdviceRequest: isFinancial,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error detecting intent:', error);
    res.status(500).json({
      error: 'Error',
      message: 'An error occurred while detecting intent.'
    });
  }
});

/**
 * Real-time data endpoint
 * GET /api/token-data
 */
app.get('/api/token-data', async (req, res) => {
  try {
    const data = await realTimeDataService.fetchTokenData();
    res.json({
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching token data:', error);
    res.status(500).json({
      error: 'Error',
      message: 'Unable to fetch real-time token data'
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/chat',
      'GET /api/facts/:topic',
      'POST /api/detect-intent',
      'GET /api/token-data'
    ]
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
   CrypGPT AI Assistant Backend Started     

 Port:          ${PORT}
 LLM Provider:  ${process.env.LLM_PROVIDER || 'gemini'}
 Environment:   ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
