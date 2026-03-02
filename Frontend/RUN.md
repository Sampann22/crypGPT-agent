# CrypGPT – How to run (Backend + Frontend)

## 1. Backend (Node)

```bash
cd backend
cp .env.example .env
# Edit .env: set OPENR_API_KEY and OPENR_MODEL (e.g. a free model from openrouter.ai)
npm install
npm run dev
```

- Backend will run at **http://localhost:3001**
- Health: **http://localhost:3001/health**
- Chat API: **POST http://localhost:3001/api/chat** with body `{ "query": "your message" }`

## 2. Frontend (Vite + React)

```bash
# From project root (Frontend folder)
npm install
npm run dev
```

- Frontend will run at **http://localhost:5173**
- Vite proxies `/api` to `http://localhost:3001`, so chat requests go to the backend automatically.

## 3. One-time: run both

**Terminal 1 – Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 – Frontend**
```bash
cd Frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in the browser.

## 4. Env summary

| Where    | Variable          | Purpose                    |
|----------|-------------------|----------------------------|
| Backend  | `OPENR_API_KEY`   | OpenRouter API key (required) |
| Backend  | `OPENR_MODEL`     | Model id, e.g. `google/gemma-2-9b-it:free` |
| Backend  | `OPENR_URL`       | Optional; default OpenRouter URL |
| Frontend | `VITE_API_BASE`   | Optional; default `/api` (uses Vite proxy) |
| Frontend | `VITE_CHAT_TIMEOUT` | Optional; ms, default 90000 |

## 5. Production / no proxy

If the frontend is not behind the same host as the backend, set:

```env
VITE_API_BASE=http://your-backend-host:3001
```

(or your deployed backend URL). Then frontend will call that URL for `/chat` instead of the proxy.
