# 🌾 Krishi AI (किसान का डिजिटल साथी)
### HackIndia Spark 10 — Uttarakhand North Region
**Team: Quanta Byte** | *Team ID: `hackindia-spark-10-uttarakhand-north-region:quanta-byte`*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

**Krishi AI** is an intelligent, full-stack AgriTech ecosystem engineered specifically for Indian farmers. It combines advanced computer vision, generative AI, government open datasets, and hyper-local meteorology into an intuitive, bilingual (Hindi & English) mobile-responsive portal. 

From diagnosing crop leaf pathologies and predicting pest outbreaks to finding real-time mandi prices and renting farm machinery, **Krishi AI** acts as a 24/7 digital agricultural extension officer in every farmer's pocket.

---

## ✨ Core Features & Modules

| Module | Route | Key Capabilities |
| :--- | :--- | :--- |
| **🌿 Crop Disease Detection** | `/disease` | Upload leaf photos for instant pathology identification, severity rating, causal factors, and step-by-step chemical/organic treatments in Hindi. |
| **🐛 Pest Identification** | `/pest` | Vision-driven pest classification with immediate non-toxic mitigation and prevention steps. |
| **🧪 Soil Health Analysis** | `/soil` | Analyzes soil textures (Alluvial, Black, Loamy, Clay, etc.), evaluates pH, moisture, and outputs optimized crop rotation advice. |
| **🌦️ Hyper-Local Weather** | `/weather` | Real-time atmospheric conditions, humidity, wind velocity, and 5-day agricultural advisories powered by OpenWeatherMap. |
| **📈 Live Mandi Bhav (Market)** | `/market` | Real-time APMC Mandi commodity rates with minimum, maximum, and MSP benchmarking via Indian Government data portal (`data.gov.in`). |
| **🤖 AI Chatbot & Voice Officer** | `/chatbot`, `/voice` | Conversational bilingual AI assistant powered by Google Gemini 2.0 with voice-input support for hands-free queries in the field. |
| **🏛️ Government Scheme Hub** | `/schemes` | Curated directory of central and state farmer welfare initiatives (PM-KISAN, PMFBY, Soil Health Card, Subsidies) with eligibility and direct apply links. |
| **🚜 Machinery Rental Sharing** | `/machinery` | Peer-to-peer equipment sharing marketplace connecting farmers with local owners for tractors, rotavators, and harvesters. |
| **📊 Yield & Finance Dashboard** | `/dashboard`, `/yield` | Comprehensive farm analytics tracking seasonal expenditure, output volume (quintals), and net profit charts powered by Chart.js. |

---

## 🛠️ Architecture & Tech Stack

```
                                 ┌───────────────────────────────┐
                                 │      Krishi AI Web App        │
                                 │   Next.js 16 (React 19, TS)   │
                                 └───────────────┬───────────────┘
                                                 │ HTTP / REST
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │        FastAPI Backend        │
                                 │      (Python 3.13, Async)     │
                                 └──────┬───────┬───────┬────────┘
                                        │       │       │
                ┌───────────────────────┘       │       └────────────────────────┐
                ▼                               ▼                                ▼
     ┌─────────────────────┐        ┌───────────────────────┐        ┌───────────────────────┐
     │   Google Gemini     │        │  OpenWeatherMap &     │        │  Async SQLite /       │
     │   Generative AI     │        │  Data.gov.in APIs     │        │  PostgreSQL (AsyncPG) │
     └─────────────────────┘        └───────────────────────┘        └───────────────────────┘
```

### Frontend
- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Modular CSS system, FontAwesome 6
- **Typography**: Google Fonts (*Poppins* and *Baloo 2* for Hindi ligature support)
- **Data & State**: `@tanstack/react-query`, Framer Motion, Chart.js, `react-chartjs-2`

### Backend
- **Framework**: FastAPI (High-performance ASGI server)
- **ORM & Database**: Async SQLAlchemy 2.0 with `aiosqlite` (local zero-config SQLite) and PostgreSQL (`asyncpg`) support
- **AI & Integrations**: Google GenAI SDK (`google-genai`), OpenWeather REST API, Data.gov.in API
- **Validation**: Pydantic v2 & Pydantic Settings

---

## 📁 Repository Structure

