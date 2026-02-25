# Quick Start: API Token Optimization

## What Changed?

Your CrypGPT bot now uses a **smart 3-tier response system** that minimizes Gemini API token usage by answering from the knowledge base first.

## Response Tiers

### 📚 Tier 1: Knowledge Base (0 tokens)
**Instant answers** from your JSON files (identity.json, roadmap.json, etc.)

**Example queries:**
```
"What is CrypGPT?"
"Tell me about the roadmap"
"What's the token distribution?"
```

**Expected response:** 100-150 words, crisp and summarized

---

### 📄 Tier 2: KB + Whitepaper (~40 tokens)
**Slightly expanded answers** using knowledge base + whitepaper context

**Example queries:**
```
"Explain the tokenomics"
"Can you elaborate on the roadmap?"
"How does the voting mechanism work?"
```

**Expected response:** 200-300 words, moderate detail

---

### 🤖 Tier 3: Full AI (500+ tokens)
**Complex reasoning** using Gemini LLM (used sparingly)

**Example queries:**
```
"Why is CrypGPT better than alternatives?"
"Explain the technical architecture"
"Compare CrypGPT's approach"
```

**Expected response:** 400-1000 words depending on request

---

## How to Trigger Each Tier

| Tier | Trigger | Keywords | Cost |
|------|---------|----------|------|
| 📚 Tier 1 | Simple factual question | "what", "tell me" | 0 |
| 📄 Tier 2 | KB + expansion request | "explain", "elaborate", "why" | ~40 |
| 🤖 Tier 3 | Complex topic | "deep dive", "compare", "technical" | 500+ |

---

## What You'll See

Each response now shows its source:

```
📚 Knowledge Base      → Instant answer, free tier
📄 KB + Whitepaper    → Context-aware answer, cheap tier
🤖 AI Generated       → Full reasoning, costs tokens
🛡️ Safety Filter      → Blocked for safety (financial advice)
```

---

## Cost Comparison

**Before:** Every query uses full Gemini LLM (~600-1000 tokens per query)
- 100 queries = **60,000-100,000 tokens** 💸

**After:** 3-tier smart routing
- 50 KB queries (0 tokens each) = 0 tokens
- 25 KB+WP queries (40 tokens each) = 1,000 tokens  
- 25 LLM queries (600 tokens each) = 15,000 tokens
- **Total: 16,000 tokens (84% savings!)** ✅

---

## Quick Tips for Users

✅ **Ask factual questions normally** - Will auto-route to Tier 1 (free)
- "What is CrypGPT?"
- "Tell me about the roadmap"
- "What's the current price?"

✅ **Ask for explanations to get Tier 2/3** - Only when needed
- "Can you explain why..." → Tier 2
- "Tell me more about..." → Tier 2
- "Compare ... vs ..." → Tier 3

❌ **Avoid financial advice requests** - Auto-blocked for safety
- "Should I buy CGPT?"
- "What's your price prediction?"

---

## Response Format Improvements

### Tier 1 Format (Crisp)
```
**CrypGPT** (CGPT) is an AI + Blockchain ecosystem token. 
It addresses complexity and misinformation in crypto by combining 
AI with blockchain technology.

Current Market Data:
- Price: $0.15
- Market Cap: $25M
- 24h Volume: $2.5M
```

### Tier 2/3 Format (Detailed)
```
# Main Topic Here

## Sub-section 1
- Bullet point 1
- Bullet point 2

## Sub-section 2
Details and explanations...

**Key takeaway:** Summary of main point
```

---

## Files Modified

### Backend
- **server.js** - 3-tier routing logic, reduced API calls
- **services/promptBuilder.js** - Added `needsLlmExpansion()` and `formatKnowledgeBaseFact()`

### Frontend
- **src/hooks/useChat.js** - Captures `responseSource` field
- **src/components/MessageBubble.jsx** - Displays source indicator (📚/📄/🤖)

---

## Configuration

All settings in `promptBuilder.js`:

```javascript
// Expansion keywords that trigger Tier 2/3
const expansionKeywords = [
  'explain', 'why', 'elaborate', 'deep dive', 
  'compare', 'technical', 'mechanism', ...
]

// Simple topics stick with Tier 1
const simpleTopics = ['identity', 'market-data', 'tokenomics']
```

---

## Monitoring

Track these metrics:

```
Tier 1 hit rate: Target 40-50%
Tier 2 hit rate: Target 20-30%
Tier 3 hit rate: Target 10-20%
Avg tokens/query: Target <200 (vs. 600+ before)
Response time: Should be faster for Tier 1/2
```

---

## Next Steps

1. **Test the system** - Ask factual then complex questions
2. **Monitor token usage** - Check Gemini API console
3. **Adjust keywords** - Fine-tune expansion triggers if needed
4. **Gather feedback** - See if response quality meets expectations

---

## Questions?

See the detailed guide in `API_OPTIMIZATION.md` for comprehensive documentation.
