from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from . import database
from .database import Base
from .config import settings
from .routes import auth, profile, disease, soil, weather, market, schemes, yields, machinery, alerts, chatbot

app = FastAPI(
    title="Krishi AI Backend",
    description="FastAPI Backend for Krishi AI V2.0",
    version="2.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    # Automatically create database tables if they do not exist
    try:
        async with database.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Connected to PostgreSQL database successfully.")
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}). Reconfiguring database to use SQLite fallback...", flush=True)
        database.use_sqlite_fallback()
        async with database.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("SQLite database setup completed successfully.")

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(disease.router, prefix="/api/disease", tags=["Disease Identification"])
app.include_router(soil.router, prefix="/api/soil", tags=["Soil Analysis"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Info"])
app.include_router(market.router, prefix="/api/market", tags=["Market Prices"])
app.include_router(schemes.router, prefix="/api/schemes", tags=["Government Schemes"])
app.include_router(yields.router, prefix="/api/yield", tags=["Yield Analysis"])
app.include_router(machinery.router, prefix="/api/machinery", tags=["Machinery Rental"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts & Notifications"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["AI Chatbot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Krishi AI V2.0 API Server"}
