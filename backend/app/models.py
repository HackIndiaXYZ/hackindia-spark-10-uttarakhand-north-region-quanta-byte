import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, Date, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    mobile = Column(String, unique=True, index=True, nullable=True)
    village = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    language = Column(String, default="hi")
    land_acres = Column(Float, nullable=True)
    irrigation = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    own_tractor = Column(Boolean, default=False)
    crops = Column(JSON, default=list) # List of crop names the user grows
    avatar_url = Column(String, nullable=True)
    
    diseases = relationship("DiseaseRecord", back_populates="user", cascade="all, delete-orphan")
    soil_records = relationship("SoilRecord", back_populates="user", cascade="all, delete-orphan")
    yields = relationship("YieldRecord", back_populates="user", cascade="all, delete-orphan")

class DiseaseRecord(Base):
    __tablename__ = "diseases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop = Column(String, nullable=False)
    symptoms = Column(String, nullable=True)
    disease_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False) # High, Medium, Low
    cause = Column(String, nullable=False)
    treatment = Column(JSON, nullable=False) # List of strings
    prevention = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="diseases")

class SoilRecord(Base):
    __tablename__ = "soil_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location = Column(String, nullable=False)
    soil_type = Column(String, nullable=False)
    ph = Column(Float, nullable=False)
    moisture = Column(String, nullable=False)
    fertility = Column(String, nullable=False)
    recommended_crops = Column(JSON, nullable=False) # List of strings
    fertilizer_advice = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="soil_records")

class Machinery(Base):
    __tablename__ = "machinery"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # tractor, harvester, rotavator, etc.
    location = Column(String, nullable=False)
    rating = Column(Float, default=4.5)
    price_per_day = Column(Float, nullable=False)
    owner_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    available = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_name = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
    market = Column(String, nullable=False)
    state = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    msp = Column(Float, nullable=True)
    change_percent = Column(Float, default=0.0)
    is_best = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Scheme(Base):
    __tablename__ = "schemes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, nullable=False) # financial, insurance, organic, technology
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    benefit = Column(String, nullable=False)
    apply_url = Column(String, nullable=False)

class YieldRecord(Base):
    __tablename__ = "yields"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String, nullable=False)
    amount_quintal = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    expenses = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    
    user = relationship("User", back_populates="yields")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False) # danger, warning, info
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    time_label = Column(String, nullable=False) # e.g. "2 घंटे पहले"
    area = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Optional for guest chat
    session_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False) # user or bot
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
