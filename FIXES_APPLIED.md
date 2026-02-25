# CrypGPT Project - Issues Fixed

## Summary
This document outlines all the issues found and fixed in the CrypGPT AI Assistant project.

---

## Issues Fixed

### 1. ✅ Frontend API Base URL Mismatch
**Problem**: 
- Frontend was hardcoded to `http://localhost:3001` 
- This caused CORS issues and prevented requests from working in development
- The API_BASE included redundant `/api` prefix in fetch calls

**Solution**:
- Changed `API_BASE` from `http://localhost:3001` to `/api` (relative path)
- Updated all fetch calls to use relative paths: `/api/token-data` → `/token-data`, `/api/chat` → `/chat`
- Now the frontend will use the Vite proxy in development or serve properly in production

**Files Modified**:
- [Frontend/src/App.jsx](Frontend/src/App.jsx#L1-L5)

---

### 2. ✅ Missing Vite Proxy Configuration
**Problem**:
- Frontend was running on `localhost:5173` (Vite default)
- Backend was running on `localhost:3001`
- CORS requests from different ports/protocols could fail
- No development proxy to handle API routing

**Solution**:
- Added Vite proxy server configuration in `vite.config.js`
- Proxy configuration routes all `/api/*` requests to `http://localhost:3001`
- This provides seamless API communication during development

**Configuration**:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

**Files Modified**:
- [Frontend/vite.config.js](Frontend/vite.config.js)

---

### 3. ✅ Missing listModels.js Function Call
**Problem**:
- The `listModels.js` script defined the `listModels()` function but never called it
- Running the script would do nothing

**Solution**:
- Added function call: `listModels();` at the end of the file

**Files Modified**:
- [listModels.js](listModels.js#L32)

---

### 4. ✅ Missing Environment Documentation
**Problem**:
- No `.env.example` file to guide developers on required environment variables
- Unclear which API keys are needed and for which providers
- New developers couldn't easily set up the project

**Solution**:
- Created `.env.example` with all required environment variables documented
- Includes configuration for all three LLM providers (Gemini, OpenAI, Claude)
- Documents data source options (CoinGecko, CoinMarketCap)

**Files Created**:
- [.env.example](.env.example)

---

## How to Run the Project

### 1. Install Dependencies

**Backend**:
```bash
npm install
```

**Frontend**:
```bash
cd Frontend
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and add your actual API keys:
- `GEMINI_API_KEY` (or other LLM provider key)
- Optional: `COINMARKETCAP_API_KEY` (if using CoinMarketCap)

### 3. Start the Backend

```bash
npm run dev
# or for production
npm start
```

Backend will run on `http://localhost:3001`

### 4. Start the Frontend

```bash
cd Frontend
npm run dev
```

Frontend will run on `http://localhost:5173` with automatic proxy to the backend API.

---

## Project Architecture

### Backend (Node.js/Express)
- **Port**: 3001
- **Main Server**: [server.js](server.js)
- **Services**:
  - [aiService.js](services/aiService.js) - LLM integration (Gemini, OpenAI, Claude)
  - [promptBuilder.js](services/promptBuilder.js) - Intent detection & prompt engineering
  - [realTimeDataService.js](services/realTimeDataService.js) - Token data fetching
  - [embeddingStore.js](services/embeddingStore.js) - Whitepaper embeddings & search

### Frontend (React + Vite)
- **Port**: 5173 (development)
- **Main Component**: [Frontend/src/App.jsx](Frontend/src/App.jsx)
- **API Communication**: Proxied through Vite during development
- **Styling**: Tailwind CSS

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Main AI chat endpoint |
| GET | `/api/facts/:topic` | Retrieve structured facts |
| POST | `/api/detect-intent` | Intent detection (debug) |
| GET | `/api/token-data` | Real-time token metrics |

---

## Known Considerations

1. **CORS**: Already enabled on backend; Vite proxy handles development communication
2. **Real-time Data**: Falls back from CoinMarketCap to CoinGecko if primary source fails
3. **Whitepaper Embeddings**: Uses Gemini API for embeddings (requires valid API key)
4. **Financial Safety**: Blocks financial advice requests at both frontend and backend

---

## Testing the Fix

1. Start backend: `npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Open `http://localhost:5173` in browser
4. Try sending a message - it should now successfully communicate with the backend
5. Check that real-time token data loads in the sidebar

---

## Additional Notes

- All API calls now use relative paths for better portability
- Frontend properly detects and displays whether API is proxied or connected to external URL
- Environment variables control all configurable aspects (LLM provider, ports, API keys)
- Backend includes comprehensive error handling and logging
