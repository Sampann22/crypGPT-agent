# CrypGPT API Optimization Strategy

## Overview
To minimize Gemini API token usage and improve response speed, the system uses a **3-tier response architecture** that tries to answer queries using the knowledge base first, and only uses the LLM (Gemini) when necessary.

---

## Three-Tier Response System

### TIER 1: Direct Knowledge Base Response 🎯 (40-60% of queries)
**Triggered when:**
- Query intent matches a structured knowledge topic (identity, tokenomics, roadmap, fundraising, usecases)
- User is NOT asking for expansion/elaboration (no keywords like "explain", "why", "how does", etc.)

**Response Characteristics:**
- **Source:** Formatted directly from JSON files (identity.json, tokenomics.json, etc.)
- **Length:** ~100-150 words (crisp & summarized)
- **Speed:** Instant (no API call to Gemini)
- **Cost:** 0 Gemini API tokens used ✅
- **Format:** Markdown bullet points and concise text

**Example Queries:**
- "What is CrypGPT?" → Uses identity.json
- "Tell me about the roadmap" → Uses roadmap.json
- "What's the token distribution?" → Uses tokenomics.json
- "What are the use cases?" → Uses usecases.json
- "When was the seed round?" → Uses fundraising.json

**Example Response:**
```
**CrypGPT** (CGPT) is an AI + Blockchain ecosystem token designed to address 
complexity and misinformation in crypto. It fuels an intelligent, transparent 
platform that unifies security, simplicity, and real-world utility for the 
global crypto community.

Current Market Data:
- Price: $0.15
- Market Cap: $25M
- 24h Volume: $2.5M
```

---

### TIER 2: Knowledge Base + Whitepaper 📄 (20-30% of queries)
**Triggered when:**
- KB has relevant data but query mentions keywords like "explain", "elaborate", "expand"
- OR whitepaper has matching content for technical queries
- BUT doesn't need full LLM reasoning

**Response Characteristics:**
- **Source:** Formatted KB data + matched whitepaper sections
- **Length:** ~200-300 words (moderate detail)
- **Speed:** Fast (minimal LLM processing)
- **Cost:** 30-50% less Gemini tokens than Tier 3
- **Temperature:** 0.3 (more deterministic, less creative)
- **Max tokens:** 300 tokens per response

**Example Queries:**
- "Explain the tokenomics" → KB + whitepaper context
- "Can you elaborate on the roadmap?" → KB + whitepaper context
- "How does the voting mechanism work?" → Whitepaper-focused

**Example Response:**
```
**Tokenomics Overview**

The CrypGPT tokenomics is designed for sustainable growth and community participation:

- Total Supply: 1 billion CGPT
- Circulating: 400M (~40%)
- Allocation: Community (40%), Team (20%), Treasury (20%), Partnerships (20%)

[Detailed explanation with whitepaper context...]
```

---

### TIER 3: Full LLM Processing 🤖 (10-20% of queries)
**Triggered when:**
- Query requires complex reasoning, comparison, or synthesis
- User explicitly asks for expansion, deep dive, or detailed explanation
- Special topics not in structured KB (technical analysis, market insights, etc.)

**Response Characteristics:**
- **Source:** Full Gemini API with system + user prompts
- **Length:** 
  - Simple expansion: 400 words
  - Complex queries: 800-1000 words
- **Speed:** ~2-3 seconds
- **Cost:** Full LLM token cost (but rare)
- **Temperature:** 0.7 (balanced creativity & precision)
- **Max tokens:** 400-1000 depending on expansion request

**Example Queries:**
- "Explain why CrypGPT is better than alternatives"
- "Tell me more about how blockchain security works"
- "Compare CrypGPT's approach to other AI tokens"
- "Give me a deep dive on the technical architecture"
- "Provide detailed pros and cons of tokenomics"

**Example Response:**
```
# Deep Dive: CrypGPT Tokenomics Strategy

[Full comprehensive response with multiple sections, detailed analysis, 
comparisons, technical details, market positioning...]
```

---

## Expansion Keywords (Trigger Tier 2 → Tier 3 upgrade)

When users ask for more detail, the system automatically expands response:

```javascript
const expansionKeywords = [
  'explain', 'why', 'how does', 'how can', 'elaborate', 'expand',
  'deep dive', 'tell me more', 'more details', 'understand',
  'benefits', 'advantages', 'impact', 'compared', 'vs',
  'comparison', 'difference', 'pros and cons', 'pros cons',
  'technical', 'mechanism', 'works', 'process'
]
```

