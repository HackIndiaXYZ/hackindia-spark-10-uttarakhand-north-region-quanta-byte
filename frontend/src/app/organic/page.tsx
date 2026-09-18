'use client';

import React, { useState } from 'react';
import { useTranslation } from '../LanguageContext';
import BackButton from '../../components/BackButton';

export default function OrganicPage() {
  const { language } = useTranslation();
  const [activeRecipe, setActiveRecipe] = useState('jeevamrutha');
  const [activeTab, setActiveTab] = useState('grains');
  
  // Calculator States
  const [cropType, setCropType] = useState('cereals');
  const [acreage, setAcreage] = useState('');
  const [calcResult, setCalcResult] = useState<any>(null);

  const recipes: Record<string, any> = {
    jeevamrutha: {
      title: language === 'hi' ? 'जीवामृत (Jeevamrutha)' : 'Jeevamrutha',
      desc: language === 'hi' ? 'पौधों के स्वास्थ्य और मिट्टी की जैविक शक्ति बढ़ाने के लिए एक शक्तिशाली तरल खाद।' : 'A powerful liquid organic fertilizer that enhances soil microflora and plant growth.',
      ingredients: language === 'hi' ? [
        'देसी गाय का गोबर: 10 किलो',
        'देसी गाय का गोमूत्र: 5 से 10 -लीटर',
        'गुड़: 1 से 2 किलो',
        'बेसन (चने का आटा): 1 से 2 किलो',
        'पीपल या बरगद के पेड़ के नीचे की सजीव मिट्टी: एक मुट्ठी',
        'पानी: 200 लीटर'
      ] : [
        'Desi cow dung: 10 kg',
        'Desi cow urine: 5 to 10 liters',
        'Organic Jaggery (Gur): 1 to 2 kg',
        'Pulse/Gram flour (Besan): 1 to 2 kg',
        'Living soil (from under a Banyan/Peepal tree): 1 handful',
        'Clean Water: 200 liters'
      ],
      steps: language === 'hi' ? [
        'एक प्लास्टिक के बड़े ड्रम (200 लीटर) में 200 लीटर पानी भरें।',
        'गोबर और गोमूत्र को पानी में डालकर अच्छी तरह मिला लें।',
        'गुड़ और बेसन को थोड़े पानी में घोलकर ड्रम में डाल दें।',
        'सजीव मिट्टी डालें और लकड़ी के डंडे से घोल को घड़ी की दिशा (clockwise) में घुमाएं।',
        'ड्रम को किसी बोरी से ढककर छायादार स्थान पर 3 से 7 दिनों के लिए रखें।',
        'रोजाना सुबह-शाम 2-2 मिनट डंडे से घोल को हिलाएं। 7 दिन बाद जीवामृत तैयार है।',
        'उपयोग: 10% जीवामृत घोल (10 लीटर जीवामृत + 90 लीटर पानी) का फसलों पर छिड़काव या सिंचाई के साथ दें।'
      ] : [
        'Take a 200-liter capacity plastic drum and fill it with clean water.',
        'Add 10 kg of fresh cow dung and 10 liters of cow urine; mix thoroughly.',
        'Dissolve jaggery and gram flour in a separate bucket of water, then pour into the drum.',
        'Add a handful of rich forest/undisturbed soil and stir the mixture clockwise with a wooden stick.',
        'Cover the drum with a jute bag and leave it in a cool, shady spot for 3 to 7 days.',
        'Stir the mixture twice daily (morning & evening) for 2 minutes. It is ready in 7 days.',
        'Usage: Mix 10 liters of Jeevamrutha with 90 liters of water and spray, or apply via irrigation.'
      ]
    },
    neemastra: {
      title: language === 'hi' ? 'नीमास्त्र (Neem Astra)' : 'Neem Astra',
      desc: language === 'hi' ? 'रस चूसने वाले कीटों (aphids, whitefly, jassids) और इल्लियों के नियंत्रण के लिए जैविक कीटनाशक।' : 'An eco-friendly organic pesticide to control sap-sucking pests, whiteflies, and caterpillars.',
      ingredients: language === 'hi' ? [
        'नीम की पत्तियां और टहनियां: 10 किलो (पीसकर)',
        'देसी गाय का गोमूत्र: 10 लीटर',
        'देसी गाय का गोबर: 2 किलो',
        'पानी: 200 लीटर'
      ] : [
        'Neem leaves and tender branches: 10 kg (crushed/pulped)',
        'Desi cow urine: 10 liters',
        'Desi cow dung: 2 kg',
        'Clean Water: 200 liters'
      ],
      steps: language === 'hi' ? [
        'नीम की पत्तियों को अच्छी तरह कूट लें या पीसकर पेस्ट बना लें।',
        '200 लीटर पानी में नीम का पेस्ट, गोमूत्र और गोबर डाल दें।',
        'लकड़ी के डंडे से घोल को अच्छी तरह हिलाएं।',
        'ड्रम को जूट की बोरी से ढकें और इसे 48 घंटे के लिए छाया में रख दें।',
        'इस 48 घंटे के दौरान दिन में 3-4 बार घोल को डंडे से हिलाएं।',
        '48 घंटे बाद घोल को पतले कपड़े से छान लें। नीमास्त्र तैयार है।',
        'उपयोग: नीमास्त्र को सीधे (बिना पानी मिलाए) खड़ी फसल पर कीट लगने पर स्प्रे करें।'
      ] : [
        'Crush or grind 10 kg of neem leaves to make a fine paste.',
        'Add neem paste, 10 liters of cow urine, and 2 kg of cow dung to 200 liters of water.',
        'Stir the mixture clockwise using a wooden stick.',
        'Cover with a jute bag and store in shade for 48 hours.',
        'Stir the solution 3-4 times daily during the fermentation phase.',
        'After 48 hours, strain the liquid through a cotton cloth. Neem Astra is ready.',
        'Usage: Spray directly on the crops without adding extra water during pest infestations.'
      ]
    },
    panchagavya: {
      title: language === 'hi' ? 'पंचगव्य (Panchagavya)' : 'Panchagavya',
      desc: language === 'hi' ? 'गाय के पास मुख्य उत्पादों से निर्मित चमत्कारिक ग्रोथ प्रमोटर जो पौधों को रोगों से बचाता है।' : 'A miraculous organic growth promoter made from five key products of cow, boosting crop immunity.',
      ingredients: language === 'hi' ? [
        'ताजा गाय का गोबर: 7 किलो',
        'गाय का घी: 1 किलो',
        'पानी: 3 लीटर + गोमूत्र: 10 लीटर',
        'गाय का दूध: 3 लीटर + दही: 2 लीटर',
        'नारियल पानी: 3 लीटर + पका केला: 12 पीस',
        'गुड़: 3 किलो (3 लीटर पानी में घुला हुआ)'
      ] : [
        'Fresh cow dung: 7 kg',
        'Cow ghee: 1 kg',
        'Clean Water: 3 liters + Cow urine: 10 liters',
        'Cow milk: 3 liters + Cow curd: 2 liters',
        'Tender coconut water: 3 liters + Ripe bananas: 12 pieces',
        'Sugarcane jaggery: 3 kg (dissolved in 3L water)'
      ],
      steps: language === 'hi' ? [
        'पहले गाय के गोबर और घी को एक ड्रम में अच्छी तरह मिला लें और 3 दिनों तक रखें। रोज हिलाएं।',
        'चौथे दिन गोमूत्र और 3 लीटर पानी डालकर घोल लें और अगले 15 दिनों तक फर्मेंट होने दें।',
        '19वें दिन दूध, दही, नारियल पानी, केला और गुड़ का घोल ड्रम में डालें।',
        'अगले 10 दिनों तक पूरे मिश्रण को रोज सुबह-शाम डंडे से हिलाएं। 30वें दिन पंचगव्य तैयार हो जाएगा।',
        'उपयोग: 3 लीटर पंचगव्य को 100 लीटर पानी में मिलाकर फसलों पर स्प्रे करें या ड्रिप से दें।'
      ] : [
        'Mix fresh cow dung and ghee thoroughly in a plastic container and leave it for 3 days (stir daily).',
        'On the 4th day, add cow urine and 3 liters of water. Let it ferment for the next 15 days.',
        'On the 19th day, add cow milk, curd, coconut water, mashed bananas, and dissolved jaggery.',
        'Stir the entire mixture twice daily for the next 10 days. Panchagavya is ready by the 30th day.',
        'Usage: Mix 3 liters of Panchagavya with 100 liters of water and spray or feed via irrigation.'
      ]
    }
  };

  const organicCrops: Record<string, any[]> = {
    grains: [
      {
        name: language === 'hi' ? 'जैविक गेहूं (Organic Wheat)' : 'Organic Wheat',
        emoji: '🌾',
        soil: language === 'hi' ? 'दोमट या बलुई दोमट मिट्टी (pH 6.0 - 7.5)' : 'Loam or sandy loam soil (pH 6.0 - 7.5)',
        howToGrow: language === 'hi' ? 'अक्टूबर-नवंबर में बुवाई करें। गोबर की खाद (10 टन/एकड़) या केंचुआ खाद का प्रयोग करें। बीज उपचार के लिए बीजामृत का प्रयोग करें।' : 'Sow in Oct-Nov. Apply 10 tons of farmyard manure per acre. Treat seeds with Beejamrutha before sowing.',
        water: language === 'hi' ? 'मध्यम पानी — 4 से 6 बार सिंचाई (क्राउन रूट इनिशिएशन, पुष्पन और दाना बनते समय महत्वपूर्ण)।' : 'Moderate water — 4 to 6 irrigations (critical at crown root initiation, flowering, and grain filling stages).',
        varieties: language === 'hi' ? 'शरबती, बंसी, सी.306, कुदरत' : 'Sharbati, Bansi, C.306, Kudrat',
        pestControl: language === 'hi' ? 'दीमक के लिए नीमास्त्र का उपयोग करें, रस्ट रोग के लिए खट्टी छाछ का छिड़काव करें।' : 'Use Neem Astra for termites; spray sour buttermilk for rust control.'
      },
      {
        name: language === 'hi' ? 'जैविक धान (Organic Rice)' : 'Organic Rice',
        emoji: '🌾',
        soil: language === 'hi' ? 'चिकनी या मटियार मिट्टी (पानी रोकने की क्षमता वाली, pH 5.5 - 6.5)' : 'Clayey or clay loam soil with high water retention (pH 5.5 - 6.5)',
        howToGrow: language === 'hi' ? 'मई-जून में नर्सरी तैयार करें, फिर रोपाई करें। हरी खाद (ढैंचा) को खेत में दबाएं। जीवामृत का पानी के साथ प्रयोग करें।' : 'Prepare nursery in May-June, then transplant. Incorporate green manure (Dhaincha) in soil. Apply Jeevamrutha with irrigation.',
        water: language === 'hi' ? 'अधिक पानी — रोपाई के बाद खेत में 2-5 सेमी पानी हमेशा बना रहना चाहिए।' : 'High water — maintain 2-5 cm of standing water in the field post-transplantation.',
        varieties: language === 'hi' ? 'बासमती 370, पूसा बासमती, काला नमक' : 'Basmati 370, Pusa Basmati, Kala Namak',
        pestControl: language === 'hi' ? 'तना छेदक के लिए प्रकाश प्रपंच (Light trap) और अग्निअस्त्र का उपयोग करें।' : 'Use light traps and Agni Astra for stem borer control.'
      }
    ],
    vegetables: [
      {
        name: language === 'hi' ? 'जैविक टमाटर (Organic Tomato)' : 'Organic Tomato',
        emoji: '🍅',
        soil: language === 'hi' ? 'अच्छी जल निकासी वाली दोमट मिट्टी (pH 6.0 - 7.0)' : 'Well-drained sandy loam soil (pH 6.0 - 7.0)',
        howToGrow: language === 'hi' ? 'नर्सरी से पौध तैयार कर क्यारियों में लगाएं। प्रति एकड़ 5 टन कम्पोस्ट और नीम की खली का प्रयोग करें।' : 'Transplant seedlings onto raised beds. Apply 5 tons of compost and neem cake per acre.',
        water: language === 'hi' ? 'नियमित सिंचाई — हर 7-10 दिनों में। फल बनते समय नमी का ध्यान रखें।' : 'Regular irrigation — every 7-10 days. Ensure optimal moisture during fruit set.',
        varieties: language === 'hi' ? 'पूसा रोहिणी, स्वर्ण नवीन, अर्का रक्षक' : 'Pusa Rohini, Swarna Naveen, Arka Rakshak',
        pestControl: language === 'hi' ? 'फल छेदक के लिए पंचगव्य का स्प्रे करें और फेरोमोन ट्रैप लगाएं।' : 'Spray Panchagavya and set up pheromone traps for fruit borers.'
      },
      {
        name: language === 'hi' ? 'जैविक आलू (Organic Potato)' : 'Organic Potato',
        emoji: '🥔',
        soil: language === 'hi' ? 'बलुई दोमट या ढीली मिट्टी (कंदों के विकास के लिए उत्तम, pH 5.2 - 6.4)' : 'Loose, well-aerated sandy loam soil for tuber expansion (pH 5.2 - 6.4)',
        howToGrow: language === 'hi' ? 'अक्टूबर में कंद बोएं। मिट्टी चढ़ाते समय केंचुआ खाद और राख का प्रयोग करें।' : 'Sow tubers in October. Apply vermicompost and wood ash during earthing up.',
        water: language === 'hi' ? 'मध्यम सिंचाई — मिट्टी में नमी रहनी चाहिए, पानी रुकना नहीं चाहिए।' : 'Moderate irrigation — maintain soil moisture but avoid waterlogging.',
        varieties: language === 'hi' ? 'कुफरी चंद्रमुखी, कुफरी ज्योति, कुफरी सिंदूरी' : 'Kufri Chandramukhi, Kufri Jyoti, Kufri Sindhuri',
        pestControl: language === 'hi' ? 'झुलसा रोग (blight) से बचाव के लिए गोमूत्र और तांबे के बर्तन में रखी छाछ का स्प्रे करें।' : 'Spray cow urine and copper-treated buttermilk to prevent late/early blight.'
      }
    ],
    flowers: [
      {
        name: language === 'hi' ? 'जैविक गेंदा (Organic Marigold)' : 'Organic Marigold',
        emoji: '🌼',
        soil: language === 'hi' ? 'विभिन्न प्रकार की मिट्टियां, जल निकासी आवश्यक (pH 6.5 - 7.5)' : 'Adaptable to various soils with good drainage (pH 6.5 - 7.5)',
        howToGrow: language === 'hi' ? 'वर्ष में तीन बार (फरवरी, जून, अक्टूबर) लगा सकते हैं। गोबर खाद और कम्पोस्ट का प्रयोग करें।' : 'Can be planted thrice a year (Feb, June, Oct). Use farmyard manure and compost.',
        water: language === 'hi' ? 'कम से मध्यम पानी — गर्मियों में हफ्ते में दो बार, सर्दियों में 10-15 दिनों में।' : 'Low to moderate water — twice a week in summer, every 10-15 days in winter.',
        varieties: language === 'hi' ? 'पूसा नारंगी, पूसा बसंती, अफ्रीकन गेंदा' : 'Pusa Narangi, Pusa Basanti, African Marigold',
        pestControl: language === 'hi' ? 'कीटों से प्राकृतिक बचाव करता है। कवक रोग के लिए दशपर्णी अर्क छिड़कें।' : 'Acts as a natural pest repellent. Spray Dashaparni Ark for fungal issues.'
      },
      {
        name: language === 'hi' ? 'जैविक गुलाब (Organic Rose)' : 'Organic Rose',
        emoji: '🌹',
        soil: language === 'hi' ? 'गहरी, उपजाऊ और अच्छे जल निकास वाली दोमट मिट्टी (pH 6.0 - 6.5)' : 'Deep, fertile, well-drained loamy soil (pH 6.0 - 6.5)',
        howToGrow: language === 'hi' ? 'कलम लगाकर या ग्राफ्टेड पौधों से। गड्ढों में 5 किलो सड़ी हुई गोबर की खाद और नीम केक डालें।' : 'Propagated via cuttings or grafted plants. Apply 5 kg decomposed manure and neem cake in pits.',
        water: language === 'hi' ? 'नियमित सिंचाई — गर्मियों में 2-3 दिन के अंतर पर, सर्दियों में साप्ताहिक।' : 'Regular irrigation — every 2-3 days in summer, weekly in winter.',
        varieties: language === 'hi' ? 'देशी लाल गुलाब, डमास्क गुलाब (सुगंधित)' : 'Desi Red Rose, Damask Rose (highly fragrant)',
        pestControl: language === 'hi' ? 'एफिड्स और थ्रिप्स के लिए नीमास्त्र या लहसुन-मिर्च तीखा अर्क स्प्रे करें।' : 'Spray Neem Astra or garlic-chili extract for aphids and thrips.'
      }
    ],
    fruits: [
      {
        name: language === 'hi' ? 'जैविक आम (Organic Mango)' : 'Organic Mango',
        emoji: '🥭',
        soil: language === 'hi' ? 'गहरी बलुई दोमट मिट्टी (pH 5.5 - 7.5)' : 'Deep, well-drained alluvial or sandy loam soil (pH 5.5 - 7.5)',
        howToGrow: language === 'hi' ? 'जुलाई-आगस्त में पौधे लगाएं। हर साल पेड़ के चारों ओर थाला बनाकर गोबर खाद, वर्मीकम्पोस्ट और जीवामृत दें।' : 'Plant grafts in July-August. Create basins around trees annually and feed with compost, vermicompost & Jeevamrutha.',
        water: language === 'hi' ? 'कम से मध्यम पानी — बड़े पेड़ों को पुष्पन और फल आने के दौरान 10-15 दिन के अंतराल पर सिंचाई दें।' : 'Low to moderate water — irrigate mature trees at 10-15 days intervals during flowering and fruiting.',
        varieties: language === 'hi' ? 'अल्फांसो, दशहरी, लंगड़ा, चौसा' : 'Alphonso, Dasheri, Langra, Chaunsa',
        pestControl: language === 'hi' ? 'हॉपर कीट के लिए नीमास्त्र छिड़कें; तना छेदक के लिए तने पर बोर्डो पेस्ट लगाएं।' : 'Spray Neem Astra for leaf hoppers; paint tree trunks with organic Bordeaux paste for stem borer.'
      },
      {
        name: language === 'hi' ? 'जैविक पपीता (Organic Papaya)' : 'Organic Papaya',
        emoji: '🍈',
        soil: language === 'hi' ? 'रेतीली दोमट या बलुई मिट्टी (पानी जमा होना घातक, pH 6.0 - 6.5)' : 'Sandy loam soil with exceptional drainage (waterlogging is fatal, pH 6.0 - 6.5)',
        howToGrow: language === 'hi' ? 'नर्सरी से 2 महीने पुरानी पौध लगाएं। कम्पोस्ट और जैविक जीवाणु खाद (PSB, Azotobacter) दें।' : 'Transplant 2-month-old seedlings. Supply compost and bio-fertilizers (PSB, Azotobacter).',
        water: language === 'hi' ? 'कम पानी — हल्की सिंचाई 8-10 दिनों में (ड्रिप विधि सर्वश्रेष्ठ)।' : 'Low water — irrigate lightly every 8-10 days (drip irrigation is recommended).',
        varieties: language === 'hi' ? 'पूसा डेलिशियस, पूसा नन्हा, रेड लेडी 786' : 'Pusa Delicious, Pusa Nanha, Red Lady 786',
        pestControl: language === 'hi' ? 'वाइरस रोग फैलाने वाले वाइटफ्लाई के लिए पीला चिपचिपा ट्रैप (Yellow sticky trap) लगाएं।' : 'Set up yellow sticky traps to control virus-carrying whiteflies.'
      }
    ]
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const acres = parseFloat(acreage);
    if (isNaN(acres) || acres <= 0) return;

    let compostFactor = 2.5;
    let vermicompostFactor = 1.0;
    let neemCakeFactor = 100;

    if (cropType === 'vegetables') {
      compostFactor = 3.5;
      vermicompostFactor = 1.5;
      neemCakeFactor = 150;
    } else if (cropType === 'cash') {
      compostFactor = 4.0;
      vermicompostFactor = 2.0;
      neemCakeFactor = 200;
    }

    setCalcResult({
      compost: (acres * compostFactor).toFixed(1),
      vermicompost: (acres * vermicompostFactor).toFixed(1),
      neemCake: (acres * neemCakeFactor).toFixed(0),
      jeevamrutha: (acres * 150).toFixed(0)
    });
  };

  return (
    <div className="krishi-container" style={{ paddingBottom: '4rem' }}>
      <BackButton />

      <div className="page-header fade-in-up">
        <h1 className="page-title" style={{ color: '#10B981' }}><i className="fa-solid fa-leaf"></i> {language === 'hi' ? 'जैविक खेती संवर्धन' : 'Organic Farming Hub'}</h1>
        <p className="page-sub">{language === 'hi' ? 'परंपरा और तकनीक का मिलाप — सीखें प्राकृतिक कीटनाशक बनाना और निकालें जैविक खाद की जरूरत।' : 'Sustainable agriculture guide — organic recipe preparation and bio-fertilizer calculators.'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Certification Guide Block */}
        <div className="krishi-card fade-in-up" style={{ borderLeft: '3px solid #10B981', background: 'rgba(17, 24, 39, 0.45)' }}>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-certificate" style={{ color: '#10B981' }}></i>
            {language === 'hi' ? 'भारत जैविक प्रमाणन गाइड' : 'Indian Organic Certification'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', color: '#D1D5DB' }}>
            <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: '#10B981', display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem' }}>1. PGS-India (भागीदारी गारंटी प्रणाली)</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                {language === 'hi' 
                  ? 'स्थानीय स्तर पर किसानों के समूहों (न्यूनतम 5 किसान) के लिए प्रमाणन की एक सरल प्रणाली। यह पूरी तरह मुफ्त है और छोटे घरेलू बिक्री करने वाले किसानों के लिए आदर्श है।'
                  : 'A peer-review certification for farmer groups (min 5 members). Ideal for local marketing, fully subsidized by the Government of India.'}
              </p>
            </div>
            <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: '#3B82F6', display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem' }}>2. NPOP (राष्ट्रीय जैविक उत्पादन कार्यक्रम)</strong>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                {language === 'hi'
                  ? 'वाणिज्यिक और निर्यात स्तर पर जैविक खेती के लिए अधिकृत प्रमाणन। यह तीसरे पक्ष के मान्यता प्राप्त निकायों (जैसे APEDA) द्वारा ऑडिट के बाद दिया जाता है।'
                  : 'Third-party certification for export and commercial markets managed by APEDA. Required for using the official "India Organic" label.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Organic Crop Directory Section */}
        <div className="krishi-card fade-in-up" style={{ borderLeft: '3px solid #F59E0B', background: 'rgba(17, 24, 39, 0.45)', padding: '1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-book-open" style={{ color: '#F59E0B' }}></i>
            {language === 'hi' ? 'जैविक फसल मार्गदर्शिका (Crop Directory)' : 'Organic Crop Directory'}
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {language === 'hi' 
              ? 'अनाज, सब्जियां, फूल और फलों की श्रेणी के अनुसार जैविक खेती करने की पूरी जानकारी देखें।'
              : 'Detailed manual on organic crop cultivation across grains, vegetables, flowers, and fruits.'}
          </p>

          {/* Directory Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['grains', 'vegetables', 'flowers', 'fruits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: activeTab === tab ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: activeTab === tab ? '#F59E0B' : '#9CA3AF',
                  border: `1px solid ${activeTab === tab ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s'
                }}
              >
                {tab === 'grains' && (language === 'hi' ? '🌾 अनाज (Grains)' : 'Grains')}
                {tab === 'vegetables' && (language === 'hi' ? '🍅 सब्जियां (Vegetables)' : 'Vegetables')}
                {tab === 'flowers' && (language === 'hi' ? '🌹 फूल (Flowers)' : 'Flowers')}
                {tab === 'fruits' && (language === 'hi' ? '🥭 फल (Fruits)' : 'Fruits')}
              </button>
            ))}
          </div>

          {/* Crops Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {organicCrops[activeTab]?.map((crop, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(3, 7, 18, 0.45)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 255, 255, 0.06)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Visual Header / Custom Premium Top Block */}
                <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                  <span style={{ fontSize: '3.5rem' }}>{crop.emoji}</span>
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', background: 'rgba(3, 7, 18, 0.85)', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{crop.name}</span>
                  </div>
                </div>

                {/* Details Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#D1D5DB' }}>
                  <div>
                    <strong style={{ color: '#FCD34D', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <i className="fa-solid fa-seedling"></i> {language === 'hi' ? 'किस्में (Varieties):' : 'Varieties:'}
                    </strong>
                    <span style={{ color: '#F3F4F6' }}>{crop.varieties}</span>
                  </div>

                  <div>
                    <strong style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <i className="fa-solid fa-map-location-dot"></i> {language === 'hi' ? 'उपयुक्त मिट्टी (Soil):' : 'Suitable Soil:'}
                    </strong>
                    <span>{crop.soil}</span>
                  </div>

                  <div>
                    <strong style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <i className="fa-solid fa-droplet"></i> {language === 'hi' ? 'पानी की आवश्यकता (Water):' : 'Water Requirement:'}
                    </strong>
                    <span>{crop.water}</span>
                  </div>

                  <div>
                    <strong style={{ color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <i className="fa-solid fa-tractor"></i> {language === 'hi' ? 'खेती कैसे करें (How to Grow):' : 'How to Grow:'}
                    </strong>
                    <span style={{ lineHeight: 1.45 }}>{crop.howToGrow}</span>
                  </div>

                  <div>
                    <strong style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <i className="fa-solid fa-shield-virus"></i> {language === 'hi' ? 'रोग व कीट नियंत्रण (Pest Control):' : 'Pest & Disease Control:'}
                    </strong>
                    <span style={{ lineHeight: 1.45 }}>{crop.pestControl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column: Bio-recipes */}
          <div className="krishi-card fade-in-up delay-1" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              <i className="fa-solid fa-jar" style={{ color: '#10B981', marginRight: '0.5rem' }}></i>
              {language === 'hi' ? 'प्राकृतिक कीटनाशक एवं खाद बनाने की विधि' : 'Bio-chemical Formulations'}
            </h3>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {Object.keys(recipes).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveRecipe(key)}
                  style={{
                    padding: '0.5rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    background: activeRecipe === key ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: activeRecipe === key ? '#10B981' : '#9CA3AF',
                    border: `1px solid ${activeRecipe === key ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {recipes[key].title}
                </button>
              ))}
            </div>

            {/* Recipe Content */}
            <div style={{ flex: 1, background: 'rgba(3, 7, 18, 0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{recipes[activeRecipe].title}</h4>
              <p style={{ color: '#9CA3AF', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>{recipes[activeRecipe].desc}</p>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#10B981', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>{language === 'hi' ? 'आवश्यक सामग्री:' : 'Ingredients Required:'}</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: '0', fontSize: '0.82rem', color: '#D1D5DB', lineHeight: 1.6 }}>
                  {recipes[activeRecipe].ingredients.map((ing: string, i: number) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong style={{ color: '#10B981', fontSize: '0.82rem', display: 'block', marginBottom: '0.4rem' }}>{language === 'hi' ? 'बनाने की चरण-दर-चरण विधि:' : 'Step-by-Step Method:'}</strong>
                <ol style={{ paddingLeft: '1.2rem', margin: '0', fontSize: '0.82rem', color: '#D1D5DB', lineHeight: 1.6 }}>
                  {recipes[activeRecipe].steps.map((step: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column: Compost Calculator */}
          <div className="krishi-card fade-in-up delay-1" style={{ borderLeft: '3px solid #3B82F6' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              <i className="fa-solid fa-calculator" style={{ color: '#3B82F6', marginRight: '0.5rem' }}></i>
              {language === 'hi' ? 'जैविक उर्वरक आवश्यकता कैलकुलेटर' : 'Organic Fertilizer Calculator'}
            </h3>
            
            <form onSubmit={handleCalculate}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#3B82F6' }}>{language === 'hi' ? 'फसल की श्रेणी' : 'Crop Category'}</label>
                <select className="krishi-input" value={cropType} onChange={(e) => setCropType(e.target.value)}>
                  <option value="cereals">{language === 'hi' ? 'अनाज / दलहन (Grains/Pulses)' : 'Grains / Cereals'}</option>
                  <option value="vegetables">{language === 'hi' ? 'सब्जियां / बागवानी (Vegetables/Horticulture)' : 'Vegetables / Horticulture'}</option>
                  <option value="cash">{language === 'hi' ? 'नकदी फसलें (गन्ना, कपास आदि)' : 'Cash Crops (Sugarcane, Cotton)'}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#3B82F6' }}>{language === 'hi' ? 'खेत का क्षेत्रफल (एकड़ में)' : 'Farm Area (in Acres)'}</label>
                <input
                  type="number"
                  className="krishi-input"
                  placeholder={language === 'hi' ? 'जैसे: 2 एकड़' : 'e.g. 2 Acres'}
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>

              <button type="submit" className="btn-krishi-primary full-btn" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> {language === 'hi' ? 'आवश्यकता की गणना करें' : 'Calculate Requirements'}
              </button>
            </form>

            {/* Results Grid */}
            {calcResult && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>{language === 'hi' ? 'अनुशंसित जैविक खुराक (एक फसल चक्र):' : 'Recommended Organic Dosage:'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'गोबर खाद (Compost)' : 'Farm Compost'}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10B981', display: 'block', marginTop: '0.2rem' }}>{calcResult.compost} {language === 'hi' ? 'टन' : 'Tons'}</strong>
                  </div>
                  <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'केंचुआ खाद (Vermicompost)' : 'Vermicompost'}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10B981', display: 'block', marginTop: '0.2rem' }}>{calcResult.vermicompost} {language === 'hi' ? 'टन' : 'Tons'}</strong>
                  </div>
                  <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'नीम केक खाद (Neem Cake)' : 'Neem Cake'}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10B981', display: 'block', marginTop: '0.2rem' }}>{calcResult.neemCake} {language === 'hi' ? 'किग्रा' : 'kg'}</strong>
                  </div>
                  <div style={{ background: 'rgba(3, 7, 18, 0.3)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'block' }}>{language === 'hi' ? 'जीवामृत स्प्रे जरूरत' : 'Jeevamrutha Requirement'}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10B981', display: 'block', marginTop: '0.2rem' }}>{calcResult.jeevamrutha} {language === 'hi' ? 'लीटर' : 'Liters'}</strong>
                  </div>
                </div>
                <small style={{ display: 'block', color: '#9CA3AF', fontSize: '0.7rem', marginTop: '0.75rem', lineHeight: 1.4 }}>
                  {language === 'hi' 
                    ? '* यह एक मानक सिफारिश है। बेहतर नतीजों के लिए जीवामृत 15-20 दिनों के अंतराल पर फसल चक्र में डालते रहें।'
                    : '* Standard recommendations. Spray Jeevamrutha at 15-20 days intervals for optimal microbial activity.'}
                </small>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
