from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas, models

router = APIRouter()

SEED_MACHINERY = [
    {
        "name": "महिंद्रा 575 DI ट्रैक्टर (Mahindra Tractor)",
        "type": "ट्रैक्टर",
        "location": "रामपुर, वाराणसी",
        "rating": 4.8,
        "price_per_day": 1500.0,
        "owner_name": "राजेश कुमार",
        "mobile": "9876543201",
        "available": True,
        "image_url": None
    },
    {
        "name": "जॉन डीयर कंबाइन हार्वेस्टर (John Deere Harvester)",
        "type": "हार्वेस्टर",
        "location": "ज्ञानपुर, भदोही",
        "rating": 4.9,
        "price_per_day": 5000.0,
        "owner_name": "बलबीर सिंह",
        "mobile": "9876543202",
        "available": True,
        "image_url": None
    },
    {
        "name": "सोनालिका रोटावेटर 6 फीट (Sonalika Rotavator)",
        "type": "रोटावेटर",
        "location": "कपसेठी, वाराणसी",
        "rating": 4.6,
        "price_per_day": 800.0,
        "owner_name": "महेंद्र यादव",
        "mobile": "9876543203",
        "available": True,
        "image_url": None
    },
    {
        "name": "पावर स्प्रेयर 50 लीटर (Power Sprayer)",
        "type": "स्प्रेयर",
        "location": "मिर्जामुराद, वाराणसी",
        "rating": 4.5,
        "price_per_day": 300.0,
        "owner_name": "रमेश पटेल",
        "mobile": "9876543204",
        "available": False,
        "image_url": None
    }
]

async def seed_machinery(db: AsyncSession):
    result = await db.execute(select(func.count(models.Machinery.id)))
    count = result.scalar()
    if count == 0:
        for m in SEED_MACHINERY:
            await crud.create_machinery(db, schemas.MachineryCreate(**m))

@router.get("/", response_model=List[schemas.MachineryOut])
async def get_machinery(
    q: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await seed_machinery(db)
    machinery_list = await crud.get_machinery_list(db, q, type)
    return machinery_list

@router.post("/", response_model=schemas.MachineryOut)
async def add_machinery(
    machinery: schemas.MachineryCreate,
    db: AsyncSession = Depends(get_db)
):
    new_mac = await crud.create_machinery(db, machinery)
    return new_mac

@router.post("/rent/{id}", response_model=schemas.MachineryOut)
async def rent_machinery(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    import uuid
    try:
        mac_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid machinery ID")
        
    machinery = await crud.get_machinery_by_id(db, mac_id)
    if not machinery:
        raise HTTPException(status_code=404, detail="Machinery not found")
        
    if not machinery.available:
        raise HTTPException(status_code=400, detail="Machinery is already rented")
        
    updated = await crud.update_machinery_availability(db, mac_id, False)
    return updated
