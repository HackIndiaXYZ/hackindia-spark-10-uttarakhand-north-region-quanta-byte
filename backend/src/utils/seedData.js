const MarketPrice = require('../models/MarketPrice');
const Scheme = require('../models/Scheme');
const Machinery = require('../models/Machinery');
const Alert = require('../models/Alert');

const SEED_MARKET_PRICES = [
  { crop_name: "गेहूं", emoji: "🌾", market: "Lucknow", state: "Uttar Pradesh", price: 2150.0, min_price: 2100.0, max_price: 2200.0, msp: 2275.0, change_percent: 3.0, is_best: false },
  { crop_name: "धान", emoji: "🌾", market: "Patna", state: "Bihar", price: 2050.0, min_price: 2000.0, max_price: 2100.0, msp: 2183.0, change_percent: -1.0, is_best: false },
  { crop_name: "मक्का", emoji: "🌽", market: "Bhopal", state: "Madhya Pradesh", price: 1850.0, min_price: 1800.0, max_price: 1920.0, msp: 1962.0, change_percent: 5.0, is_best: true },
  { crop_name: "सरसों", emoji: "🌻", market: "Jaipur", state: "Rajasthan", price: 5200.0, min_price: 5100.0, max_price: 5400.0, msp: 5650.0, change_percent: 2.0, is_best: false },
  { crop_name: "चना", emoji: "🟡", market: "Indore", state: "Madhya Pradesh", price: 5100.0, min_price: 5000.0, max_price: 5250.0, msp: 5440.0, change_percent: -2.0, is_best: false },
  { crop_name: "प्याज", emoji: "🧅", market: "Nasik", state: "Maharashtra", price: 1200.0, min_price: 1100.0, max_price: 1350.0, msp: 0.0, change_percent: 8.0, is_best: false }
];

const SEED_SCHEMES = [
  {
    category: "financial",
    name: "PM Kisan Samman Nidhi",
    description: "₹6,000 प्रति वर्ष, तीन किस्तों में सभी पात्र भूमिधारक किसान परिवारों को प्रत्यक्ष वित्तीय सहायता प्रदान करने के लिए केंद्र सरकार की योजना।",
    benefit: "₹6,000/साल",
    apply_url: "https://pmkisan.gov.in"
  },
  {
    category: "insurance",
    name: "PM Fasal Bima Yojana",
    description: "प्राकृतिक आपदाओं, कीटों और रोगों के कारण फसलों के नुकसान पर वित्तीय सुरक्षा सुनिश्चित करने के लिए न्यूनतम प्रीमियम पर व्यापक फसल बीमा प्रदान करती है।",
    benefit: "फसल सुरक्षा (बीमा)",
    apply_url: "https://pmfby.gov.in"
  },
  {
    category: "organic",
    name: "Paramparagat Krishi Vikas Yojana",
    description: "जैविक खेती को बढ़ावा देने के लिए प्रति हेक्टेयर ₹50,000 की वित्तीय सहायता दी जाती है, जिसमें से 60% जैविक इनपुट (बीज, खाद) के लिए सीधा लाभ है।",
    benefit: "₹50,000/हेक्टेयर",
    apply_url: "https://pgsindia-ncof.gov.in/pkvy"
  },
  {
    category: "technology",
    name: "कृषि यंत्रीकरण योजना (Sub-Mission on Agricultural Mechanization)",
    description: "किसानों को ट्रैक्टर, रोटावेटर, कल्टीवेटर और अन्य आधुनिक कृषि यंत्र खरीदने पर 40% से 80% तक की भारी सब्सिडी प्रदान की जाती है।",
    benefit: "50% तक सब्सिडी",
    apply_url: "https://agrimachinery.nic.in"
  },
  {
    category: "financial",
    name: "Kisan Credit Card (KCC)",
    description: "किसानों को अपनी खेती और घरेलू आवश्यकताओं को पूरा करने के लिए केवल 4% प्रभावी वार्षिक ब्याज दर पर ₹3 लाख तक का आसान ऋण प्रदान किया जाता है।",
    benefit: "सिर्फ 4% ब्याज ऋण",
    apply_url: "https://www.sbi.co.in/web/personal-banking/loans/agriculture-loans/kisan-credit-card"
  },
  {
    category: "organic",
    name: "National Horticulture Mission",
    description: "फलों, सब्जियों, मसालों और फूलों की आधुनिक वैज्ञानिक बागवानी को अपनाने के लिए किसानों को गुणवत्तापूर्ण पौध और सब्सिडी दी जाती है।",
    benefit: "बागवानी विशेष अनुदान",
    apply_url: "https://midh.gov.in"
  }
];

