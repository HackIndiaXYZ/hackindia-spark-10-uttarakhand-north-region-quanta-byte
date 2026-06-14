from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas, models

router = APIRouter()

SEED_SCHEMES = [
    {
        "category": "financial",
        "name": "PM Kisan Samman Nidhi",
        "description": "₹6,000 प्रति वर्ष, तीन किस्तों में सभी पात्र भूमिधारक किसान परिवारों को प्रत्यक्ष वित्तीय सहायता प्रदान करने के लिए केंद्र सरकार की योजना।",
        "benefit": "₹6,000/साल",
        "apply_url": "https://pmkisan.gov.in"
    },
    {
        "category": "insurance",
        "name": "PM Fasal Bima Yojana",
        "description": "प्राकृतिक आपदाओं, कीटों और रोगों के कारण फसलों के नुकसान पर वित्तीय सुरक्षा सुनिश्चित करने के लिए न्यूनतम प्रीमियम पर व्यापक फसल बीमा प्रदान करती है।",
        "benefit": "फसल सुरक्षा (बीमा)",
        "apply_url": "https://pmfby.gov.in"
    },
    {
        "category": "organic",
        "name": "Paramparagat Krishi Vikas Yojana",
        "description": "जैविक खेती को बढ़ावा देने के लिए प्रति हेक्टेयर ₹50,000 की वित्तीय सहायता दी जाती है, जिसमें से 60% जैविक इनपुट (बीज, खाद) के लिए सीधा लाभ है।",
        "benefit": "₹50,000/हेक्टेयर",
        "apply_url": "https://pgsindia-ncof.gov.in/pkvy"
    },
    {
        "category": "technology",
        "name": "कृषि यंत्रीकरण योजना (Sub-Mission on Agricultural Mechanization)",
        "description": "किसानों को ट्रैक्टर, रोटावेटर, कल्टीवेटर और अन्य आधुनिक कृषि यंत्र खरीदने पर 40% से 80% तक की भारी सब्सिडी प्रदान की जाती है।",
        "benefit": "50% तक सब्सिडी",
        "apply_url": "https://agrimachinery.nic.in"
    },
    {
        "category": "financial",
        "name": "Kisan Credit Card (KCC)",
        "description": "किसानों को अपनी खेती और घरेलू आवश्यकताओं को पूरा करने के लिए केवल 4% प्रभावी वार्षिक ब्याज दर पर ₹3 लाख तक का आसान ऋण प्रदान किया जाता है।",
        "benefit": "सिर्फ 4% ब्याज ऋण",
        "apply_url": "https://www.sbi.co.in/web/personal-banking/loans/agriculture-loans/kisan-credit-card"
    },
    {
        "category": "organic",
        "name": "National Horticulture Mission",
        "description": "फलों, सब्जियों, मसालों और फूलों की आधुनिक वैज्ञानिक बागवानी को अपनाने के लिए किसानों को गुणवत्तापूर्ण पौध और सब्सिडी दी जाती है।",
        "benefit": "बागवानी विशेष अनुदान",
        "apply_url": "https://midh.gov.in"
    }
]

async def seed_schemes(db: AsyncSession):
    result = await db.execute(select(func.count(models.Scheme.id)))
    count = result.scalar()
    if count == 0:
        for s in SEED_SCHEMES:
            await crud.create_scheme(db, s)

@router.get("/", response_model=List[schemas.SchemeOut])
async def get_schemes(
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await seed_schemes(db)
    schemes_list = await crud.get_schemes(db, category, query)
    return schemes_list
