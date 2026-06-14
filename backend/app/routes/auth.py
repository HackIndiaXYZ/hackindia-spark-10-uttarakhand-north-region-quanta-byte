from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

class LoginRequest(BaseModel):
    id_token: str
    name: Optional[str] = "कृषक"  # default farmer name in Hindi
    mobile: Optional[str] = None

# Fallback/mock verification for offline testing
async def verify_firebase_token(id_token: str, name: str, mobile: str) -> dict:
    if id_token.startswith("mock_"):
        # Local development bypass
        uid = id_token.replace("mock_", "")
        return {
            "uid": uid,
            "name": name or "किसान जी",
            "phone_number": mobile or "9999999999"
        }
    
    # Real firebase token verification could go here if firebase-admin is initialized.
    # For now, we allow the mock fallback or basic parsing.
    # In a full production env, we do:
    # decoded_token = auth.verify_id_token(id_token)
    # return decoded_token
    
    # Let's support parsing the token dynamically.
    # If not configured, raise exception or fallback to mock
    try:
        # Mocking firebase check for now to allow seamless runs
        return {
            "uid": f"fb_{mobile or 'default'}",
            "name": name,
            "phone_number": mobile
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

from typing import Optional

@router.post("/login", response_model=schemas.UserOut)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Verify token
    user_info = await verify_firebase_token(req.id_token, req.name, req.mobile)
    uid = user_info["uid"]
    
    # Check if user exists
    db_user = await crud.get_user_by_firebase_uid(db, uid)
    if not db_user:
        # Create user
        user_create = schemas.UserCreate(
            firebase_uid=uid,
            name=user_info.get("name") or req.name or "किसान जी",
            mobile=user_info.get("phone_number") or req.mobile,
            village="",
            district="",
            state="Uttar Pradesh",
            language="hi",
            crops=[]
        )
        db_user = await crud.create_user(db, user_create)
        
    return db_user
