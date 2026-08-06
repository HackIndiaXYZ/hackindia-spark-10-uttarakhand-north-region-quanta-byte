const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');

const getFallbackBotResponse = (message) => {
  const msg = (message || '').toLowerCase();
  if (msg.includes('गेहूं') || msg.includes('wheat')) {
    if (msg.includes('पीला') || msg.includes('rust') || msg.includes('रोग')) {
      return "गेहूं में पीलापन या जंग (Yellow Rust) कवक के कारण हो सकता है। नियंत्रण के लिए प्रोपिकोनाजोल (Tilt) 25% EC का 1ml प्रति लीटर पानी में छिड़काव करें। यूरिया का अधिक उपयोग न करें।";
    }
    return "गेहूं की अच्छी पैदावार के लिए समय पर बुवाई (नवंबर) करें। मुख्य किस्मों में HD 2967, HD 3086 शामिल हैं। 4-5 बार सिंचाई आवश्यक है, विशेष रूप से मुकुट जड़ बनते समय।";
  } else if (msg.includes('धान') || msg.includes('paddy') || msg.includes('rice')) {
    return "धान की फसल में खरपतवार नियंत्रण महत्वपूर्ण है। रोपाई के 3 दिन के अंदर प्रेटिलाक्लोर (Pretilachlor) दवा का छिड़काव करें। जलभराव का ध्यान रखें।";
  } else if (msg.includes('मंडी') || msg.includes('भाव') || msg.includes('price') || msg.includes('rate')) {
    return "आज की मंडियों में औसत भाव इस प्रकार हैं: गेहूं ₹2,150 - ₹2,250/कुंतल, धान ₹2,050 - ₹2,180/कुंतल, मक्का ₹1,850/कुंतल। सरसों का भाव लगभग ₹5,200/कुंतल चल रहा है।";
  } else if (msg.includes('योजना') || msg.includes('scheme') || msg.includes('pm kisan')) {
    return "प्रधानमंत्री किसान सम्मान निधि योजना के तहत सरकार हर साल ₹6,000 की वित्तीय सहायता तीन किस्तों में देती है। अपनी पात्रता जांचने के लिए 'सरकारी योजनाएं' पेज पर जाएं।";
  } else if (msg.includes('मौसम') || msg.includes('rain') || msg.includes('बारिश')) {
    return "आज आंशिक बादल छाए रहने का अनुमान है। यदि आने वाले दिनों में बारिश होने की संभावना हो, तो सिंचाई या कीटनाशक छिड़काव अभी न करें।";
  } else {
    return "नमस्ते! मैं आपका कृषक डिजिटल साथी हूं। आप मुझसे फसल की बीमारी, मंडी भाव, सरकारी योजनाओं, उत्तम बीजों, या सिंचाई के बारे में कुछ भी पूछ सकते हैं। आप क्या जानना चाहते हैं?";
  }
};

router.post('/query', async (req, res) => {
  try {
    const { session_id, message } = req.body;
    if (!session_id || !message) {
      return res.status(400).json({ detail: "session_id and message are required" });
    }

    // Save user message
    await ChatMessage.create({
      session_id,
      role: 'user',
      message
    });

    let botReply = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemInstruction = `You are "Krishi AI Assistant", a friendly, knowledgeable agricultural AI advisor for Indian farmers. Answer in Hindi/English politely with action-oriented farming advice.`;

        const recentHistory = await ChatMessage.find({ session_id }).sort({ created_at: -1 }).limit(6);
        recentHistory.reverse();

        const contents = [
          systemInstruction,
          ...recentHistory.map(m => `${m.role}: ${m.message}`),
          `user: ${message}`
        ].join('\n\n');

        const result = await model.generateContent(contents);
        botReply = result.response.text();
      } catch (geminiErr) {
        console.error('Gemini chatbot error:', geminiErr.message);
      }
    }

    if (!botReply) {
      botReply = getFallbackBotResponse(message);
    }

    // Save bot message
    await ChatMessage.create({
      session_id,
      role: 'bot',
      message: botReply
    });

    return res.json({ response: botReply });
  } catch (error) {
    console.error('Chat query error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

router.get('/history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const history = await ChatMessage.find({ session_id })
      .sort({ created_at: 1 })
      .limit(20);

    const formatted = history.map(m => {
      const date = new Date(m.created_at);
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return {
        role: m.role,
        message: m.message,
        time: `${hours}:${mins}`
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

router.post('/clear', async (req, res) => {
  try {
    const { session_id } = req.body;
    if (session_id) {
      await ChatMessage.deleteMany({ session_id });
    }
    return res.json({ status: "success", message: "History cleared" });
  } catch (error) {
    console.error('Clear history error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
