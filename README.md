# Hamnafas (ہم نفس) — Open-Access Mental Health AI Companion for Pakistan

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white)](#-live-demo--project-links)
[![Alibaba Cloud](https://img.shields.io/badge/Powered_By-Alibaba_Cloud_DashScope-ff6a00?style=for-the-badge&logo=alibabacloud&logoColor=white)](#-ai--cloud-architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-Fullstack-blue?style=for-the-badge&logo=typescript&logoColor=white)](#-project-layout)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

> **Hamnafas (ہم نفس)** is a culturally attuned, bilingual (Roman Urdu / English) mental health and emotional grounding companion. Engineered with real-time conversational empathy, clinical self-screening tools (PHQ-9 / GAD-7), and an intelligent tiered crisis-safety mechanism, Hamnafas connects distressed users directly to verified Pakistani support organizations (Umang, Rozan, Taskeen, Alkhidmat Health Foundation) rather than generic emergency dispatch lines.

---

## 🔗 Live Demo & Project Links

* **Live Web Application:** [https://your-live-deployment-link.onrender.com](https://your-live-deployment-link.onrender.com)
* **Demo Video Walkthrough (2-3 min):** [Watch on YouTube / Loom](https://your-video-link-here.com)
* **Slide Deck / Presentation:** [View Pitch Deck PDF](https://your-pitch-deck-link-here.com)

---

## 🌟 Key Features

* **Culturally Sensitive Bilingual Agent:** Native understanding of code-switched Roman Urdu, Urdu, and English, trained to respect local idioms, emotional nuances, and cultural stigmas.
* **Tiered Crisis Detection & Safety Routing:** Automated real-time safety scanner (`crisisDetector.ts`) that intercepts severe distress or self-harm ideation and surfaces immediate, localized emergency helplines.
* **Clinical Self-Screening (PHQ-9 & GAD-7):** Standardized, evidence-based self-assessments with private progress tracking and downloadable visual summaries.
* **Mindfulness & Grounding Tooling:** Integrated guided somatic breathing exercises (e.g., 4-7-8 method, Box Breathing) and daily emotional check-in streaks.
* **Privacy-First Hybrid Architecture:** Local-first SQLite database (`better-sqlite3`) offering frictionless guest-mode anonymity alongside optional authenticated session sync.

---

## 🧠 AI & Cloud Architecture

Hamnafas utilizes a decoupled **two servers, one app** architecture to enforce complete API key isolation and data security:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)                │
│             Port: 3000 | Host: 0.0.0.0                  │
└───────────────────────────┬────────────────────────────┘
                             │ /api/* Internal Proxy
                             ▼
┌────────────────────────────────────────────────────────┐
│            Backend Server (Node.js + Express)           │
│                       Port: 3101                        │
├───────────────────────────┬────────────────────────────┤
│  • Crisis Detection Engine │  • SQLite Storage Engine   │
│  • Guest Session Handler   │  • Clinical Screeners      │
└─────────────┬───────────────────────────────┬──────────┘
              │                               │
              ▼                               ▼
┌───────────────────────────┐   ┌──────────────────────────┐
│   Alibaba Cloud DashScope │   │     Azure Speech TTS     │
│   (Qwen LLM via Intl API) │   │ (Optional Voice Replies) │
└───────────────────────────┘   └──────────────────────────┘
```

| Server | What it does | Port |
|---|---|---|
| **Vite (frontend)** | Serves the React/TypeScript UI, routing, and client state | `3000` |
| **Express (backend)** | AI chat (DashScope/Qwen), crisis detection, TTS (Azure), auth, SQLite persistence | `3101` |

> **Security Note:** The frontend never communicates with DashScope or Azure directly. Every AI call is mediated by the backend at `/api/*`, which Vite proxies to `http://localhost:3101` (configured in `vite.config.ts`).
>
> **Important:** If the backend is not running, `/api/*` requests fail and the app silently falls back to a canned, generic response. `npm run dev` starts both processes concurrently to prevent this.

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+ (Node 20 or 22 recommended)

### 1. Install Dependencies

```bash
npm install
```

> **Windows Native Module Notice:**
> `better-sqlite3` compiles a native module on install. On Windows, this requires the **"Desktop development with C++"** workload from the Visual Studio Build Tools. If `npm install` fails on `better-sqlite3`, install that workload first and re-run the command.

### 2. Configure Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Set the required environment variables:

```env
# Alibaba Cloud ModelStudio key (International / Singapore region)
DASHSCOPE_API_KEY=sk-...

PORT=3101
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-long-random-production-string

# Optional: Voice replies fall back to browser TTS if omitted
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=eastus
```

> ⚠️ **Critical Region Requirement:**
> The `DASHSCOPE_API_KEY` **must** be provisioned under the international endpoint (`dashscope-intl.aliyuncs.com`). Keys generated strictly under mainland China endpoints will be rejected by the backend, triggering graceful fallback degradation.

### 3. Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser (Port `3101` is reserved strictly for API routing).

Your terminal will display two distinct labeled streams: `[frontend]` and `[backend]`. If you only see `[frontend]`, check terminal errors above for missing `.env` fields or build failures.

### 4. Direct API Health Check

Verify backend availability at any time:

```bash
curl http://localhost:3101/api/health
# Expected output: {"status":"ok","timestamp":"..."}
```

---

### Running Frontend and Backend Separately (Optional)

If you need independent log isolation across multiple terminal windows:

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev:frontend
```

---

## 📦 Production Build & Deployment

```bash
# 1. Build the production client bundle (compiled into dist/)
npm run build

# 2. Run backend production runtime
npm run server
```

For unified single-host cloud deployments (such as Render, Railway, or Alibaba Cloud ECS):

1. Compile the frontend using `npm run build`.
2. Configure the production web service with:
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run server`
3. Supply production variables (`DASHSCOPE_API_KEY`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=3101`) directly inside the host's cloud environment console.

---

## 📂 Project Layout

```
server/                 Express backend (chat, safety systems, TTS, SQLite)
  routes/               Endpoints: /api/chat, /api/guest, /api/auth, /api/screening, /api/tts, /api/support
  services/             dashscope.ts (Qwen integration), crisisDetector.ts, azureTts.ts, authService.ts
  db/                   SQLite schema & connection management (server/data/hamnafas.db)
src/                    React 19 Frontend application
  components/           ChatView, HomeView, ScreeningModal, CrisisModal, SelfHelpModal, ...
  services/              aiService.ts (API client with network-drop recovery), soundService.ts
  data/                  Support directories, screening batteries (PHQ-9/GAD-7), breathing sequences
```

---

## 🛠️ Troubleshooting

* **Chat always gives the same generic reply, ignoring what I typed:**
  The backend is unreachable or missing its API key. Run `npm run dev` (do not run `vite` alone) and verify that `curl http://localhost:3101/api/health` returns `ok`. Confirm your `DASHSCOPE_API_KEY` is active and created on the international endpoint.
* **App dumps back to the Home screen mid-conversation:**
  When `/api/chat/conversations` drops connection, client state clears session trees. Running both servers concurrently via `npm run dev` fixes this. If it persists, inspect your browser Network tab for failing requests.
* **Port already in use (`EADDRINUSE: 3000` or `3101`):**
  Another process is bound to those ports. Terminate the blocking process or adjust `PORT` in `.env`, matching the `proxy` entry in `vite.config.ts`.
* **`better-sqlite3` native compilation failure:**
  Ensure Microsoft Visual C++ Build Tools ("Desktop development with C++") are installed on Windows, then run `npm rebuild better-sqlite3`.

---

## 📄 License & Ethical Boundaries

Distributed under the MIT License.

*Disclaimer: Hamnafas provides supportive psychoeducation and emotional grounding. It is not a licensed medical provider and does not provide formal clinical diagnoses. Individuals undergoing immediate crisis are actively routed to licensed professional helplines.*
