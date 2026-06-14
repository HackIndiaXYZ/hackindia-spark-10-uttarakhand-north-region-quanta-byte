from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import date, timedelta
from ..database import get_db
from .. import crud, schemas, models
from .dependencies import get_current_user

router = APIRouter()

# Initial seed data for a user's yields
SEED_YIELDS = [
    {"crop_name": "गेहूं", "amount_quintal": 120.0, "revenue": 258000.0, "expenses": 95000.0, "date": date(2026, 4, 15)},
    {"crop_name": "धान", "amount_quintal": 90.0, "revenue": 184500.0, "expenses": 60000.0, "date": date(2025, 11, 10)},
    {"crop_name": "मक्का", "amount_quintal": 35.0, "revenue": 77500.0, "expenses": 25000.0, "date": date(2025, 8, 20)}
]

async def seed_user_yields(db: AsyncSession, user_id):
    result = await db.execute(select(models.YieldRecord).where(models.YieldRecord.user_id == user_id))
    yields = result.scalars().all()
    if not yields:
        for y in SEED_YIELDS:
            db_rec = models.YieldRecord(
                user_id=user_id,
                crop_name=y["crop_name"],
                amount_quintal=y["amount_quintal"],
                revenue=y["revenue"],
                expenses=y["expenses"],
                date=y["date"]
            )
            db.add(db_rec)
        await db.commit()

@router.get("/", response_model=Dict[str, Any])
async def get_yield_analysis(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await seed_user_yields(db, current_user.id)
    records = await crud.get_yields(db, current_user.id)
    
    # Calculate summary
    total_yield = 0.0
    total_revenue = 0.0
    total_expenses = 0.0
    
    for r in records:
        total_yield += r.amount_quintal
        total_revenue += r.revenue
        total_expenses += r.expenses
        
    total_profit = total_revenue - total_expenses
    
    # Format to match frontend summary representation e.g. "245 Q", "₹5.2L", etc.
    # We send both raw numbers and formatted strings
    def format_lakh(val):
        if val >= 100000:
            return f"₹{val/100000:.1f}L"
        return f"₹{val:,}"

    return {
        "summary": {
            "total_yield": f"{int(total_yield)} Q",
            "revenue": format_lakh(total_revenue),
            "expenses": format_lakh(total_expenses),
            "profit": format_lakh(total_profit),
            "raw_total_yield": total_yield,
            "raw_revenue": total_revenue,
            "raw_expenses": total_expenses,
            "raw_profit": total_profit,
        },
        "records": [schemas.YieldOut.model_validate(r) for r in records]
    }

@router.post("/", response_model=schemas.YieldOut)
async def add_yield_record(
    record: schemas.YieldCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_record = await crud.create_yield_record(db, current_user.id, record)
    return new_record
