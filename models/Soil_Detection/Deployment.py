# ======================================
# 🌾 SMART SOIL + CROP ADVISORY SYSTEM (FINAL VERSION)
# ======================================

from tensorflow import keras
from tensorflow.keras.preprocessing import image
import numpy as np

# ===== 1️⃣ Load Model =====
model = keras.models.load_model(r"C:\\Users\\pintu\\OneDrive\\Desktop\\INVERTHON PROJECT\\krishi_ai_system\\models\\Soil_Type_Detection\\soil_final_model.h5")

# ===== 2️⃣ SAME TRAINING ORDER =====
class_names = [
    "Alluvial","Arid","Black","Clay","Dry","Laterite",
    "Loamy","Peat","Red","Sandy","Sandy_loam","Yellow"
]

# ===== 3️⃣ Soil Wise Crop Suggestions =====
soil_crop_map = {
    "Alluvial": ["गेहूँ","चावल","गन्ना","मक्का","आलू"],
    "Arid": ["बाजरा","चना","ज्वार","मक्का","गेहूँ"],
    "Black": ["कपास","सोयाबीन","गेहूँ","गन्ना","मक्का"],
    "Clay": ["चावल","गेहूँ","गन्ना","सोयाबीन","मक्का"],
    "Dry": ["बाजरा","चना","ज्वार","मक्का","गेहूँ"],
    "Laterite": ["चाय","नारियल","काजू","मक्का","बाजरा"],
    "Loamy": ["गेहूँ","चावल","टमाटर","गन्ना","मक्का"],
    "Peat": ["चावल","सब्जियाँ","आलू","गन्ना","टमाटर"],
    "Red": ["मूंगफली","बाजरा","मक्का","गेहूँ","आलू"],
    "Sandy": ["तरबूज","मूंगफली","बाजरा","गाजर","मक्का"],
    "Sandy_loam": ["गेहूँ","मक्का","चावल","टमाटर","आलू"],
    "Yellow": ["मक्का","बाजरा","सोयाबीन","गेहूँ","आलू"]
}

