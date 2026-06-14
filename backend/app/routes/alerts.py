from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from ..database import get_db
from .. import crud, schemas, models

router = APIRouter()

SEED_ALERTS = [
    {
        "type": "danger",
        "title": "🐛 कीट अलर्ट — टिड्डी दल",
        "message": "पूर्वी उत्तर प्रदेश के वाराणसी और आसपास के जिलों में टिड्डी दल की भारी सक्रियता देखी गई है। शाम के समय खेतों में तेज़ आवाज़ करें या कीटनाशक का छिड़काव करें।",
        "time_label": "2 घंटे पहले",
        "area": "पूर्वी UP"
    },
    {
        "type": "warning",
        "title": "🌧️ भारी बारिश की चेतावनी",
        "message": "मौसम विभाग द्वारा अगले 48 घंटों में भारी गरज के साथ तेज बारिश की चेतावनी जारी की गई है। कृपया कटी हुई फसल को ऊंचे और सुरक्षित स्थान पर ले जाएं, सिंचाई और खाद छिड़काव तुरंत रोक दें।",
        "time_label": "5 घंटे पहले",
        "area": "UP, Bihar"
    },
    {
        "type": "info",
        "title": "💰 PM Kisan नई किस्त जारी",
        "message": "प्रधानमंत्री किसान सम्मान निधि (PM Kisan) की 16वीं किस्त सभी पंजीकृत बैंक खातों में ट्रांसफर कर दी गई है। कृपया अपना बैंक बैलेंस चेक करें या सीएससी केंद्र पर जाकर स्टेटस देखें।",
        "time_label": "1 दिन पहले",
        "area": "राष्ट्रीय"
    }
]

async def seed_alerts(db: AsyncSession):
    result = await db.execute(select(func.count(models.Alert.id)))
    count = result.scalar()
    if count == 0:
        for a in SEED_ALERTS:
            await crud.create_alert(db, a)

@router.get("/", response_model=List[schemas.AlertOut])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    await seed_alerts(db)
    alerts_list = await crud.get_active_alerts(db)
    return alerts_list