const SEED_MACHINERY = [
  {
    name: "महिंद्रा 575 DI ट्रैक्टर (Mahindra Tractor)",
    type: "ट्रैक्टर",
    location: "रामपुर, वाराणसी",
    rating: 4.8,
    price_per_day: 1500.0,
    owner_name: "राजेश कुमार",
    mobile: "9876543201",
    available: true,
    image_url: ""
  },
  {
    name: "जॉन डीयर कंबाइन हार्वेस्टर (John Deere Harvester)",
    type: "हार्वेस्टर",
    location: "ज्ञानपुर, भदोही",
    rating: 4.9,
    price_per_day: 5000.0,
    owner_name: "बलबीर सिंह",
    mobile: "9876543202",
    available: true,
    image_url: ""
  },
  {
    name: "सोनालिका रोटावेटर 6 फीट (Sonalika Rotavator)",
    type: "रोटावेटर",
    location: "कपसेठी, वाराणसी",
    rating: 4.6,
    price_per_day: 800.0,
    owner_name: "महेंद्र यादव",
    mobile: "9876543203",
    available: true,
    image_url: ""
  },
  {
    name: "पावर स्प्रेयर 50 लीटर (Power Sprayer)",
    type: "स्प्रेयर",
    location: "मिर्जामुराद, वाराणसी",
    rating: 4.5,
    price_per_day: 300.0,
    owner_name: "रमेश पटेल",
    mobile: "9876543204",
    available: false,
    image_url: ""
  }
];

const SEED_ALERTS = [
  {
    type: "danger",
    title: "🐛 कीट अलर्ट — टिड्डी दल",
    message: "पूर्वी उत्तर प्रदेश के वाराणसी और आसपास के जिलों में टिड्डी दल की भारी सक्रियता देखी गई है। शाम के समय खेतों में तेज़ आवाज़ करें या कीटनाशक का छिड़काव करें।",
    time_label: "2 घंटे पहले",
    area: "पूर्वी UP"
  },
  {
    type: "warning",
    title: "🌧️ भारी बारिश की चेतावनी",
    message: "मौसम विभाग द्वारा अगले 48 घंटों में भारी गरज के साथ तेज बारिश की चेतावनी जारी की गई है। कृपया कटी हुई फसल को ऊंचे और सुरक्षित स्थान पर ले जाएं, सिंचाई और खाद छिड़काव तुरंत रोक दें।",
    time_label: "5 घंटे पहले",
    area: "UP, Bihar"
  },
  {
    type: "info",
    title: "💰 PM Kisan नई किस्त जारी",
    message: "प्रधानमंत्री किसान सम्मान निधि (PM Kisan) की 16वीं किस्त सभी पंजीकृत बैंक खातों में ट्रांसफर कर दी गई है। कृपया अपना बैंक बैलेंस चेक करें या सीएससी केंद्र पर जाकर स्टेटस देखें।",
    time_label: "1 दिन पहले",
    area: "राष्ट्रीय"
  }
];

const seedDatabase = async () => {
  try {
    const priceCount = await MarketPrice.countDocuments();
    if (priceCount === 0) {
      await MarketPrice.insertMany(SEED_MARKET_PRICES);
      console.log('Seeded MarketPrices');
    }

    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      await Scheme.insertMany(SEED_SCHEMES);
      console.log('Seeded Schemes');
    }

    const machineryCount = await Machinery.countDocuments();
    if (machineryCount === 0) {
      await Machinery.insertMany(SEED_MACHINERY);
      console.log('Seeded Machinery');
    }

    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      await Alert.insertMany(SEED_ALERTS);
      console.log('Seeded Alerts');
    }
  } catch (err) {
    console.error('Seed database error:', err);
  }
};

module.exports = seedDatabase;
