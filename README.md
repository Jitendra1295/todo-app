# ✳️ Daymark — AI-Powered Todo & Task Workspace

A minimal, high-productivity task management application built with **React 19**, **Vite**, and **Node.js**, featuring an **AI Task Creator** that transforms natural language sentences into structured, prioritized tasks.

---

## ✨ Features

### 1. 🪄 AI Task Creator (Natural Language to Action)
Type tasks naturally in everyday language, and the AI automatically extracts all structured task attributes:
* **Example prompt:**  
  > *“Remind me to call Rahul tomorrow at 10 AM and finish it before Friday.”*
* **Extracted Attributes:**
  * **Title:** `Call Rahul`
  * **Description:** Extracted instructions and context
  * **Due Date:** Target deadline calculated relative to current date (e.g., `Friday` / `2026-10-16`)
  * **Reminder Time:** `10:00 AM`
  * **Priority:** `High` / `Medium` / `Low`
  * **Category:** `Work` / `Personal`

#### Key Capabilities:
* **LLM Integration:** Powered by **Google Gemini 2.5 Flash** via the official `@google/genai` SDK with strict JSON schema enforcement.
* **Dual-Engine Fallback:** Built-in semantic NLP heuristic engine that extracts tasks instantly even when offline or if no API key is provided.
* **Inspect Structured JSON:** Live preview modal to inspect the raw structured JSON payload returned by the LLM.
* **Secure API Key Setup:** Configure the Gemini API key as a backend environment variable; it is never stored in browser storage or sent by the frontend.

---

### 2. 📋 Core Workspace Features
* **My Tasks View (`/`):**
  * Live daily progress tracker and percentage bar.
  * Status filtering: *All*, *To do*, *Done*.
  * Motivational quotes and clean typography.
* **All Tasks View (`/list`):**
  * Real-time search by task title.
  * Category filter (*All categories*, *Work*, *Personal*).
  * Breakdown of completed vs. remaining tasks.
* **Manual Task Form (`/form`):**
  * Standard task creation with quick-switch banner to AI Creator.
* **Enhanced Task Rows:**
  * Color-coded priority badges (`HIGH`, `MEDIUM`, `LOW`).
  * Reminder pills (`⏰ 10:00 AM`).
  * Subtext previews for descriptions and context.
  * LocalStorage persistence (`daymark-tasks`).

---

## 🏗️ Architecture & Technology Stack

```
┌──────────────────────────────────────────────┐
│            React 19 Frontend                 │
│  - Vite 8 + React Router 7                   │
│  - AI Creator Page (/ai)                     │
│  - Responsive & Minimalist CSS Design System │
└──────────────────────┬───────────────────────┘
                       │ Local proxy or VITE_API_BASE_URL
                       ▼
┌──────────────────────────────────────────────┐
│           Node.js Express Server             │
│  - Port 3001 (server/server.js)              │
│  - POST /api/ai/parse-task                   │
│  - GET  /api/health                          │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Google Gemini API     │   │   Semantic NLP Fallback   │
│  - @google/genai          │   │  - Zero-config / Offline  │
│  - gemini-2.5-flash       │   │  - Heuristic parser       │
│  - responseSchema (JSON)  │   └───────────────────────────┘
└───────────────────────────┘
```

* **Frontend:** React 19, React Router 7, Vite 8, Custom CSS
* **Backend:** Node.js, Express, `@google/genai`, `cors`, `dotenv`, `concurrently`
* **Testing:** Vitest, `@testing-library/react`, `@testing-library/user-event`, jsdom
* **Linting:** ESLint 10

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js:** v20.19.0 or higher
* **npm:** v9.0.0 or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Jitendra1295/todo-app.git
cd todo-app
npm install
```

### 3. Environment Configuration (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```
Add your Google Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173,http://localhost:5174
VITE_API_BASE_URL=
```
`GEMINI_API_KEY` is read only by the Express server. Do not expose it through a `VITE_` variable. Leave `VITE_API_BASE_URL` blank for local development; Vite proxies `/api` to `localhost:3001`.

### 4. Deploy the backend to Render

This repository includes a [`render.yaml`](./render.yaml) Blueprint. In Render, create a new Blueprint and select this GitHub repository. Render will use the root `package.json`, run `npm ci`, start the API with `npm run server`, and check `/api/health`.

Set `GEMINI_API_KEY` in the Render service's Environment settings. `FRONTEND_URL` is configured in the Blueprint for the production Vercel origin; add any additional allowed origins as a comma-separated list.

After Render deploys, copy the service URL (for example, `https://todo-api-example.onrender.com`) and add this environment variable to the Vercel project:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Set it for the Production environment, then redeploy the Vercel frontend. Do not add a trailing slash to the URL. The backend allows the configured frontend origin and local Vite origins.

### 5. Running Locally
Run both the Express backend API and Vite frontend dev server concurrently:
```bash
npm run dev
```

* **Frontend URL:** [http://localhost:5173](http://localhost:5173) (or [http://localhost:5174](http://localhost:5174))
* **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 📡 API Reference

### `POST /api/ai/parse-task`
Parses a natural language task description into a structured JSON task object.

#### Request Body
```json
{
  "prompt": "Remind me to call Rahul tomorrow at 10 AM and finish it before Friday.",
  "referenceDate": "2026-10-13T12:00:00.000Z"
}
```

#### Response Body
```json
{
  "success": true,
  "data": {
    "title": "Call Rahul",
    "description": "Extracted from prompt: \"Remind me to call Rahul tomorrow at 10 AM and finish it before Friday.\". Reminder set for 10:00 AM. Target completion: Friday.",
    "dueDate": "2026-10-16",
    "due": "Friday",
    "reminderTime": "10:00 AM",
    "priority": "High",
    "category": "Work",
    "extractedBy": "gemini-2.5-flash"
  },
  "meta": {
    "model": "gemini-2.5-flash"
  }
}
```

---

## 📜 Available NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Runs both Node.js backend server and Vite frontend concurrently |
| `npm run server` | Runs only the Node.js Express server on port 3001 |
| `npm run dev:frontend` | Runs only the Vite frontend dev server |
| `npm test` | Runs the test suite via Vitest |
| `npm run build` | Builds production bundle with Vite |
| `npm run lint` | Runs ESLint validation across project files |
| `npm run preview` | Previews the production build locally |

---

## 🧪 Testing

Run all unit and integration tests:
```bash
npm test
```
Tests cover initial task rendering, task completion toggle, local storage synchronization, category filtering, and the end-to-end AI Task Creator workflow.
