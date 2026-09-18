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

@router.get("", response_model=List[schemas.MarketPriceOut])
async def get_market_prices(
    crop: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await seed_market_prices(db)
    prices = await crud.get_market_prices(db, crop, state)
    return prices

@router.get("/live")
async def get_live_market_prices(
    district: str = Query(..., description="District name e.g. Sonbhadra"),
    commodity: str = Query(..., description="Commodity/crop name e.g. Wheat"),
):
    """Fetch live mandi prices from data.gov.in API"""
    import httpx
    from ..config import settings
    
    api_key = settings.DATA_GOV_API_KEY
    if not api_key:
        # Return empty with message if no API key configured
        return {
            "records": [],
            "message": "DATA_GOV_API_KEY environment variable is not set. Please register at data.gov.in and set your API key.",
            "source": "data.gov.in"
        }
    
    resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
    url = f"https://api.data.gov.in/resource/{resource_id}"
    
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 20,
        "filters[district]": district.strip(),
        "filters[commodity]": commodity.strip(),
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        
        records = data.get("records", [])
        
        # Format the records for frontend
        formatted = []
        for rec in records:
            formatted.append({
                "crop_name": rec.get("commodity", commodity),
                "district": rec.get("district", district),
                "market": rec.get("market", "N/A"),
                "state": rec.get("state", ""),
                "min_price": float(rec.get("min_price", 0)),
                "max_price": float(rec.get("max_price", 0)),
                "modal_price": float(rec.get("modal_price", 0)),
                "arrival_date": rec.get("arrival_date", ""),
                "variety": rec.get("variety", ""),
                "unit": "₹/Quintal",
            })
        
        return {
            "records": formatted,
            "total": data.get("total", len(formatted)),
            "message": "" if formatted else "इस जिले और फसल के लिए अभी लाइव मंडी डेटा उपलब्ध नहीं है।",
            "source": "data.gov.in (Agmarknet)"
        }
    except httpx.HTTPStatusError as e:
        return {
            "records": [],
            "message": f"API error: {e.response.status_code}",
            "source": "data.gov.in"
        }
    except Exception as e:
        return {
            "records": [],
            "message": f"कनेक्शन त्रुटि: {str(e)}",
            "source": "data.gov.in"
        }

