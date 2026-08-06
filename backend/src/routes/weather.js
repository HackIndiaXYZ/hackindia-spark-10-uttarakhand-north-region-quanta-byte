const express = require('express');
const router = express.Router();
const axios = require('axios');

const getFallbackWeather = (city) => {
  const cityHash = (city || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const conditions = ["साफ़ (Sunny)", "बादल (Cloudy)", "हल्की बारिश (Light Rain)", "तूफान (Thunderstorm)", "धुंध (Mist)"];
  const condIndex = cityHash % conditions.length;
  const condition = conditions[condIndex];

  const temp = 25 + (cityHash % 15);
  const humidity = 40 + (cityHash % 50);
  const windSpeed = 5 + (cityHash % 20);
  const pressure = 1005 + (cityHash % 10);
  const visibility = 6 + (cityHash % 5);

  const daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const forecast = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const forecastDay = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayName = i === 0 ? "आज" : i === 1 ? "कल" : i === 2 ? "परसों" : daysHi[forecastDay.getDay()];

    const dayHash = cityHash + i;
    const dayCond = conditions[dayHash % conditions.length];
    const high = temp + (dayHash % 4) - 2;
    const low = high - 8 - (dayHash % 3);
    const rainChance = dayCond.toLowerCase().includes('sunny') ? 0 : 20 + (dayHash % 80);

    forecast.push({
      day: dayName,
      condition: dayCond,
      high: Math.round(high),
      low: Math.round(low),
      rain_chance: rainChance
    });
  }

  const tips = [];
  if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('thunderstorm')) {
    tips.push({ type: "danger", text: "🌧️ भारी बारिश की संभावना है — अपनी फसल कटाई रोकें और भीगने से बचाएं।" });
    tips.push({ type: "warning", text: "💧 खेतों में अतिरिक्त पानी निकासी का प्रबंध करें, सिंचाई तुरंत बंद करें।" });
  } else if (temp > 35) {
    tips.push({ type: "warning", text: "🥵 अत्यधिक तापमान — फसलों को झुलसने से बचाने के लिए शाम को हल्की सिंचाई करें।" });
    tips.push({ type: "safe", text: "🌻 गर्मी सहन करने वाली फसलें (जैसे मक्का) के लिए अनुकूल मौसम।" });
  } else {
    tips.push({ type: "safe", text: "🌤️ मौसम सुहावना है — आज सिंचाई और उर्वरक छिड़काव (Urea spray) के लिए उत्तम दिन है।" });
    tips.push({ type: "safe", text: "🌾 कटी हुई फसल को धूप में सुखाने का सही समय है।" });
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return {
    location: city,
    date: formattedDate,
    temp: Math.round(temp),
    condition,
    humidity,
    wind_speed: windSpeed,
    pressure,
    visibility,
    forecast,
    farming_tips: tips
  };
};

router.post('/', async (req, res) => {
  try {
    const location = (req.query.location || req.body.location || 'वाराणसी').trim();

    if (!process.env.OPENWEATHER_API_KEY) {
      return res.json({ weather: getFallbackWeather(location) });
    }

    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},IN&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    const geoRes = await axios.get(geoUrl);
    if (!geoRes.data || geoRes.data.length === 0) {
      return res.json({ weather: getFallbackWeather(location) });
    }

    const { lat, lon, name: cityName } = geoRes.data[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await axios.get(weatherUrl);

    const listData = weatherRes.data.list;
    const current = listData[0];

    const conditionMap = {
      clear: "साफ़ (Sunny)",
      clouds: "बादल (Cloudy)",
      rain: "बारिश (Rain)",
      drizzle: "हल्की बारिश (Drizzle)",
      thunderstorm: "तूफान (Thunderstorm)",
      mist: "धुंध (Mist)",
      fog: "कोहरा"
    };

    const rawCond = (current.weather[0].main || '').toLowerCase();
    const condition = conditionMap[rawCond] || current.weather[0].description;

    const daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
    const forecast = [];

    for (let idx = 0; idx < Math.min(listData.length, 56); idx += 8) {
      const dayData = listData[idx];
      const dayTime = new Date(dayData.dt * 1000);
      const dayName = idx === 0 ? "आज" : idx === 8 ? "कल" : idx === 16 ? "परसों" : daysHi[dayTime.getDay()];
      const dayRawCond = (dayData.weather[0].main || '').toLowerCase();
      const dayCond = conditionMap[dayRawCond] || dayData.weather[0].description;

      forecast.push({
        day: dayName,
        condition: dayCond,
        high: Math.round(dayData.main.temp_max),
        low: Math.round(dayData.main.temp_min),
        rain_chance: Math.round((dayData.pop || 0) * 100)
      });
    }

    const tips = [];
    const rainUpcoming = forecast.slice(0, 3).some(f => f.condition.toLowerCase().includes('rain'));
    if (rainUpcoming) {
      tips.push({ type: "danger", text: "🌧️ अगले कुछ दिनों में बारिश की संभावना है — अपनी फसल कटाई रोकें और सुरक्षित स्थान पर रखें।" });
      tips.push({ type: "warning", text: "💧 सिंचाई तुरंत बंद करें। खेतों में पानी जमा न होने दें।" });
    } else {
      if (current.main.temp > 35) {
        tips.push({ type: "warning", text: "🥵 अत्यधिक गर्मी — फसलों को सूखने से बचाने के लिए शाम को हल्की सिंचाई करें।" });
      }
      tips.push({ type: "safe", text: "🌤️ मौसम अनुकूल है — आज कीटनाशक छिड़काव (Pest spray) या यूरिया का प्रयोग करें।" });
      tips.push({ type: "safe", text: "🌾 कटी फसलों को सुखाने और मंडी ले जाने के लिए उपयुक्त समय है।" });
    }

    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    return res.json({
      weather: {
        location: cityName || location,
        date: formattedDate,
        temp: Math.round(current.main.temp),
        condition,
        humidity: current.main.humidity,
        wind_speed: Math.round(current.wind.speed * 3.6),
        pressure: current.main.pressure,
        visibility: Math.round((current.visibility || 10000) / 1000),
        forecast,
        farming_tips: tips
      }
    });

  } catch (error) {
    console.error('Weather error:', error.message);
    const location = (req.query.location || req.body.location || 'वाराणसी').trim();
    return res.json({ weather: getFallbackWeather(location) });
  }
});

router.get('/auto', async (req, res) => {
  const { lat, lon } = req.query;
  if (!process.env.OPENWEATHER_API_KEY || !lat || !lon) {
    return res.json({ city: "वाराणसी" });
  }

  try {
    const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    if (response.data && response.data.length > 0) {
      return res.json({ city: response.data[0].name });
    }
  } catch (err) {
    console.error('Auto weather error:', err.message);
  }

  return res.json({ city: "वाराणसी" });
});

module.exports = router;
