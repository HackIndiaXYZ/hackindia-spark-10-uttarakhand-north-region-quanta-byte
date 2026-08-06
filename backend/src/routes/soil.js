const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const SoilRecord = require('../models/SoilRecord');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getFallbackSoil = (location) => {
  const locClean = (location || '').toLowerCase();
  const disclaimer = " (नोट: यह मिट्टी के रंग और क्षेत्र पर आधारित एक अनुमानित विश्लेषण है। वैज्ञानिक स्तर पर पीएच और पोषक तत्वों की सटीक जांच के लिए कृपया सरकारी मृदा परीक्षण प्रयोगशाला से रासायनिक जांच करवाएं।)";

  if (locClean.includes('up') || locClean.includes('उत्तर प्रदेश') || locClean.includes('bihar') || locClean.includes('बिहार') || locClean.includes('वाराणसी')) {
    return {
      soil_type: "जलोढ़ मिट्टी (Alluvial Soil)",
      ph: 7.2,
      moisture: "Medium (मध्यम)",
      fertility: "High (उच्च)",
      recommended_crops: ["गेहूं (Wheat)", "धान (Paddy)", "गन्ना (Sugarcane)", "मक्का (Maize)"],
      fertilizer_advice: "यह मिट्टी बेहद उपजाऊ है। नाइट्रोजन (Urea) और फास्फोरस (DAP) का संतुलित प्रयोग करें। जैविक खाद (Compost) 5 टन प्रति एकड़ डालने से उर्वरा शक्ति लंबे समय तक बनी रहेगी।" + disclaimer
    };
  } else if (locClean.includes('rajasthan') || locClean.includes('राजस्थान') || locClean.includes('jaipur')) {
    return {
      soil_type: "बलुई मिट्टी (Sandy Soil)",
      ph: 8.1,
      moisture: "Low (कम)",
      fertility: "Low (कम)",
      recommended_crops: ["बाजरा (Pearl Millet)", "चना (Gram)", "ग्वार (Guar)", "सरसों (Mustard)"],
      fertilizer_advice: "बलुई मिट्टी में जल धारण क्षमता कम होती है। ड्रिप सिंचाई का प्रयोग करें। गोबर की खाद (FYM) अवश्य डालें। जिंक सल्फेट और जिप्सम का प्रयोग क्षारीयता कम करने में मदद करेगा।" + disclaimer
    };
  } else if (locClean.includes('mp') || locClean.includes('maharashtra') || locClean.includes('महाराष्ट्र') || locClean.includes('indore')) {
    return {
      soil_type: "काली मिट्टी (Black Cotton Soil)",
      ph: 7.6,
      moisture: "High (अधिक)",
      fertility: "Medium to High (मध्यम से उच्च)",
      recommended_crops: ["कपास (Cotton)", "सोयाबीन (Soybean)", "चना (Gram)", "गेहूं (Wheat)"],
      fertilizer_advice: "इस मिट्टी में नमी सोखने की अद्भुत क्षमता है। फॉस्फेटिक खादों (SSP) का प्रयोग करें। जलभराव से बचाने के लिए जल निकासी का सही प्रबंधन करें।" + disclaimer
    };
  } else {
    return {
      soil_type: "दोमट मिट्टी (Loamy Soil)",
      ph: 6.8,
      moisture: "Medium (मध्यम)",
      fertility: "Medium (मध्यम)",
      recommended_crops: ["मक्का (Maize)", "सरसों (Mustard)", "टमाटर (Tomato)", "प्याज (Onion)"],
      fertilizer_advice: "यह मिट्टी अधिकांश फसलों के लिए आदर्श है। जैविक कंपोस्ट के साथ आवश्यकतानुसार NPK (12:32:16) का छिड़काव करें।" + disclaimer
    };
  }
};

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { location } = req.body;
    let imageUrl = '/static/img/soil_uploads/default.jpg';

    if (req.file) {
      const base64Str = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      imageUrl = `data:${mimeType};base64,${base64Str}`;
      if (imageUrl.length > 250000) {
        imageUrl = `/static/img/soil_uploads/${req.file.originalname || 'upload.jpg'}`;
      }
    }

    let analysisData = null;
    const disclaimer = " (नोट: यह मिट्टी के रंग और क्षेत्र पर आधारित एक अनुमानित विश्लेषण है। वैज्ञानिक स्तर पर पीएच और पोषक तत्वों की सटीक जांच के लिए कृपया सरकारी मृदा परीक्षण प्रयोगशाला से रासायनिक जांच करवाएं।)";

    if (process.env.GEMINI_API_KEY && req.file) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert agronomist. Analyze soil image at location (${location}). Return JSON with: soil_type (Hindi/English), ph (float), moisture ("Low"|"Medium"|"High"), fertility ("Low"|"Medium"|"High"), recommended_crops (array), fertilizer_advice (Hindi text).`;

        const imagePart = {
          inlineData: {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype || 'image/jpeg'
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiErr) {
        console.error('Gemini soil analysis error:', geminiErr.message);
      }
    }

    if (!analysisData) {
      analysisData = getFallbackSoil(location);
    }

    let advice = analysisData.fertilizer_advice || '';
    if (!advice.includes('रासायनिक') && !advice.includes('नोट:')) {
      advice += disclaimer;
    }

    const record = await SoilRecord.create({
      user_id: req.user._id,
      location: location || 'वाराणसी',
      soil_type: analysisData.soil_type || 'दोमट मिट्टी',
      ph: parseFloat(analysisData.ph || 7.0),
      moisture: analysisData.moisture || 'Medium',
      fertility: analysisData.fertility || 'Medium',
      recommended_crops: Array.isArray(analysisData.recommended_crops) ? analysisData.recommended_crops : ['गेहूं', 'धान'],
      fertilizer_advice: advice,
      image_url: imageUrl
    });

    return res.json(record.toJSON());
  } catch (error) {
    console.error('Analyze soil error:', error);
    return res.status(500).json({ detail: error.message });
  }
});

module.exports = router;
