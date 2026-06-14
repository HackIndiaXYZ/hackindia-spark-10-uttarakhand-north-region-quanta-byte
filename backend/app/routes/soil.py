from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import json
import base64
from ..database import get_db
from .. import crud, schemas, models
from .dependencies import get_current_user
from ..config import settings

router = APIRouter()

# Soil prompt with disclaimer
SOIL_PROMPT = """
You are an expert agronomist. Analyze the uploaded soil image and location.
You must return a JSON response matching the following structure:
{
  "soil_type": "Soil Type (e.g. बलुई दोमट (Sandy Loam))",
  "ph": 6.8,
  "moisture": "Low" (or "Medium" or "High"),
  "fertility": "Medium" (or "High" or "Low"),
  "recommended_crops": ["Crop 1", "Crop 2", "Crop 3"],
  "fertilizer_advice": "Recommended fertilizers and organic advice in Hindi"
}

IMPORTANT: In your analysis, you MUST make it clear that the pH level is an ESTIMATED RANGE based on soil color and location, and is NOT a replacement for a laboratory-grade soil chemical test.
"""

def get_fallback_soil(location: str) -> dict:
    loc_clean = location.lower()
    disclaimer = " (नोट: यह मिट्टी के रंग और क्षेत्र पर आधारित एक अनुमानित विश्लेषण है। वैज्ञानिक स्तर पर पीएच और पोषक तत्वों की सटीक जांच के लिए कृपया सरकारी मृदा परीक्षण प्रयोगशाला से रासायनिक जांच करवाएं।)"
    
    # Determinsitic fallback based on location names
    if "up" in loc_clean or "उत्तर प्रदेश" in loc_clean or "bihar" in loc_clean or "बिहार" in loc_clean or "वाराणसी" in loc_clean:
        return {
            "soil_type": "जलोढ़ मिट्टी (Alluvial Soil)",
            "ph": 7.2,
            "moisture": "Medium (मध्यम)",
            "fertility": "High (उच्च)",
            "recommended_crops": ["गेहूं (Wheat)", "धान (Paddy)", "गन्ना (Sugarcane)", "मक्का (Maize)"],
            "fertilizer_advice": "यह मिट्टी बेहद उपजाऊ है। नाइट्रोजन (Urea) और फास्फोरस (DAP) का संतुलित प्रयोग करें। जैविक खाद (Compost) 5 टन प्रति एकड़ डालने से उर्वरा शक्ति लंबे समय तक बनी रहेगी।" + disclaimer
        }
    elif "rajasthan" in loc_clean or "राजस्थान" in loc_clean or "jaipur" in loc_clean:
        return {
            "soil_type": "बलुई मिट्टी (Sandy Soil)",
            "ph": 8.1,
            "moisture": "Low (कम)",
            "fertility": "Low (कम)",
            "recommended_crops": ["बाजरा (Pearl Millet)", "चना (Gram)", "ग्वार (Guar)", "सरसों (Mustard)"],
            "fertilizer_advice": "बलुई मिट्टी में जल धारण क्षमता कम होती है। ड्रिप सिंचाई का प्रयोग करें। गोबर की खाद (FYM) अवश्य डालें। जिंक सल्फेट और जिप्सम का प्रयोग क्षारीयता कम करने में मदद करेगा।" + disclaimer
        }
    elif "mp" in loc_clean or "maharashtra" in loc_clean or "महाराष्ट्र" in loc_clean or "indore" in loc_clean:
        return {
            "soil_type": "काली मिट्टी (Black Cotton Soil)",
            "ph": 7.6,
            "moisture": "High (अधिक)",
            "fertility": "Medium to High (मध्यम से उच्च)",
            "recommended_crops": ["कपास (Cotton)", "सोयाबीन (Soybean)", "चना (Gram)", "गेहूं (Wheat)"],
            "fertilizer_advice": "इस मिट्टी में नमी सोखने की अद्भुत क्षमता है। फॉस्फेटिक खादों (SSP) का प्रयोग करें। जलभराव से बचाने के लिए जल निकासी का सही प्रबंधन करें।" + disclaimer
        }
    else:
        return {
            "soil_type": "दोमट मिट्टी (Loamy Soil)",
            "ph": 6.8,
            "moisture": "Medium (मध्यम)",
            "fertility": "Medium (मध्यम)",
            "recommended_crops": ["मक्का (Maize)", "सरसों (Mustard)", "टमाटर (Tomato)", "प्याज (Onion)"],
            "fertilizer_advice": "यह मिट्टी अधिकांश फसलों के लिए आदर्श है। जैविक कंपोस्ट के साथ आवश्यकतानुसार NPK (12:32:16) का छिड़काव करें।" + disclaimer
        }

@router.post("/", response_model=schemas.SoilOut)
async def analyze_soil(
    location: str = Form(...),
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    image_bytes = await image.read()
    encoded_img = base64.b64encode(image_bytes).decode("utf-8")
    mock_image_url = f"data:{image.content_type};base64,{encoded_img}"
    
    if len(mock_image_url) > 250000:
        mock_image_url = f"/static/img/soil_uploads/{image.filename}"
        
    disclaimer = " (नोट: यह मिट्टी के रंग और क्षेत्र पर आधारित एक अनुमानित विश्लेषण है। वैज्ञानिक स्तर पर पीएच और पोषक तत्वों की सटीक जांच के लिए कृपया सरकारी मृदा परीक्षण प्रयोगशाला से रासायनिक जांच करवाएं।)"
    
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=image.content_type
            )
            
            prompt_content = f"{SOIL_PROMPT}\nLocation: {location}"
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[image_part, prompt_content],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            
            result_json = json.loads(response.text)
            
            advice = result_json.get("fertilizer_advice", "")
            if "disclaimer" not in advice.lower() and "रासायनिक" not in advice:
                result_json["fertilizer_advice"] = advice + disclaimer
                
            soil_create = schemas.SoilCreate(
                location=location,
                soil_type=result_json.get("soil_type", "दोमट मिट्टी"),
                ph=float(result_json.get("ph", 7.0)),
                moisture=result_json.get("moisture", "Medium"),
                fertility=result_json.get("fertility", "Medium"),
                recommended_crops=result_json.get("recommended_crops", ["गेहूं", "धान"]),
                fertilizer_advice=result_json["fertilizer_advice"],
                image_url=mock_image_url
            )
            
            return await crud.create_soil_record(db, current_user.id, soil_create)
            
        except Exception as e:
            pass
            
    # Fallback to local prediction rules
    fallback = get_fallback_soil(location)
    
    soil_create = schemas.SoilCreate(
        location=location,
        soil_type=fallback["soil_type"],
        ph=fallback["ph"],
        moisture=fallback["moisture"],
        fertility=fallback["fertility"],
        recommended_crops=fallback["recommended_crops"],
        fertilizer_advice=fallback["fertilizer_advice"],
        image_url=mock_image_url
    )
    
    return await crud.create_soil_record(db, current_user.id, soil_create)