```plaintext
hackindia-spark-10-uttarakhand-north-region-quanta-byte/
├── backend/                        # FastAPI Backend Application
│   ├── app/
│   │   ├── config.py               # Environment configuration (Pydantic Settings)
│   │   ├── database.py             # Async database engine & session provider
│   │   ├── models.py               # SQLAlchemy ORM database models
│   │   ├── schemas.py              # Pydantic validation schemas
│   │   ├── crud.py                 # Async database operations
│   │   ├── main.py                 # FastAPI application root & middleware
│   │   └── routes/                 # Modular API endpoints
│   │       ├── alerts.py           # Weather & crop alerts
│   │       ├── auth.py             # User authentication & profile
│   │       ├── chatbot.py          # Gemini AI agricultural chatbot
│   │       ├── disease.py          # Crop disease diagnosis
│   │       ├── machinery.py        # Farm equipment rentals
│   │       ├── market.py           # APMC Mandi price tracking
│   │       ├── schemes.py          # Government schemes directory
│   │       ├── soil.py             # Soil health analysis
│   │       ├── voice.py            # Voice advisory endpoint
│   │       ├── weather.py          # Real-time weather forecast
│   │       └── yields.py           # Farmer yield & expense records
│   ├── services/                   # ML inference pipelines
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Template for environment variables
│   └── Dockerfile                  # Container definition
│
├── frontend/                       # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── disease/            # Crop disease UI
│   │   │   ├── soil/               # Soil analysis UI
│   │   │   ├── weather/            # Weather forecast UI
│   │   │   ├── market/             # Live mandi prices UI
│   │   │   ├── chatbot/            # AI assistant chat interface
│   │   │   ├── voice/              # Voice advisory UI
│   │   │   ├── schemes/            # Government schemes UI
│   │   │   ├── machinery/          # Machinery rental portal
│   │   │   ├── dashboard/          # Analytics & financial charts
│   │   │   ├── LanguageContext.tsx # Hindi/English bilingual switcher
│   │   │   ├── layout.tsx          # Root layout & styling imports
│   │   │   └── page.tsx            # Main landing page
│   │   ├── components/             # Reusable UI components
│   │   ├── styles/                 # Theme tokens & component stylesheets
│   │   └── config.ts               # Frontend API target configuration
│   ├── package.json
│   └── tsconfig.json
│
├── models/                         # Trained ML model weights and notebooks
└── README.md                       # Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python**: 3.11 or higher (3.13 tested)
- **Node.js**: v18.0.0 or higher (v22 tested)
- **npm** or **yarn** / **pnpm**

---

### 1. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt aiosqlite
   ```

4. **Set up Environment Variables**:
   Copy the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys (optional — intelligent mock fallbacks are included by default):
   ```env
   DATABASE_URL=sqlite+aiosqlite:///./krishiai.db
   GEMINI_API_KEY=your_google_gemini_api_key
   OPENWEATHER_API_KEY=your_openweather_key
   DATA_GOV_API_KEY=your_datagov_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

5. **Start the backend server**:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   * The API server will start at: **`http://127.0.0.1:8000`**
   * Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   * Open your browser and visit: **`http://localhost:3000`**

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API server healthcheck |
| `POST` | `/api/weather/?location={city}` | Real-time weather and 5-day agro-forecast |
| `GET` | `/api/market` | Current mandi prices across states & crops |
| `GET` | `/api/market/live?district={d}&commodity={c}` | Live mandi rates via data.gov.in |
| `POST` | `/api/chatbot/query` | Conversational query with Gemini AI |
| `POST` | `/api/disease/predict` | Leaf image upload for disease diagnosis |
| `POST` | `/api/soil/analyze` | Soil image / characteristics analysis |
| `GET` | `/api/schemes` | List of government agriculture schemes |
| `GET` | `/api/machinery` | Available rental farm equipment |
| `GET` | `/api/yield/records` | Yield and revenue records for farmer |
| `GET` | `/api/alerts` | Urgent alerts & pest/weather warnings |

---

## 🔒 Security Best Practices
- Sensitive API keys, private tokens, and databases are strictly excluded via `.gitignore`.
- Production credentials should be injected using system environment variables or secure cloud vaults.

---

## 👥 Team: Quanta Byte
* **Event**: HackIndia Spark 10 Hackathon (Uttarakhand North Region)
* **Team**: Quanta Byte
* **Repository**: [HackIndiaXYZ/hackindia-spark-10-uttarakhand-north-region-quanta-byte](https://github.com/HackIndiaXYZ/hackindia-spark-10-uttarakhand-north-region-quanta-byte)

---
*Built with ❤️ for Indian Farmers.*
