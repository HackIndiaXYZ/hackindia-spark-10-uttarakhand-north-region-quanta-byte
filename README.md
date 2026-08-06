# 🌾 Krishi AI (कृषि AI) — Next-Gen Smart Farming & Agricultural Intelligence Platform

![Krishi AI Banner](https://img.shields.io/badge/Krishi_AI-v2.0.0-green.svg?style=for-the-badge&logo=leaflet)
![Node.js](https://img.shields.io/badge/Backend-Node.js_v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_v7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Docker](https://img.shields.io/badge/Deployment-Docker_&_Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📖 Overview

**Krishi AI** is a state-of-the-art, AI-powered agricultural intelligence platform designed to empower smallholder farmers, agronomists, and agricultural stakeholders. By combining **Google Gemini Multimodal AI**, real-time weather analytics, computer vision leaf diagnosis, soil nutrient profiling, and live mandi market data, Krishi AI provides actionable, hyper-localized insights to increase crop yield, reduce crop losses, and maximize farmer profitability.

---

## ✨ Key Features

### 🌿 1. AI Crop Disease Diagnosis (Vision AI)
- **Instant Photo Scanning**: Upload leaf photos to detect diseases, pests, and nutrient deficiencies.
- **Multimodal AI Analytics**: Powered by Google Gemini Vision AI to identify pathologies with precision.
- **Actionable Treatment Plans**: Detailed breakdown including diagnosis summary, severity rating, organic & chemical remedies, step-by-step prevention, and follow-up guidance.
- **Scan History**: Persistent database tracking past disease records for crop health monitoring.

### 🧪 2. Soil Health & Fertilizer Recommendations
- **Nutrient Profiling**: Input N-P-K (Nitrogen, Phosphorus, Potassium) levels, pH, moisture, and soil composition.
- **Crop Suitability Engine**: AI recommendations for optimal crop selection based on soil parameters.
- **Precision Fertilizer Dosage**: Exact quantity calculations for Urea, DAP, MOP, and organic compost additions.

### 🌦️ 3. Hyper-Local Weather & Risk Advisory
- **Live Weather Integration**: Real-time temperature, humidity, precipitation probability, and evapotranspiration (EVT).
- **Agricultural Alerts**: Predictive risk warnings for frost, heatwaves, heavy rainfall, and pest-favorable humidity levels.
- **Spraying & Irrigation Guidance**: Dynamic advice on optimal timing for watering and pesticide spraying.

### 📈 4. Mandi Market Prices & Price Analytics
- **Live Mandi Rates**: Real-time commodity market prices across major APMC mandis in India.
- **Interactive Price Trends**: Visualized price curves powered by Chart.js to help farmers decide the optimal selling time.
- **Price Forecasting Insights**: AI-assisted market trend predictions and profit margins.

### 🤖 5. Multilingual AI Assistant & Voice Bot
- **24/7 AI Agronomist Chatbot**: Powered by Google Gemini with specialized context on Indian agriculture.
- **Voice Interface (TTS & STT)**: Multilingual text-to-speech and speech-to-text functionality built for accessibility and low-literacy usability.
- **Regional Languages Support**: Multi-lingual interface options including English, Hindi, and regional languages.

### 🌾 6. Crop Yield Prediction Engine
- **Yield Forecasting**: ML and statistical yield estimates based on land acreage, seed variety, historical weather data, and soil quality.
- **Optimization Suggestions**: Actionable recommendations to boost metric tons per acre.

### 🚜 7. Machinery Rental & Equipment Sharing Hub
- **Peer-to-Peer Marketplace**: Connects tractor, harvester, seeder, and drone owners with farmers needing equipment.
- **Rental Requests & Rate Calculators**: Transparent hourly/daily rates to minimize farm mechanization costs.

### 🏛️ 8. Government Schemes & Subsidy Finder
- **Scheme Database**: Aggregates national and state welfare programs (PM-KISAN, PM Fasal Bima Yojana, Soil Health Card Scheme, etc.).
- **Eligibility Checker**: Filters schemes tailored to farmer location, land holding size, and category.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌────────────────────────────────────────┐
                     │          React 18 + TypeScript         │
                     │  (Vite, Framer Motion, Chart.js)       │
                     └───────────────────┬────────────────────┘
                                         │ REST APIs
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         Node.js / Express.js           │
                     │          Backend API Server            │
                     └───────┬───────────────┬────────────────┘
                             │               │
      ┌──────────────────────┴┐             ┌┴──────────────────────┐
      │   MongoDB Database    │             │   External AI / APIs  │
      │ (Users, Scans, Soil,  │             │ • Google Gemini AI    │
      │   Yields, Machinery)  │             │ • OpenWeather API     │
      └───────────────────────┘             └───────────────────────┘
```

| Layer | Technology Used |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, Framer Motion, Lucide React Icons, Chart.js, TanStack React Query |
| **Styling** | Custom Vanilla CSS (Design Tokens, Glassmorphism, Responsive Dark/Light themes) |
| **Backend API** | Node.js, Express.js, Mongoose ORM, Multer (file processing), Cors, Axios, Dotenv |
| **Database** | MongoDB v7.0 (Mongoose Schemas & Automated Seeding) |
| **AI Integration** | `@google/generative-ai` (Google Gemini Pro & Gemini Vision APIs) |
| **Third-Party APIs** | OpenWeatherMap API |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📁 Repository Structure

```
Krishi AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection (db.js)
│   │   ├── middleware/      # Auth JWT & Multer upload handling
│   │   ├── models/          # MongoDB Mongoose Schemas
│   │   ├── routes/          # Express API route modules (12 features)
│   │   │   ├── alerts.js    # Weather & agriscience alert routes
│   │   │   ├── auth.js      # User registration & login
│   │   │   ├── chatbot.js   # Gemini AI multi-turn chat handler
│   │   │   ├── disease.js   # Vision AI disease scanner & history
│   │   │   ├── machinery.js # Farm equipment listing & rental
│   │   │   ├── market.js    # Live Mandi price data
│   │   │   ├── profile.js   # User farm profiles
│   │   │   ├── schemes.js   # Government scheme finder
│   │   │   ├── soil.js      # Soil test recommendation engine
│   │   │   ├── voice.js     # Multilingual voice bot interface
│   │   │   ├── weather.js   # Weather forecasting synthesis
│   │   │   └── yields.js    # Crop yield predictor
│   │   ├── utils/           # Database seeder & helper utilities
│   │   └── server.js        # Main Express server entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Stat Cards, Modals
│   │   ├── context/         # Auth & Language Context Providers
│   │   ├── pages/           # 12 React page views (Dashboard, Disease, Soil, etc.)
│   │   ├── styles/          # CSS modules for typography & glassmorphism layout
│   │   ├── App.tsx          # App Router & Main Shell
│   │   ├── config.ts        # API Endpoint configurations
│   │   └── main.tsx         # React DOM Entry
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml       # Orchestrates MongoDB, Express Backend & React Frontend
└── README.md                # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local MongoDB instance or MongoDB Atlas cluster)
- **Google Gemini API Key** (Obtainable from [Google AI Studio](https://aistudio.google.com/))
- *(Optional)* **OpenWeatherMap API Key** (Obtainable from [OpenWeather](https://openweathermap.org/api))

---

### 🔧 1. Manual Local Setup (Without Docker)

#### **A. Clone the Repository**
```bash
git clone https://github.com/your-username/krishi-ai.git
cd krishi-ai
```

#### **B. Setup & Run Backend**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=8000
   MONGO_URI=mongodb://127.0.0.1:27017/krishiai
   GEMINI_API_KEY=your_google_gemini_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   JWT_SECRET=krishi_ai_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > Server will run at `http://localhost:8000`

#### **C. Setup & Run Frontend**
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder (optional, defaults to `http://localhost:8000/api`):
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the frontend Vite server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### 🐳 2. Running with Docker & Docker Compose

To launch the entire stack (**MongoDB database + Express backend + React frontend**) with a single command:

1. Ensure Docker Desktop is installed and running.
2. In the root directory of `Krishi AI`, set your API key environment variable (or put it in a root `.env`):
   ```bash
   export GEMINI_API_KEY="your_google_gemini_api_key"
   ```
3. Build and launch all containers:
   ```bash
   docker-compose up --build
   ```
4. Access services at:
   - **Frontend UI**: `http://localhost:3000`
   - **Backend REST API**: `http://localhost:8000/api`
   - **MongoDB Instance**: `localhost:27017`

---

## 📡 Key API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new farmer user profile |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & retrieve JWT token |
| **Disease AI** | `POST` | `/api/disease/analyze` | Upload leaf image & receive Gemini AI diagnosis |
| **Disease AI** | `GET` | `/api/disease/history` | Retrieve past scan history records |
| **Soil Advisor**| `POST` | `/api/soil/analyze` | Submit soil N-P-K/pH test for crop & fertilizer advice |
| **Weather** | `GET` | `/api/weather` | Fetch hyper-local weather & AI agricultural risks |
| **Market** | `GET` | `/api/market/prices` | Get real-time APMC Mandi price trends |
| **Chatbot** | `POST` | `/api/chatbot/query` | Send natural language agricultural query to Gemini AI |
| **Voice Bot** | `POST` | `/api/voice/process` | Process voice queries with audio/text transcription |
| **Yield ML** | `POST` | `/api/yield/predict` | Predict crop yield tonnage based on farm parameters |
| **Machinery** | `GET` | `/api/machinery` | List available machinery for rental |
| **Schemes** | `GET` | `/api/schemes` | Fetch government welfare schemes & filter eligibility |

---

## 🤝 Contributing

Contributions are always welcome! If you'd like to improve Krishi AI:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🚜 Vision & Impact

> *"Empowering every farmer with AI-driven intelligence — transforming sustainable agriculture from seed to harvest."* 🌾
