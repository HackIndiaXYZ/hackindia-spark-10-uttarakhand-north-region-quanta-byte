from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional
from uuid import UUID

# User Schemas
class UserBase(BaseModel):
    name: str
    mobile: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    language: str = "hi"
    land_acres: Optional[float] = None
    irrigation: Optional[str] = None
    soil_type: Optional[str] = None
    own_tractor: bool = False
    crops: List[str] = []
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    firebase_uid: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None
    land_acres: Optional[float] = None
    irrigation: Optional[str] = None
    soil_type: Optional[str] = None
    own_tractor: Optional[bool] = None
    crops: Optional[List[str]] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: UUID
    firebase_uid: str
    
    model_config = ConfigDict(from_attributes=True)

# Disease Schemas
class DiseaseCreate(BaseModel):
    crop: str
    symptoms: Optional[str] = None
    disease_name: str
    confidence: float
    severity: str
    cause: str
    treatment: List[str]
    prevention: str
    image_url: str

class DiseaseOut(DiseaseCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Soil Schemas
class SoilCreate(BaseModel):
    location: str
    soil_type: str
    ph: float
    moisture: str
    fertility: str
    recommended_crops: List[str]
    fertilizer_advice: str
    image_url: str

class SoilOut(SoilCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Machinery Schemas
class MachineryBase(BaseModel):
    name: str
    type: str
    location: str
    rating: float = 4.5
    price_per_day: float
    owner_name: str
    mobile: str
    available: bool = True
    image_url: Optional[str] = None

class MachineryCreate(MachineryBase):
    pass

class MachineryOut(MachineryBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)

# MarketPrice Schemas
class MarketPriceOut(BaseModel):
    id: UUID
    crop_name: str
    emoji: str
    market: str
    state: str
    price: float
    min_price: float
    max_price: float
    msp: Optional[float] = None
    change_percent: float
    is_best: bool
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Scheme Schemas
class SchemeOut(BaseModel):
    id: UUID
    category: str
    name: str
    description: str
    benefit: str
    apply_url: str
    
    model_config = ConfigDict(from_attributes=True)

# Yield Schemas
class YieldCreate(BaseModel):
    crop_name: str
    amount_quintal: float
    revenue: float
    expenses: float
    date: date

class YieldOut(YieldCreate):
    id: UUID
    user_id: UUID
    
    model_config = ConfigDict(from_attributes=True)

# Alert Schemas
class AlertOut(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    time_label: str
    area: Optional[str] = None
    active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# ChatMessage Schemas
class ChatQuery(BaseModel):
    message: str
    session_id: str

class ChatMessageOut(BaseModel):
    id: UUID
    session_id: str
    role: str
    message: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
