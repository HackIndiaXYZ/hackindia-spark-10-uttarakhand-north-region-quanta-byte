from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from ..config import settings
from ..database import get_db

router = APIRouter()

def get_fallback_weather(city: str) -> Dict[str, Any]:
    # Dynamic deterministic weather based on city name hash code
    city_hash = sum(ord(c) for c in city)
    
    # Calculate condition
    conditions = ["साफ़ (Sunny)", "बादल (Cloudy)", "हल्की बारिश (Light Rain)", "तूफान (Thunderstorm)", "धुंध (Mist)"]
    cond_index = city_hash % len(conditions)
    condition = conditions[cond_index]
    
    # Calculate temp
    temp = 25 + (city_hash % 15) # 25°C to 39°C
    humidity = 40 + (city_hash % 50) # 40% to 90%
    wind_speed = 5 + (city_hash % 20) # 5 to 25 km/h
    pressure = 1005 + (city_hash % 10)
    visibility = 6 + (city_hash % 5)
    
    # Generate 7 day forecast
    forecast = []
    days_hi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"]
    current_day = datetime.now()
    
    for i in range(7):
        forecast_day = current_day + timedelta(days=i)
        day_name = "आज" if i == 0 else "कल" if i == 1 else "परसों" if i == 2 else days_hi[forecast_day.weekday()]
        
        day_hash = city_hash + i
        day_cond = conditions[day_hash % len(conditions)]
        high = temp + (day_hash % 4) - 2
        low = high - 8 - (day_hash % 3)
        rain_chance = 0 if "sunny" in day_cond.lower() else 20 + (day_hash % 80)
        
        forecast.append({
            "day": day_name,
            "condition": day_cond,
            "high": int(high),
            "low": int(low),
            "rain_chance": rain_chance
        })
        
    # Generate farming tips
    tips = []
    if "rain" in condition.lower() or "thunderstorm" in condition.lower():
        tips.append({"type": "danger", "text": "🌧️ भारी बारिश की संभावना है — अपनी फसल कटाई रोकें और भीगने से बचाएं।"})
        tips.append({"type": "warning", "text": "💧 खेतों में अतिरिक्त पानी निकासी का प्रबंध करें, सिंचाई तुरंत बंद करें।"})
    elif temp > 35:
        tips.append({"type": "warning", "text": "🥵 अत्यधिक तापमान — फसलों को झुलसने से बचाने के लिए शाम को हल्की सिंचाई करें।"})
        tips.append({"type": "safe", "text": "🌻 गर्मी सहन करने वाली फसलें (जैसे मक्का) के लिए अनुकूल मौसम।"})
    else:
        tips.append({"type": "safe", "text": "🌤️ मौसम सुहावना है — आज सिंचाई और उर्वरक छिड़काव (Urea spray) के लिए उत्तम दिन है।"})
        tips.append({"type": "safe", "text": "🌾 कटी हुई फसल को धूप में सुखाने का सही समय है।"})
        
    return {
        "location": city,
        "date": datetime.now().strftime("%d %B %Y"),
        "temp": int(temp),
        "condition": condition,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "pressure": pressure,
        "visibility": visibility,
        "forecast": forecast,
        "farming_tips": tips
    }

