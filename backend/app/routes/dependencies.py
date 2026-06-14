from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import User
from uuid import UUID

async def get_current_user(
    authorization: str = Header(None), 
    db: AsyncSession = Depends(get_db)
) -> User:
    # If no authorization header, look for a default or create a testing user
    # This ensures the API runs and works in mock mode immediately.
    if not authorization:
        # Check if test user exists
        result = await db.execute(select(User).where(User.firebase_uid == "test_user_uid"))
        user = result.scalars().first()
        if not user:
            user = User(
                firebase_uid="test_user_uid",
                name="किसान जी",
                mobile="9876543210",
                village="रामपुर",
                district="वाराणसी",
                state="Uttar Pradesh",
                language="hi",
                land_acres=5.5,
                irrigation="बोरवेल (Borewell)",
                soil_type="दोमट मिट्टी",
                own_tractor=True,
                crops=["गेहूं", "धान", "सरसों"],
                avatar_url=None
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user
        
    # Extract token
    token = authorization.replace("Bearer ", "").strip()
    
    # Try finding by firebase_uid
    result = await db.execute(select(User).where(User.firebase_uid == token))
    user = result.scalars().first()
    if user:
        return user
        
    # Try finding by database UUID
    try:
        user_uuid = UUID(token)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalars().first()
        if user:
            return user
    except ValueError:
        pass
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authorization token or user does not exist"
    )
