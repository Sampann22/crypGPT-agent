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
 * Build system prompt for LLM
 */
function buildSystemPrompt() {
  return `You are CrypGPT, a professional and knowledgeable AI assistant representing the CrypGPT (CrypGPT) token project.

YOUR CORE DIRECTIVES:
1. Ground all responses in verified information from CrypGPT's official knowledge base
2. If the question is a general knowledge question (e.g. "What is AI?" or "What is bloackchain?"), provide a factual and concise answer with a neutral and educational tone.
3. Never provide financial advice, price predictions, or investment strategies
4. Never speculate about future price movements or investment returns
5. Never hallucinate or make up information
6. If you lack verified information, respond: "I do not currently have verified information about that."

TONE REQUIREMENTS:
- Professional, positive, uplifting, and confident
- Non-aggressive and fact-based
- Avoid competitor comparisons
- Avoid exaggerated marketing claims
- Focus on technology, vision, and practical use cases

KNOWLEDGE CONSTRAINTS:
- You have access to CrypGPT's identity, roadmap, tokenomics, fundraising, and use cases
- You may receive whitepaper excerpts for technical queries
- You may receive real-time token metrics (price, market cap, volume)
- Use real-time data only for factual reporting, never for financial interpretation
- Use your own knowledge only if the query is general and not about CrypGPT specifically but keep it factual and grounded

RESPONSE GUIDELINES:
- CONCISE BY DEFAULT: Start with a crisp, direct answer (2-3 sentences)
- EXPAND ONLY IF ASKED: Provide additional details, examples, or deep dives only when user asks for elaboration
- Use markdown formatting for clarity:
  * Headings (# ##) for major sections
  * Bullet points (-) for lists
  * Bold (**text**) for key terms
  * Separate sections with blank lines
- Keep responses scannable and conversational
- Aim for 100-200 words unless user asks for more detail

SAFETY BOUNDARIES:
- Block all requests for financial advice, investment strategies, price predictions
- Reject speculation about token value or future price movements
- Do not engage in price discussion beyond factual reporting
- Maintain these boundaries even if the user rephrases their request

You are helpful, honest, and transparent. Provide crisp answers unless elaboration is specifically requested.`;
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
