# Hamnafas (ہم نفس) — Open-Access Mental Health AI Companion for Pakistan

Hamnafas is a bilingual (Roman Urdu / English) AI wellness companion with mood
check-ins, PHQ-9/GAD-7 screening, guided self-help exercises, and a tiered
crisis-safety layer that routes distress to verified Pakistani support
organizations (Umang Pakistan, Rozan, Taskeen, Alkhidmat Health Foundation)
instead of a generic emergency number.

## Architecture

This is **two servers, one app**:

| Server | What it does | Port |
|---|---|---|
| **Vite (frontend)** | Serves the React/TypeScript UI | `3000` |
| **Express (backend)** | AI chat (DashScope/Qwen), crisis detection, TTS (Azure), auth, SQLite | `3101` |

The frontend never talks to DashScope or Azure directly — every AI call goes
through the backend at `/api/*`, which Vite proxies to `http://localhost:3101`
(see `vite.config.ts`). **If the backend isn't running, `/api/*` calls fail,
and the app silently falls back to a canned, generic reply** — this was the
cause of the "same reply no matter what I type" / "kicked back to Home" bugs.
`npm run dev` now starts both servers together so this can't happen by accident.

## Run Locally

**Prerequisites:** Node.js 18+ (Node 20/22 recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
   > `better-sqlite3` compiles a native module on install. On Windows this
   > requires the **"Desktop development with C++"** workload from the Visual
   > Studio Build Tools. If `npm install` fails on `better-sqlite3`, install
   > that workload first, then re-run `npm install`.

2. Configure your `.env` (copy `.env.example` if you don't already have one).
   At minimum you need:
   ```
   DASHSCOPE_API_KEY=sk-...       # Alibaba Cloud ModelStudio key, INTERNATIONAL/Singapore region
   PORT=3101
   CORS_ORIGIN=http://localhost:3000
   JWT_SECRET=any-long-random-string
   AZURE_SPEECH_KEY=...           # optional — voice replies fall back to browser TTS without it
   AZURE_SPEECH_REGION=...        # optional
   ```
   ⚠️ The DashScope key **must** be created for the international endpoint
   (`dashscope-intl.aliyuncs.com`). A key created in the China region will be
   rejected by this backend and the chat will show a graceful
   "AI is having trouble" message instead of a real reply.

3. Run the app (starts **both** the frontend and the backend):
   ```bash
   npm run dev
   ```
   Then open **http://localhost:3000** (not 3101 — that's the API only).

   You should see two labelled log streams in your terminal, `frontend` and
   `backend`. If you only see `frontend`, the backend crashed on startup —
   scroll up for the actual error (usually a missing `.env` value or the
   `better-sqlite3` native build issue above).

4. Sanity check the backend directly at any time:
   ```bash
   curl http://localhost:3101/api/health
   # {"status":"ok","timestamp":"..."}
   ```
   If this fails, the frontend cannot possibly get real AI replies — fix this
   first before debugging anything in the UI.

### Running frontend/backend separately (optional)

If you specifically want them in separate terminals (e.g. to watch backend
logs on their own):

```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev:frontend
```

## Build for production

```bash
npm run build      # builds the frontend into dist/
npm run server      # the backend is run with tsx directly; no separate build step needed
```

Serve `dist/` behind the same origin as the backend (or update `CORS_ORIGIN`
and the Vite proxy / your reverse proxy accordingly).

## Project layout

```
server/            Express backend (chat, crisis detection, TTS, auth, SQLite)
  routes/          /api/chat, /api/guest, /api/auth, /api/screening, /api/tts, /api/support
  services/        dashscope.ts (Qwen chat), crisisDetector.ts, azureTts.ts, authService.ts
  db/              SQLite schema + migrations (server/data/hamnafas.db, gitignored)
src/                React frontend
  components/      ChatView, HomeView, ScreeningModal, CrisisModal, SelfHelpModal, ...
  services/        aiService.ts (talks to /api/chat; has an offline fallback ONLY for
                    when the network truly can't reach the backend)
```

## Troubleshooting

**Chat always gives the same generic reply, ignoring what I typed.**
The backend isn't reachable. Run `npm run dev` (not `vite` / `npm run
dev:frontend` alone) and confirm `curl http://localhost:3101/api/health`
returns `ok`. This is almost always the cause.

**App occasionally dumps me back to the Home screen mid-chat.**
Same root cause as above — when `/api/chat/conversations` can't be reached,
the frontend clears its local conversation list. Confirmed fixed by always
running both servers together. If it still happens with the backend
confirmed running, check the browser console for the actual failing request.

**Port already in use.**
Something else is on 3000 or 3101. Either stop it, or change `PORT` in `.env`
and update the `proxy` target in `vite.config.ts` to match.

**better-sqlite3 fails to build on Windows.**
Install the "Desktop development with C++" workload via the Visual Studio
Installer, then `npm install` again.
