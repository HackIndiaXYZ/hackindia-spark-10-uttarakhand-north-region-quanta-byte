const express = require('express');
const router = express.Router();

const getVoiceFallback = (query) => {
  const q = (query || '').toLowerCase();
  if (q.includes('पीले') || q.includes('दाग') || q.includes('रोग') || q.includes('wheat')) {
    return "फसल पर पीले दाग कवक रोग के लक्षण हो सकते हैं। पानी जमा न होने दें और कृषि विशेषज्ञ से सलाह लेकर फफूंदनाशक दवा का छिड़काव करें।";
  } else if (q.includes('भाव') || q.includes('मंडी') || q.includes('रेट')) {
    return "आज आपके जिले में धान का भाव लगभग इक्कीस सौ रुपये और गेहूं का भाव बाईस सौ रुपये प्रति क्विंटल चल रहा है।";
  } else if (q.includes('बारिश') || q.includes('मौसम')) {
    return "आसमान में आंशिक रूप से बादल छाए रहने का अनुमान है। यदि भारी बारिश की संभावना हो तो सिंचाई रोक दें।";
  } else if (q.includes('किसान') || q.includes('पैसा') || q.includes('किस्त')) {
    return "प्रधानमंत्री किसान सम्मान निधि की नई किस्त जारी कर दी गई है। आप अधिकारिक वेबसाइट पर जाकर अपना खाता स्टेटस चेक कर सकते हैं।";
  } else {
    return "नमस्ते। मैं आपका कृषि सहायक हूँ। मैं आपकी खेती से जुड़ी समस्याओं का तुरंत उत्तर दे सकता हूँ। कृपया अपना प्रश्न पूछें।";
  }
};

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ detail: "Query cannot be empty" });
    }

    let reply = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemInstruction = `You are a voice advisory assistant for Indian farmers. The user is speaking to you. Reply in simple Hindi (under 3 sentences). Do not use bullet points, stars (*), or hash symbols.`;

        const result = await model.generateContent(`${systemInstruction}\nFarmer says: ${query}`);
        const text = result.response.text();
        reply = (text || '').replace(/\*/g, '').replace(/#/g, '').replace(/-/g, '').trim();
      } catch (geminiErr) {
        console.error('Gemini voice query error:', geminiErr.message);
      }
    }

    if (!reply) {
      reply = getVoiceFallback(query);
    }

    return res.json({ response: reply });
  } catch (error) {
    console.error('Voice query error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