# ===== 4️⃣ Soil Specific Issues & Treatments =====
soil_data = {
"Alluvial":{
"issues":[
"❗ लगातार खेती से नाइट्रोजन व जिंक की कमी",
"❗ अत्यधिक सिंचाई से उर्वरता कम होना",
"❗ जैविक पदार्थ घट जाना"
],
"treatments":[
"✔️ खेत का आकार देखें: 1 एकड़ के लिए 45 किलो यूरिया पहली सिंचाई में डालें।",
"✔️ 10 किलो जिंक सल्फेट खेत में मिलाएं।",
"✔️ 2–3 टन सड़ी गोबर खाद डालें, खेत के आकार के अनुसार मात्रा बढ़ाएँ।",
"✔️ हर 3 साल में मिट्टी परीक्षण कर पोषक तत्व संतुलित करें।",
"✔️ दलहनी फसल के साथ फसल चक्र अपनाएं।"
]
},

"Black":{
"issues":[
"❗ सूखने पर गहरी दरारें पड़ती हैं",
"❗ वर्षा में जलभराव",
"❗ फॉस्फोरस की कमी"
],
"treatments":[
"✔️ 1 फीट गहरी नाली बनाकर जल निकासी करें ताकि पानी 24 घंटे में निकल जाए।",
"✔️ 50 किलो DAP प्रति एकड़ बुवाई के समय दें।",
"✔️ 2 टन गोबर खाद खेत में डालें।",
"✔️ बारिश के बाद हल्की गुड़ाई करें।",
"✔️ 19:19:19 NPK 1% घोल 20 दिन अंतर से स्प्रे करें।"
]
},

"Clay":{
"issues":[
"❗ मिट्टी भारी व चिपचिपी",
"❗ जड़ों का विकास बाधित",
"❗ पानी रुकने की समस्या"
],
"treatments":[
"✔️ 1–1.5 फीट गहरी नालियां बनाएं ताकि जल निकासी सही हो।",
"✔️ 3 टन जैविक खाद डालें (छोटे खेत 1–1.5 टन)।",
"✔️ साल में एक बार 6–8 इंच गहरी जुताई करें।",
"✔️ 50 किलो DAP प्रति एकड़ डालें।",
"✔️ 1% NPK घोल 15 दिन अंतर से 2 बार स्प्रे करें।"
]
},

"Sandy":{
"issues":[
"❗ पानी तुरंत नीचे चला जाता है",
"❗ पोषक तत्व टिकते नहीं",
"❗ नमी की भारी कमी"
],
"treatments":[
"✔️ हर 3–4 दिन हल्की सिंचाई करें, खेत का आकार अनुसार समय बढ़ाएँ।",
"✔️ 3–4 टन गोबर खाद प्रति एकड़ डालें।",
"✔️ 1 टन वर्मी कम्पोस्ट डालें।",
"✔️ सूखी घास 2 इंच मोटी बिछाएं (मल्चिंग)।",
"✔️ 0.5% जिंक घोल 20 दिन में 2 बार छिड़कें।"
]
},

"Red":{
"issues":[
"❗ नाइट्रोजन की कमी",
"❗ कम जैविक पदार्थ",
"❗ जिंक की कमी"
],
"treatments":[
"✔️ 45 किलो यूरिया प्रति एकड़ डालें।",
"✔️ 2 टन गोबर खाद मिलाएं।",
"✔️ 10 किलो जिंक सल्फेट डालें।",
"✔️ ढैंचा हरी खाद डालें।",
"✔️ 1% 19:19:19 NPK 15 दिन अंतर से स्प्रे करें।"
]
},

"Loamy":{
"issues":[
"❗ लगातार खेती से उर्वरता कम",
"❗ माइक्रोन्यूट्रिएंट की कमी",
"❗ असंतुलित उर्वरक उपयोग"
],
"treatments":[
"✔️ 2 टन गोबर खाद डालें (छोटे खेत 1–1.5 टन)।",
"✔️ NPK 50:25:25 अनुपात में दें।",
"✔️ 10 किलो जिंक सल्फेट डालें।",
"✔️ 2 साल में मिट्टी परीक्षण कर संतुलित पोषक तत्व दें।",
"✔️ फसल चक्र अपनाएं।"
]
},

"Laterite":{
"issues":[
"❗ अम्लीय मिट्टी",
"❗ फॉस्फोरस की कमी",
"❗ कम उत्पादन"
],
"treatments":[
"✔️ 200 किलो चूना प्रति एकड़ डालें।",
"✔️ 50 किलो DAP डालें।",
"✔️ 2 टन जैविक खाद डालें।",
"✔️ दलहनी फसल लगाएं।",
"✔️ 1% NPK स्प्रे करें।"
]
},

"Peat":{
"issues":[
"❗ अत्यधिक नमी",
"❗ जड़ सड़न खतरा",
"❗ अम्लीय प्रकृति"
],
"treatments":[
"✔️ जल निकासी मजबूत करें।",
"✔️ 200 किलो चूना डालें।",
"✔️ 2 टन गोबर खाद डालें।",
"✔️ फफूंदनाशक 2 ग्राम प्रति लीटर घोल छिड़कें।",
"✔️ संतुलित NPK दें।"
]
},

"Dry":{
"issues":[
"❗ नमी की कमी",
"❗ उत्पादन घटता है",
"❗ मिट्टी सख्त होना"
],
"treatments":[
"✔️ ड्रिप सिंचाई 1–1.5 घंटे प्रति एकड़, 2 दिन अंतर से।",
"✔️ मल्चिंग करें।",
"✔️ 2 टन गोबर खाद डालें।",
"✔️ गहरी जुताई करें।",
"✔️ 1% NPK घोल स्प्रे करें।"
]
},

"Sandy_loam":{
"issues":[
"❗ मध्यम नमी समस्या",
"❗ पोषक तत्व धीरे कम होना",
"❗ माइक्रोन्यूट्रिएंट की कमी"
],
"treatments":[
"✔️ 2 टन गोबर खाद डालें।",
"✔️ 50 किलो NPK प्रति एकड़ दें।",
"✔️ 10 किलो जिंक डालें।",
"✔️ हल्की नियमित सिंचाई करें।",
"✔️ फसल चक्र अपनाएं।"
]
},

"Yellow":{
"issues":[
"❗ नाइट्रोजन की कमी",
"❗ कम उर्वरता",
"❗ कमजोर वृद्धि"
],
"treatments":[
"✔️ 45 किलो यूरिया डालें।",
"✔️ 2 टन गोबर खाद मिलाएं।",
"✔️ 10 किलो जिंक डालें।",
"✔️ दलहनी फसल लगाएं।",
"✔️ 1% NPK स्प्रे करें।"
]
},

"Arid":{
"issues":[
"❗ पानी की भारी कमी",
"❗ गर्मी से फसल झुलसना",
"❗ जैविक पदार्थ कम"
],
"treatments":[
"✔️ ड्रिप सिंचाई हल्की 2 घंटे करें।",
"✔️ 3 टन गोबर खाद डालें।",
"✔️ मल्चिंग करें।",
"✔️ सूखा सहनशील बीज लगाएं।",
"✔️ 1% पोटाश घोल 15 दिन अंतर से स्प्रे करें।"
]
}
}

# ===== Input Validation Helper =====
def _is_valid_soil_image(img_array: np.ndarray) -> bool:
    """
    Colour-based pre-check: returns True only if the image likely contains soil.

    Rejects:
      - Very bright images  (white walls, paper, light surfaces)
      - Blue-dominant images (sky, water, indoor backgrounds)
      - Green-dominant images (grass, leaves — not soil)
    """
    img   = img_array[0]            # shape (224, 224, 3), values in [0, 1]
    avg_r = float(np.mean(img[:, :, 0]))
    avg_g = float(np.mean(img[:, :, 1]))
    avg_b = float(np.mean(img[:, :, 2]))
    total = avg_r + avg_g + avg_b + 1e-7

    # Reject very bright images (white/light non-soil surfaces)
    if np.mean(img) > 0.85:
        return False

    # Reject strongly blue-dominant images (sky, water, room walls)
    if avg_b > avg_r * 1.25 and avg_b > avg_g * 1.10:
        return False

    # Reject strongly green-dominant images (grass, vegetation — not soil)
    green_ratio = avg_g / total
    if green_ratio > 0.42 and avg_g > avg_r * 1.15:
        return False

    return True