@router.post("/")
async def get_weather(location: str = Query(...)):
    location = location.strip()
    if not location:
        raise HTTPException(status_code=400, detail="Location is required")
        
    if not settings.OPENWEATHER_API_KEY:
        # Return fallback mock data
        return {"weather": get_fallback_weather(location)}
        
    # If API key is present, call OpenWeather
    try:
        async with httpx.AsyncClient() as client:
            # First fetch lat/lon
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location},IN&limit=1&appid={settings.OPENWEATHER_API_KEY}"
            geo_res = await client.get(geo_url)
            geo_data = geo_res.json()
            
            if not geo_data:
                return {"weather": get_fallback_weather(location)}
                
            lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]
            city_name = geo_data[0]["name"]
            
            # Fetch weather data
            weather_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={settings.OPENWEATHER_API_KEY}"
            weather_res = await client.get(weather_url)
            weather_data = weather_res.json()
            
            # Parse weather data
            list_data = weather_data["list"]
            current = list_data[0]
            
            condition_map = {
                "clear": "साफ़ (Sunny)",
                "clouds": "बादल (Cloudy)",
                "rain": "बारिश (Rain)",
                "drizzle": "हल्की बारिश (Drizzle)",
                "thunderstorm": "तूफान (Thunderstorm)",
                "snow": "बर्फ़बारी",
                "mist": "धुंध (Mist)",
                "smoke": "धुआं",
                "haze": "धुंध (Haze)",
                "dust": "धूल",
                "fog": "कोहरा"
            }
            raw_cond = current["weather"][0]["main"].lower()
            condition = condition_map.get(raw_cond, current["weather"][0]["description"])
            
            # Generate 7 days forecast from list (every 8th item is ~24 hours later)
            forecast = []
            days_hi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"]
            
            for idx in range(0, min(len(list_data), 56), 8):
                day_data = list_data[idx]
                day_time = datetime.fromtimestamp(day_data["dt"])
                day_name = "आज" if idx == 0 else "कल" if idx == 8 else "परसों" if idx == 16 else days_hi[day_time.weekday()]
                
                day_raw_cond = day_data["weather"][0]["main"].lower()
                day_cond = condition_map.get(day_raw_cond, day_data["weather"][0]["description"])
                
                forecast.append({
                    "day": day_name,
                    "condition": day_cond,
                    "high": int(day_data["main"]["temp_max"]),
                    "low": int(day_data["main"]["temp_min"]),
                    "rain_chance": int(day_data.get("pop", 0) * 100) # probability of precipitation
                })
                
            # Create farming tips
            tips = []
            rain_upcoming = any("rain" in f["condition"].lower() or "drizzle" in f["condition"].lower() for f in forecast[:3])
            
            if rain_upcoming:
                tips.append({"type": "danger", "text": "🌧️ अगले कुछ दिनों में बारिश की संभावना है — अपनी फसल कटाई रोकें और सुरक्षित स्थान पर रखें।"})
                tips.append({"type": "warning", "text": "💧 सिंचाई तुरंत बंद करें। खेतों में पानी जमा न होने दें।"})
            else:
                temp_max = current["main"]["temp"]
                if temp_max > 35:
                    tips.append({"type": "warning", "text": "🥵 अत्यधिक गर्मी — फसलों को सूखने से बचाने के लिए शाम को हल्की सिंचाई करें।"})
                tips.append({"type": "safe", "text": "🌤️ मौसम अनुकूल है — आज कीटनाशक छिड़काव (Pest spray) या यूरिया का प्रयोग करें।"})
                tips.append({"type": "safe", "text": "🌾 कटी फसलों को सुखाने और मंडी ले जाने के लिए उपयुक्त समय है।"})
                
            return {
                "weather": {
                    "location": city_name,
                    "date": datetime.now().strftime("%d %B %Y"),
                    "temp": int(current["main"]["temp"]),
                    "condition": condition,
                    "humidity": current["main"]["humidity"],
                    "wind_speed": int(current["wind"]["speed"] * 3.6), # m/s to km/h
                    "pressure": current["main"]["pressure"],
                    "visibility": int(current.get("visibility", 10000) / 1000), # m to km
                    "forecast": forecast,
                    "farming_tips": tips
                }
            }
    except Exception as e:
        # Fallback if request fails
        return {"weather": get_fallback_weather(location)}

@router.get("/auto")
async def get_weather_auto(lat: float, lon: float):
    # Reverse geocoding or direct weather lookup
    if not settings.OPENWEATHER_API_KEY:
        return {"city": "वाराणसी"} # Default testing city
        
    try:
        async with httpx.AsyncClient() as client:
            url = f"http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={settings.OPENWEATHER_API_KEY}"
            res = await client.get(url)
            data = res.json()
            if data:
                return {"city": data[0]["name"]}
    except Exception:
        pass
    return {"city": "वाराणसी"}
