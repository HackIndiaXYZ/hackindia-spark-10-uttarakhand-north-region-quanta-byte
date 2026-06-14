from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas, models

router = APIRouter()

# Initial seed data for market prices
SEED_MARKET_PRICES = [
    {"crop_name": "गेहूं", "emoji": "🌾", "market": "Lucknow", "state": "Uttar Pradesh", "price": 2150.0, "min_price": 2100.0, "max_price": 2200.0, "msp": 2275.0, "change_percent": 3.0, "is_best": False},
    {"crop_name": "धान", "emoji": "🌾", "market": "Patna", "state": "Bihar", "price": 2050.0, "min_price": 2000.0, "max_price": 2100.0, "msp": 2183.0, "change_percent": -1.0, "is_best": False},
    {"crop_name": "मक्का", "emoji": "🌽", "market": "Bhopal", "state": "Madhya Pradesh", "price": 1850.0, "min_price": 1800.0, "max_price": 1920.0, "msp": 1962.0, "change_percent": 5.0, "is_best": True},
    {"crop_name": "सरसों", "emoji": "🌻", "market": "Jaipur", "state": "Rajasthan", "price": 5200.0, "min_price": 5100.0, "max_price": 5400.0, "msp": 5650.0, "change_percent": 2.0, "is_best": False},
    {"crop_name": "चना", "emoji": "🟡", "market": "Indore", "state": "Madhya Pradesh", "price": 5100.0, "min_price": 5000.0, "max_price": 5250.0, "msp": 5440.0, "change_percent": -2.0, "is_best": False},
    {"crop_name": "प्याज", "emoji": "🧅", "market": "Nasik", "state": "Maharashtra", "price": 1200.0, "min_price": 1100.0, "max_price": 1350.0, "msp": 0.0, "change_percent": 8.0, "is_best": False}
]

async def seed_market_prices(db: AsyncSession):
    # Check if database has prices
    result = await db.execute(select(func.count(models.MarketPrice.id)))
    count = result.scalar()
    if count == 0:
        for p in SEED_MARKET_PRICES:
            await crud.create_market_price(db, p)

@router.get("/", response_model=List[schemas.MarketPriceOut])
async def get_market_prices(
    crop: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await seed_market_prices(db)
    prices = await crud.get_market_prices(db, crop, state)
    return prices
