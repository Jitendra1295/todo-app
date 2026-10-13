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
* **Flexible API Key Setup:** Configure your Gemini API key either via `.env` file or directly in the UI settings dialog.

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
                       │ (Proxy: /api -> :3001)
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
* **Node.js:** v18.0.0 or higher
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
```
> **Note:** If `GEMINI_API_KEY` is not provided, the application automatically uses the built-in heuristic parser, allowing full local usage with zero configuration!

### 4. Running Locally
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
  "apiKey": "optional_override_key",
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
| `npm test` | Runs the test suite via Vitest (5/5 tests passing) |
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