# ===== Prediction Function =====
CONFIDENCE_THRESHOLD = 0.70   # 70 %

def predict_soil(img_path):
    """
    Returns the predicted soil class name on valid input,
    or None with a printed message for invalid / unclear images.

    Validation layers applied:
      1. Colour pre-check  — rejects obviously non-soil images
      2. Confidence gate   — rejects predictions below 70 % confidence
    """
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # ── Layer 1: colour sanity check ──────────────────────────────────────────
    if not _is_valid_soil_image(img_array):
        print("\n⚠️ Invalid Image: यह मिट्टी की छवि नहीं लगती।")
        print("   Invalid Image or Image not clear. Please upload a proper soil image.")
        return None

    # ── Layer 2: model inference ───────────────────────────────────────────────
    prediction = model.predict(img_array)[0]
    confidence = float(np.max(prediction))
    soil       = class_names[int(np.argmax(prediction))]

    # ── Layer 3: confidence threshold ─────────────────────────────────────────
    if confidence < CONFIDENCE_THRESHOLD:
        print(f"\n⚠️ Low confidence ({confidence*100:.1f}%) — image may not be soil or is unclear.")
        print("   Invalid Image or Image not clear. Please upload a proper soil image.")
        return None

    print(f"\n🌱 आपकी मिट्टी का प्रकार है: {soil} (विश्वास: {confidence*100:.2f}%)")
    return soil

# ===== Questions =====
def ask_questions():
    print("\nकृपया नीचे दिए गए सवालों का जवाब हाँ या ना में दें:\n")
    q1 = input("1️⃣ क्या खेत में पानी जमा रहता है? (हाँ/ना): ").lower()
    q2 = input("2️⃣ क्या मिट्टी जल्दी सूख जाती है? (हाँ/ना): ").lower()
    q3 = input("3️⃣ क्या फसल पीली पड़ रही है? (हाँ/ना): ").lower()
    q4 = input("4️⃣ क्या फसल धीमी गति से बढ़ रही है? (हाँ/ना): ").lower()
    q5 = input("5️⃣ क्या मिट्टी सख्त हो गई है? (हाँ/ना): ").lower()
    return [q1,q2,q3,q4,q5]

# ===== Report Generator =====
def generate_report(soil, answers):

    issues = soil_data[soil]["issues"][:]
    treatments = soil_data[soil]["treatments"][:]

    if answers[0] in ["हाँ","yes"]:
        issues.append("❗ खेत में जलभराव की अतिरिक्त समस्या")
        treatments.append("✔️ 1 फीट गहरी नाली बनाएं ताकि पानी 24 घंटे में निकल जाए।")

    if answers[1] in ["हाँ","yes"]:
        issues.append("❗ मिट्टी में नमी की भारी कमी")
        treatments.append("✔️ 2–3 दिन के अंतर से हल्की सिंचाई करें (1–1.5 घंटे प्रति एकड़)।")

    if answers[2] in ["हाँ","yes"]:
        issues.append("❗ नाइट्रोजन या जिंक की कमी")
        treatments.append("✔️ 0.5% जिंक सल्फेट घोल 15 दिन अंतर से 2 बार स्प्रे करें।")

    if answers[3] in ["हाँ","yes"]:
        issues.append("❗ पौध वृद्धि धीमी")
        treatments.append("✔️ 19:19:19 10 ग्राम प्रति लीटर पानी में घोलकर छिड़काव करें।")

    if answers[4] in ["हाँ","yes"]:
        issues.append("❗ मिट्टी कठोर हो गई है")
        treatments.append("✔️ रोटावेटर से 6–8 इंच गहरी जुताई करें।")

    print("\n==============================")
    print("📋🌾 मिट्टी परिचय और कृषि सलाह")
    print("==============================")

    print("\n🌾 इस मिट्टी के लिए संभावित फसलें:")
    for crop in soil_crop_map[soil]:
        print("✅", crop)

    print("\n==============================")
    print("⚠️ संभावित समस्याएं:")
    print("==============================")
    for i in issues[:3]:
        print(i)

    print("\n==============================")
    print("🛠️ समाधान ")
    print("==============================")
    for t in treatments[:5]:
        print(t)

# ===== MAIN =====
if __name__ == "__main__":

    path = input("\n📷 मिट्टी की फोटो का path डालें: ").strip().replace('"','')
    soil = predict_soil(path)  # predict function call

    if soil is None:
        print("\n⚠️ Advisory report generate nahi ki jaa sakti, image soil nahi lag rahi ya unclear hai.")
    else:
        answers = ask_questions()
        generate_report(soil, answers)