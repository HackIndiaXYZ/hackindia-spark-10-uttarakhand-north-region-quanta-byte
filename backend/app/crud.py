from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, or_, and_
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from . import models, schemas

# ==============================
# USER CRUD
# ==============================
async def get_user_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.firebase_uid == firebase_uid))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        firebase_uid=user.firebase_uid,
        name=user.name,
        mobile=user.mobile,
        village=user.village,
        district=user.district,
        state=user.state,
        language=user.language,
        land_acres=user.land_acres,
        irrigation=user.irrigation,
        soil_type=user.soil_type,
        own_tractor=user.own_tractor,
        crops=user.crops,
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return await get_user_by_id(db, user_id)
        
    await db.execute(
        update(models.User)
        .where(models.User.id == user_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_user_by_id(db, user_id)


# ==============================
# DISEASE CRUD
# ==============================
async def get_recent_diseases(db: AsyncSession, user_id: UUID, limit: int = 5) -> List[models.DiseaseRecord]:
    result = await db.execute(
        select(models.DiseaseRecord)
        .where(models.DiseaseRecord.user_id == user_id)
        .order_by(models.DiseaseRecord.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())

async def create_disease_record(db: AsyncSession, user_id: UUID, disease: schemas.DiseaseCreate) -> models.DiseaseRecord:
    db_record = models.DiseaseRecord(
        user_id=user_id,
        crop=disease.crop,
        symptoms=disease.symptoms,
        disease_name=disease.disease_name,
        confidence=disease.confidence,
        severity=disease.severity,
        cause=disease.cause,
        treatment=disease.treatment,
        prevention=disease.prevention,
        image_url=disease.image_url
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record


# ==============================
# SOIL CRUD
# ==============================
async def get_recent_soils(db: AsyncSession, user_id: UUID, limit: int = 5) -> List[models.SoilRecord]:
    result = await db.execute(
        select(models.SoilRecord)
        .where(models.SoilRecord.user_id == user_id)
        .order_by(models.SoilRecord.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())

async def create_soil_record(db: AsyncSession, user_id: UUID, soil: schemas.SoilCreate) -> models.SoilRecord:
    db_record = models.SoilRecord(
        user_id=user_id,
        location=soil.location,
        soil_type=soil.soil_type,
        ph=soil.ph,
        moisture=soil.moisture,
        fertility=soil.fertility,
        recommended_crops=soil.recommended_crops,
        fertilizer_advice=soil.fertilizer_advice,
        image_url=soil.image_url
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record


# ==============================
# MACHINERY CRUD
# ==============================
async def get_machinery_list(db: AsyncSession, q: Optional[str] = None, type: Optional[str] = None) -> List[models.Machinery]:
    query = select(models.Machinery)
    filters = []
    if q:
        filters.append(or_(
            models.Machinery.name.ilike(f"%{q}%"),
            models.Machinery.location.ilike(f"%{q}%"),
            models.Machinery.owner_name.ilike(f"%{q}%")
        ))
    if type:
        filters.append(models.Machinery.type == type)
        
    if filters:
        query = query.where(and_(*filters))
        
    result = await db.execute(query.order_by(models.Machinery.available.desc(), models.Machinery.rating.desc()))
    return list(result.scalars().all())

async def create_machinery(db: AsyncSession, machinery: schemas.MachineryCreate) -> models.Machinery:
    db_mac = models.Machinery(**machinery.model_dump())
    db.add(db_mac)
    await db.commit()
    await db.refresh(db_mac)
    return db_mac

async def get_machinery_by_id(db: AsyncSession, id: UUID) -> Optional[models.Machinery]:
    result = await db.execute(select(models.Machinery).where(models.Machinery.id == id))
    return result.scalars().first()

async def update_machinery_availability(db: AsyncSession, id: UUID, available: bool) -> Optional[models.Machinery]:
    await db.execute(
        update(models.Machinery)
        .where(models.Machinery.id == id)
        .values(available=available)
    )
    await db.commit()
    return await get_machinery_by_id(db, id)


# ==============================
# MARKET PRICE CRUD
# ==============================
async def get_market_prices(db: AsyncSession, crop: Optional[str] = None, state: Optional[str] = None) -> List[models.MarketPrice]:
    query = select(models.MarketPrice)
    filters = []
    if crop:
        filters.append(models.MarketPrice.crop_name.ilike(f"%{crop}%"))
    if state:
        filters.append(models.MarketPrice.state == state)
        
    if filters:
        query = query.where(and_(*filters))
        
    result = await db.execute(query.order_by(models.MarketPrice.is_best.desc(), models.MarketPrice.crop_name.asc()))
    return list(result.scalars().all())

async def create_market_price(db: AsyncSession, price_data: dict) -> models.MarketPrice:
    db_price = models.MarketPrice(**price_data)
    db.add(db_price)
    await db.commit()
    await db.refresh(db_price)
    return db_price


# ==============================
# SCHEMES CRUD
# ==============================
async def get_schemes(db: AsyncSession, category: Optional[str] = None, query: Optional[str] = None) -> List[models.Scheme]:
    sql_query = select(models.Scheme)
    filters = []
    if category and category != "all":
        filters.append(models.Scheme.category == category)
    if query:
        filters.append(or_(
            models.Scheme.name.ilike(f"%{query}%"),
            models.Scheme.description.ilike(f"%{query}%")
        ))
        
    if filters:
        sql_query = sql_query.where(and_(*filters))
        
    result = await db.execute(sql_query)
    return list(result.scalars().all())

async def create_scheme(db: AsyncSession, scheme_data: dict) -> models.Scheme:
    db_scheme = models.Scheme(**scheme_data)
    db.add(db_scheme)
    await db.commit()
    await db.refresh(db_scheme)
    return db_scheme


# ==============================
# YIELD CRUD
# ==============================
async def get_yields(db: AsyncSession, user_id: UUID) -> List[models.YieldRecord]:
    result = await db.execute(
        select(models.YieldRecord)
        .where(models.YieldRecord.user_id == user_id)
        .order_by(models.YieldRecord.date.desc())
    )
    return list(result.scalars().all())

async def create_yield_record(db: AsyncSession, user_id: UUID, yield_rec: schemas.YieldCreate) -> models.YieldRecord:
    db_record = models.YieldRecord(
        user_id=user_id,
        crop_name=yield_rec.crop_name,
        amount_quintal=yield_rec.amount_quintal,
        revenue=yield_rec.revenue,
        expenses=yield_rec.expenses,
        date=yield_rec.date
    )
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record


# ==============================
# ALERTS CRUD
# ==============================
async def get_active_alerts(db: AsyncSession) -> List[models.Alert]:
    result = await db.execute(
        select(models.Alert)
        .where(models.Alert.active == True)
        .order_by(models.Alert.created_at.desc())
    )
    return list(result.scalars().all())

async def create_alert(db: AsyncSession, alert_data: dict) -> models.Alert:
    db_alert = models.Alert(**alert_data)
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return db_alert


# ==============================
# CHAT MESSAGES CRUD
# ==============================
async def get_chat_history(db: AsyncSession, session_id: str, limit: int = 20) -> List[models.ChatMessage]:
    result = await db.execute(
        select(models.ChatMessage)
        .where(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.created_at.asc())
        .limit(limit)
    )
    return list(result.scalars().all())

async def create_chat_message(db: AsyncSession, session_id: str, role: str, message: str, user_id: Optional[UUID] = None) -> models.ChatMessage:
    db_msg = models.ChatMessage(
        user_id=user_id,
        session_id=session_id,
        role=role,
        message=message
    )
    db.add(db_msg)
    await db.commit()
    await db.refresh(db_msg)
    return db_msg

async def clear_chat_history(db: AsyncSession, session_id: str):
    await db.execute(
        delete(models.ChatMessage)
        .where(models.ChatMessage.session_id == session_id)
    )
    await db.commit()