---

## Response Source Indicators

Each response shows where it came from:

| Source | Icon | Meaning | Cost |
|--------|------|---------|------|
| 📚 Knowledge Base | 📚 | Directly from JSON files | 0 tokens |
| 📄 KB + Whitepaper | 📄 | KB formatted + whitepaper context | 30-50 tokens |
| 🤖 AI Generated | 🤖 | Full Gemini LLM processing | 500+ tokens |
| 🛡️ Safety Filter | 🛡️ | Query blocked for safety | 0 tokens |

---

## API Token Usage Comparison

### Before Optimization
```
Every query → Full Gemini LLM → ~600-1000 tokens per response
100 queries = 60,000-100,000 tokens
```

### After Optimization with 3-Tier System
```
- 50 queries (KB): 0 tokens × 50 = 0 tokens
- 25 queries (KB+WP): 40 tokens × 25 = 1,000 tokens
- 25 queries (LLM): 600 tokens × 25 = 15,000 tokens
────────────────────────────────────────────────
Total: 16,000 tokens for 100 queries (84% reduction! ✅)
```

---

## Intent Classification System

The system detects query intent to route to appropriate tier:

```javascript
'market-data'    → Price, market cap, volume questions
'identity'       → "What is CrypGPT?" questions
'roadmap'        → Timeline and future plans
'tokenomics'     → Token distribution and supply
'fundraising'    → Funding rounds and investor info
'usecases'       → Applications and use cases
'general'        → Unclassified queries (needs LLM)
```

---

## Implementation Details

### Server Response Flow
```
POST /api/chat
  ↓
1. Financial advice check? → Block if yes
  ↓
2. Detect intent
  ↓
3. Needs LLM expansion? 
  ├─ NO + KB exists → TIER 1 (instant, 0 tokens)
  ├─ NO + Whitepaper + KB → TIER 2 (fast, ~40 tokens)
  └─ YES → TIER 3 (full LLM, ~600 tokens)
  ↓
Return response with source indicator
```

### Frontend Display
- Messages show `📚 Knowledge Base`, `📄 KB + Whitepaper`, or `🤖 AI Generated` tag
- Intent type shown (market-data, roadmap, etc.)
- Real-time token data displayed when available
- Response length automatically adjusted based on tier

---

## Configuration

### Response Length Defaults
- **Tier 1:** ~100-150 words (crisp)
- **Tier 2:** ~200-300 words (moderate)
- **Tier 3:** 400 words (default) or 800-1000 words (if expansion requested)

### Temperature Settings
- **Tier 1:** N/A (no LLM)
- **Tier 2:** 0.3 (deterministic, factual)
- **Tier 3:** 0.7 (balanced)

### Max Token Limits
- **Tier 1:** 0 (direct formatting)
- **Tier 2:** 300 tokens
- **Tier 3:** 400 tokens (default) or 1000 tokens (expansion)

---

## Best Practices

✅ **DO:**
- Ask specific "what is", "tell me about" questions for Tier 1 responses
- Follow up with "explain more" or "elaborate" for detailed analysis
- Quick queries benefit from crisp Tier 1 responses
- For complex analysis, explicitly ask to "explain" or "deep dive"

❌ **DON'T:**
- Expect detailed explanations for basic factual questions (use KB directly)
- Ask for financial advice (automatic block)
- Overuse expansion keywords if crisp answer sufficient
- Ask to compare with competitors (safety boundary)

---

## Monitoring & Statistics

**Recommended Metrics to Track:**
```
- Tier 1 response rate (target: 40-50%)
- Tier 2 response rate (target: 20-30%)
- Tier 3 response rate (target: 10-20%)
- Average tokens per query (target: < 200)
- Response time by tier
- User satisfaction by response source
```

---

## Future Optimizations

1. **Tier 0: Quick Answers** - Single sentences for common queries
2. **Caching:** Cache Tier 2/3 responses for identical queries
3. **Hybrid Context:** Combine KB facts with minimum LLM reasoning
4. **User Preferences:** Allow users to set default response length
5. **Context Memory:** Remember user's preference for detail level

---

## Questions?

For issues or questions about API optimization:
1. Check response source tag (📚/📄/🤖)
2. Review this guide for your query type
3. Adjust query keywords to get desired response tier
4. Look for "expansion keywords" if you want more detail
