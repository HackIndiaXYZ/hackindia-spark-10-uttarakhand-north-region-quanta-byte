from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from .. import crud, schemas, models
from .dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=schemas.UserOut)
async def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=schemas.UserOut)
async def update_profile(
    user_update: schemas.UserUpdate, 
    current_user: models.User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    updated_user = await crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user
