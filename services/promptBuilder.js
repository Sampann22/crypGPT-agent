import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { embeddingStore } from './embeddingStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

/**
 * Load JSON data files
 */
function loadJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    return null;
  }
}

/**
 * Load all structured knowledge
 */
const knowledgeBase = {
  identity: loadJsonFile('identity.json'),
  roadmap: loadJsonFile('roadmap.json'),
  tokenomics: loadJsonFile('tokenomics.json'),
  fundraising: loadJsonFile('fundraising.json'),
  usecases: loadJsonFile('usecases.json')
};

/**
 * Detect financial advice requests
 */
function detectFinancialIntent(query) {
  const financialKeywords = [
    'buy', 'sell', 'invest', 'investment', 'price prediction',
    'predict', 'moon', 'pump', 'dump', 'trading',
    'margin', 'leverage', 'short', 'long', 'hodl',
    'should i invest', 'should i buy', 'make money',
    'get rich', 'profit', 'roi', 'return on investment',
    'financial advice', 'investment strategy', 'portfolio',
    'entry point', 'exit', 'target price', 'price target'
  ];

  const lowerQuery = query.toLowerCase();
  return financialKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Detect user intent from query
 */
function detectIntent(query) {
  const lowerQuery = query.toLowerCase();

  // Price/Market Data intent
  if (/price|market cap|market cap|volume|24h volume|24 hour|trading|value|worth|expensive|cost/.test(lowerQuery)) {
    return 'market-data';
  }

  // Roadmap intent
  if (/roadmap|plans|future|upcoming|next phase|milestones|timeline/.test(lowerQuery)) {
    return 'roadmap';
  }

  // Tokenomics intent
  if (/tokenomics|token distribution|supply|total supply|circulating|allocation|vesting|unlock|emission/.test(lowerQuery)) {
    return 'tokenomics';
  }

  // Supply intent
  if (/supply|max supply|total|circulating supply|how many|quantity/.test(lowerQuery)) {
    return 'supply';
  }

  // Fundraising intent
  if (/fundrais|funding|seed|series|round|capital|invest|raised/.test(lowerQuery)) {
    return 'fundraising';
  }

  // Use cases intent
  if (/use case|application|what can|how to use|utilize|purpose|benefit|solve/.test(lowerQuery)) {
    return 'usecases';
  }

  // Overview intent
  if (/what is|overview|about|explain|describe|tell me|introduce|crypgpt/.test(lowerQuery)) {
    return 'overview';
  }

  // Default
  return 'general';
}

/**
 * Get structured fact from knowledge base
 */
function getStructuredFact(topic) {
  const topics = {
    identity: knowledgeBase.identity,
    roadmap: knowledgeBase.roadmap,
    tokenomics: knowledgeBase.tokenomics,
    fundraising: knowledgeBase.fundraising,
    usecases: knowledgeBase.usecases
  };

  return topics[topic] || null;
}

/**
 * Format knowledge base data into crisp response
 */
function formatKnowledgeBaseFact(topic, data) {
  if (!data) return null;

  const formats = {
    identity: () => {
      return `**${data.token_name}** (${data.symbol}) is an ${data.category}. It addresses complexity and misinformation in crypto by combining AI with blockchain. The token fuels the AI + Blockchain ecosystem designed to make crypto safer, simpler, and more accessible.`;
    },
    tokenomics: () => {
      let text = `**Tokenomics Overview:**\n`;
      if (data.total_supply) {
        const supply = typeof data.total_supply === 'number' 
          ? data.total_supply.toLocaleString() 
          : data.total_supply;
        text += `- **Total Supply:** ${supply} CGPT\n`;
        if (data.supply_type) text += `- **Type:** ${data.supply_type}\n\n`;
      }
      
      if (data.allocation && Array.isArray(data.allocation)) {
        text += `**Token Allocation Breakdown:**\n`;
        data.allocation.forEach(item => {
          const tokens = typeof item.tokens === 'number' 
            ? item.tokens.toLocaleString() 
            : item.tokens;
          text += `- **${item.category}** (${item.percentage}%): ${tokens} tokens\n`;
          if (item.vesting) text += `  *Vesting: ${item.vesting}*\n`;
        });
      }
      
      return text.trim();
    },
    roadmap: () => {
      let text = `**Roadmap Overview:**\n`;
      if (data.overview && data.overview.description) {
        text += `${data.overview.description}\n\n`;
      }
      
      if (data.milestones && Array.isArray(data.milestones)) {
        text += `**Key Milestones:**\n`;
        data.milestones.slice(0, 4).forEach(milestone => {
          const quarter = milestone.quarter || '';
          const year = milestone.year || '';
          text += `- **${quarter} ${year}** - ${milestone.title}\n`;
          if (milestone.goals && Array.isArray(milestone.goals)) {
            milestone.goals.slice(0, 3).forEach(goal => {
              text += `  • ${goal.name}\n`;
            });
          }
        });
      }
      
      return text.trim();
    },
    fundraising: () => {
      let text = `**Fundraising Structure:**\n`;
      if (data.overview && data.overview.strategic_goal) {
        text += `${data.overview.strategic_goal}\n\n`;
      }
      
      if (data.rounds && Array.isArray(data.rounds)) {
        text += `**Funding Rounds:**\n`;
        data.rounds.forEach(round => {
          const raiseAmount = round.target_raise_usd ? '$' + round.target_raise_usd.toLocaleString() : 'N/A';
          const price = round.price_usd ? '$' + round.price_usd : 'N/A';
          const tokens = round.tokens_allocated ? round.tokens_allocated.toLocaleString() : 'N/A';
          text += `- **${round.name}**\n`;
          text += `  Price: ${price} | Tokens: ${tokens} | Target: ${raiseAmount}\n`;
          if (round.vesting) {
            text += `  Vesting: ${round.vesting.tge_unlock_percentage}% TGE, ${round.vesting.monthly_unlock_percentage}% monthly\n`;
          }
        });
      }
      
      return text.trim();
    },
    usecases: () => {
      let text = `**CrypGPT Use Cases:**\n`;
      if (data.overview && data.overview.description) {
        text += `${data.overview.description}\n\n`;
      }
      
      if (data.use_cases && Array.isArray(data.use_cases)) {
        data.use_cases.slice(0, 5).forEach(usecase => {
          text += `- **${usecase.name}** (${usecase.category})\n`;
          text += `  ${usecase.description}\n`;
          if (usecase.primary_benefit) {
            text += `  💡 Benefit: ${usecase.primary_benefit}\n`;
          }
        });
      }
      
      return text.trim();
    }
  };

  return (formats[topic] || (() => null))();
}

/**
 * Retrieve relevant whitepaper sections
 */
async function retrieveWhitepaperSections(query) {
  try {
    const sections = await embeddingStore.findRelevantSections(query, 2);
    if (sections.length === 0) {
      return '';
    }

    return sections
      .map(section => `[${section.title}]\n${section.content}`)
      .join('\n\n');
  } catch (error) {
    console.error('Error retrieving whitepaper sections:', error.message);
    return '';
  }
}

/**
 * Detect if query needs LLM explanation or KB can answer directly
 */
function needsLlmExpansion(query, intent) {
  const expansionKeywords = [
    'explain', 'why', 'how does', 'how can', 'elaborate', 'expand',
    'deep dive', 'tell me more', 'more details', 'understand',
    'benefits', 'advantages', 'impact', 'compared', 'vs',
    'comparison', 'difference', 'pros and cons', 'pros cons',
    'technical', 'mechanism', 'works', 'process'
  ];

  const hasExpansionRequest = expansionKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );

  const simpleTopics = ['identity', 'market-data', 'tokenomics', 'supply'];
  const isSimpleTopic = simpleTopics.includes(intent);

  // If it's a simple topic and no expansion requested, don't need LLM
  return !isSimpleTopic || hasExpansionRequest;
}

/**
 * Build system prompt for LLM – agent-like, no topic restrictions, multi-language
 */
function buildSystemPrompt() {
  return `You are CrypGPT, a helpful AI assistant (like ChatGPT) for the CrypGPT token project. You answer questions clearly and completely.

BEHAVIOR:
- Answer in the SAME LANGUAGE the user writes in (Hindi, English, or any other). If they ask in Hindi, reply in Hindi; if in English, reply in English.
- Provide any details or information the user asks for. There are no topic restrictions.
- Use the provided knowledge base, whitepaper excerpts, and real-time data when relevant. For general or out-of-scope questions, answer from your knowledge in a factual way.
- Be concise by default (2–4 sentences). If the user asks for more detail or explanation, elaborate fully.
- Use markdown when helpful: **bold**, lists (-), headings (##). Keep replies scannable and friendly.

CONTEXT YOU MAY HAVE:
- CrypGPT identity, roadmap, tokenomics, fundraising, use cases
- Optional: whitepaper excerpts, real-time token metrics (price, market cap, volume)
- Use real-time data only for factual reporting when provided.

You are helpful, honest, and transparent. Answer completely and in the user's language.`;
}

/**
 * Build user prompt with context
 */
function buildUserPrompt(query, intent, realTimeData, whitepaperContext, userContext = 'general') {
  let prompt = '';

  // Add real-time data if available
  if (realTimeData) {
    prompt += `[REAL-TIME TOKEN DATA]\n`;
    prompt += `Price: $${realTimeData.price.toFixed(6)}\n`;
    prompt += `Market Cap: $${realTimeData.marketCap.toLocaleString()}\n`;
    prompt += `24h Volume: $${realTimeData.volume24h.toLocaleString()}\n`;
    prompt += `Last Updated: ${realTimeData.lastUpdated}\n\n`;
  }

  // Add structured knowledge based on intent
  if (intent !== 'general') {
    const structuredData = getStructuredFact(intent);
    if (structuredData) {
      prompt += `[VERIFIED KNOWLEDGE - ${intent.toUpperCase()}]\n`;
      prompt += JSON.stringify(structuredData, null, 2) + '\n\n';
    }
  }

  // Add whitepaper context if available
  if (whitepaperContext && whitepaperContext.trim().length > 0) {
    prompt += `[WHITEPAPER REFERENCE]\n${whitepaperContext}\n\n`;
  }

  // Add the user query
  prompt += `User Query: ${query}`;

  return prompt;
}

/**
 * Format response for consistency
 */
function formatResponse(response) {
  return response.trim();
}

export const promptBuilder = {
  detectFinancialIntent,
  detectIntent,
  needsLlmExpansion,
  getStructuredFact,
  formatKnowledgeBaseFact,
  retrieveWhitepaperSections,
  buildSystemPrompt,
  buildUserPrompt,
  formatResponse,
  knowledgeBase
};
