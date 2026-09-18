import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import sys

# ==========================
# Load Trained Model
# ==========================
MODEL_PATH = "C:\\Users\\pintu\\OneDrive\\Desktop\\INVERTHON PROJECT\\krishi_ai_system\\models\\Crop_Disease_Detection\\crop_disease_model.h5"   # <-- apna model file path
model = tf.keras.models.load_model(MODEL_PATH)

# ==========================
# Class Labels (Exact order same hona chahiye training ke time wala)
# ==========================
class_names = list(model.output_names) if False else ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___healthy', 'Corn_(maize)___Northern_Leaf_Blight', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___healthy', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'PESGL_DRECRO_exserohilum_rostratum', 'PESGL_healthy_leaves', 'PESGL_MOESBU_smut', 'PESGL_SCLPGR_Sclerospora_graminicola', 'Potato___Early_blight', 'Potato___healthy', 'Potato___Late_blight', 'Raspberry___healthy', 'Rice_Blast', 'Rice_Healthy', 'Rice_Insect', 'Rice_Leaffolder', 'Rice_Leaf_Scald', 'Rice_Stripes', 'Rice_Tungro', 'Rice_wali', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___healthy', 'Strawberry___Leaf_scorch', 'Sugarcane_Banded_Chlorosis', 'Sugarcane_BrownRust', 'Sugarcane_Brown_Spot', 'Sugarcane_Dried_Leaves', 'Sugarcane_Grassy_shoot', 'Sugarcane_Healthy_Leaves', 'Sugarcane_Pokkah_Boeng', 'Sugarcane_Sett_Rot', 'Sugarcane_smut', 'Sugarcane_Viral_Disease', 'Sugarcane_Yellow_Leaf', 'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___healthy', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_mosaic_virus', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Wheat_Aphid', 'Wheat_Black_Rust', 'Wheat_Blast', 'Wheat_Brown_Rust', 'Wheat_Common_Root_Rot', 'Wheat_Fusarium_Head_Blight', 'Wheat_Healthy', 'Wheat_Healthy_2', 'Wheat_Leaf_Blight', 'Wheat_Mildew', 'Wheat_Mite', 'Wheat_Septoria', 'Wheat_Stem_fly', 'Wheat_Tan_spot', 'Wheat_Yellow_Rust']  # ---- YAHAN APNI EXACT TRAINING CLASS LIST PASTE KARO ----

# ==========================
# TREATMENT DICTIONARY
# ==========================

treatment_dict = {# =========================
# 🍎 APPLE
# =========================

'Apple___Apple_scab': """1️⃣ पत्तियों पर काले धब्बे दिखते ही पहचान करें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर पानी में घोलकर छिड़काव करें।
3️⃣ 7–10 दिन बाद दोबारा स्प्रे करें।
4️⃣ गिरी हुई संक्रमित पत्तियाँ इकट्ठा कर नष्ट करें।
5️⃣ बगीचे में हवा का अच्छा प्रवाह बनाए रखें।""",

'Apple___Black_rot': """1️⃣ संक्रमित फल और टहनियाँ तुरंत काटकर जला दें।
2️⃣ Copper Oxychloride 3 ग्राम प्रति लीटर पानी में छिड़कें।
3️⃣ खेत में सफाई और स्वच्छता रखें।
4️⃣ सिंचाई नियंत्रित रखें, अधिक नमी न होने दें।
5️⃣ 10 दिन बाद आवश्यकता अनुसार दोहराएँ।""",

'Apple___Cedar_apple_rust': """1️⃣ पत्तियों पर नारंगी जंग जैसे धब्बे पहचानें।
2️⃣ Propiconazole 1 मिली प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटा दें।
4️⃣ आसपास के जंगली मेजबान पौधे हटाएँ।
5️⃣ 10 दिन बाद दोबारा उपचार करें।""",

'Apple___healthy': """1️⃣ फसल पूर्णतः स्वस्थ है।
2️⃣ किसी रोग का लक्षण नहीं पाया गया।
3️⃣ संतुलित उर्वरक का प्रयोग करें।
4️⃣ नियमित निरीक्षण करते रहें।
5️⃣ उचित सिंचाई और सफाई बनाए रखें।""",

# =========================
# 🍒 CHERRY
# =========================

'Cherry_(including_sour)___healthy': """1️⃣ पौधा स्वस्थ है।
2️⃣ कोई रोग लक्षण नहीं मिला।
3️⃣ संतुलित खाद दें।
4️⃣ समय पर सिंचाई करें।
5️⃣ नियमित निगरानी जारी रखें।""",

'Cherry_(including_sour)___Powdery_mildew': """1️⃣ पत्तियों पर सफेद चूर्ण जैसा दिखे तो पहचानें।
2️⃣ Sulfur 2 ग्राम प्रति लीटर पानी में घोलकर स्प्रे करें।
3️⃣ 7 दिन बाद दोहराएँ।
4️⃣ संक्रमित पत्तियाँ हटाएँ।
5️⃣ खेत में नमी कम रखें।""",

# =========================
# 🌽 CORN
# =========================

'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': """1️⃣ पत्तियों पर भूरे लंबे धब्बे दिखें तो पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ 7–10 दिन बाद दोहराएँ।
4️⃣ फसल अवशेष नष्ट करें।
5️⃣ संतुलित नाइट्रोजन का प्रयोग करें।""",

'Corn_(maize)___Common_rust_': """1️⃣ पत्तियों पर जंग जैसे उभरे धब्बे देखें।
2️⃣ Propiconazole 1 मिली प्रति लीटर छिड़कें।
3️⃣ 10 दिन बाद पुनः स्प्रे करें।
4️⃣ रोगग्रस्त पत्तियाँ हटाएँ।
5️⃣ खेत में उचित दूरी रखें।""",

'Corn_(maize)___healthy': """1️⃣ फसल स्वस्थ है।
2️⃣ कोई उपचार आवश्यक नहीं।
3️⃣ संतुलित उर्वरक दें।
4️⃣ नियमित निरीक्षण रखें।
5️⃣ उचित जल प्रबंधन करें।""",

'Corn_(maize)___Northern_Leaf_Blight': """1️⃣ पत्तियों पर बड़े धब्बे दिखें तो पहचानें।
2️⃣ Mancozeb 2–3 ग्राम प्रति लीटर छिड़कें।
3️⃣ 7 दिन बाद दोहराएँ।
4️⃣ संक्रमित पत्तियाँ नष्ट करें।
5️⃣ संतुलित खाद और सिंचाई रखें।""",

# =========================
# 🍇 GRAPE
# =========================

'Grape___Black_rot': """1️⃣ फल और पत्तियों पर काले धब्बे दिखें तो पहचानें।
2️⃣ Carbendazim 1 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित गुच्छे हटा दें।
4️⃣ 10 दिन बाद दोहराएँ।
5️⃣ बेलों की छंटाई और सफाई रखें।""",

'Grape___Esca_(Black_Measles)': """1️⃣ पत्तियों पर काले धब्बे और सूखापन देखें।
2️⃣ प्रभावित टहनियाँ काटें।
3️⃣ Copper आधारित दवा का छिड़काव करें।
4️⃣ पौधों को संतुलित पोषण दें।
5️⃣ नियमित निगरानी रखें।""",

'Grape___healthy': """1️⃣ बेल स्वस्थ है।
2️⃣ रोग के कोई लक्षण नहीं।
3️⃣ संतुलित खाद दें।
4️⃣ छंटाई समय पर करें।
5️⃣ नियमित निरीक्षण रखें।""",

'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': """1️⃣ पत्तियों पर छोटे भूरे धब्बे दिखें।
2️⃣ Mancozeb 2 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ 7–10 दिन बाद दोहराएँ।
5️⃣ बेलों में वायु संचार बनाए रखें।""",

# =========================
# 🍊 ORANGE
# =========================

'Orange___Haunglongbing_(Citrus_greening)': """1️⃣ पत्तियाँ पीली और टेढ़ी दिखें तो पहचानें।
2️⃣ संक्रमित पौधा उखाड़कर नष्ट करें।
3️⃣ Imidacloprid 0.5 मिली प्रति लीटर छिड़कें।
4️⃣ स्वस्थ पौध सामग्री का उपयोग करें।
5️⃣ कीट नियंत्रण और नियमित निरीक्षण करें।""",


# =========================
# 🍑 PEACH
# =========================

'Peach___Bacterial_spot': """1️⃣ पत्तियों और फलों पर छोटे काले धब्बे दिखें तो पहचानें।
2️⃣ Copper Oxychloride 3 ग्राम प्रति लीटर पानी में छिड़कें।
3️⃣ संक्रमित पत्तियाँ और फल हटा दें।
4️⃣ अधिक नमी से बचाव करें।
5️⃣ 7–10 दिन बाद आवश्यकता अनुसार दोहराएँ।""",

'Peach___healthy': """1️⃣ पौधा पूर्णतः स्वस्थ है।
2️⃣ किसी रोग का लक्षण नहीं मिला।
3️⃣ संतुलित खाद और सिंचाई दें।
4️⃣ नियमित निरीक्षण जारी रखें।
5️⃣ बगीचे की साफ-सफाई बनाए रखें।""",

# =========================
# 🌶 PEPPER (Bell)
# =========================

'Pepper,_bell___Bacterial_spot': """1️⃣ पत्तियों पर पानी जैसे धब्बे दिखें तो पहचान करें।
2️⃣ Copper आधारित दवा 3 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटा दें।
4️⃣ खेत में जल जमाव न होने दें।
5️⃣ 7 दिन बाद दोबारा स्प्रे करें।""",

'Pepper,_bell___healthy': """1️⃣ पौधा स्वस्थ है।
2️⃣ रोग का कोई लक्षण नहीं।
3️⃣ संतुलित उर्वरक का प्रयोग करें।
4️⃣ समय पर सिंचाई करें।
5️⃣ नियमित निगरानी बनाए रखें।""",

# =========================
# 🌾 PESGL (Millet Type)
# =========================

'PESGL_DRECRO_exserohilum_rostratum': """1️⃣ पत्तियों पर भूरे लम्बे धब्बे पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ नष्ट करें।
4️⃣ 7–10 दिन बाद दोहराएँ।
5️⃣ संतुलित खाद का प्रयोग करें।""",

'PESGL_healthy_leaves': """1️⃣ फसल स्वस्थ है।
2️⃣ कोई रोग लक्षण नहीं।
3️⃣ संतुलित पोषण दें।
4️⃣ नियमित निरीक्षण रखें।
5️⃣ उचित सिंचाई प्रबंधन करें।""",

'PESGL_MOESBU_smut': """1️⃣ बालियों पर काले पाउडर जैसे दाने दिखें तो पहचानें।
2️⃣ संक्रमित पौधों को हटाकर नष्ट करें।
3️⃣ बीज उपचार Carbendazim से करें।
4️⃣ खेत की सफाई रखें।
5️⃣ अगली बुवाई में प्रमाणित बीज का प्रयोग करें।""",

'PESGL_SCLPGR_Sclerospora_graminicola': """1️⃣ पत्तियाँ पीली और मुड़ी हुई दिखें तो पहचानें।
2️⃣ Metalaxyl 2 ग्राम प्रति किलो बीज उपचार करें।
3️⃣ संक्रमित पौधे हटाएँ।
4️⃣ जल निकासी अच्छी रखें।
5️⃣ रोग प्रतिरोधी किस्में अपनाएँ।""",

# =========================
# 🥔 POTATO
# =========================

'Potato___Early_blight': """1️⃣ पत्तियों पर गोल भूरे धब्बे पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ 7 दिन बाद दोहराएँ।
4️⃣ संक्रमित पत्तियाँ हटाएँ।
5️⃣ संतुलित नाइट्रोजन दें।""",

'Potato___Late_blight': """1️⃣ पत्तियाँ काली पड़कर सड़ने लगें तो पहचानें।
2️⃣ Metalaxyl + Mancozeb मिश्रण छिड़कें।
3️⃣ 5–7 दिन बाद दोहराएँ।
4️⃣ खेत में जल जमाव न होने दें।
5️⃣ संक्रमित पौधे नष्ट करें।""",

'Potato___healthy': """1️⃣ फसल स्वस्थ है।
2️⃣ रोग के लक्षण नहीं हैं।
3️⃣ संतुलित खाद दें।
4️⃣ उचित सिंचाई करें।
5️⃣ नियमित निरीक्षण रखें।""",

# =========================
# 🌾 RICE
# =========================

'Rice_Blast': """1️⃣ पत्तियों पर हीरे जैसे धब्बे दिखें तो पहचानें।
2️⃣ Tricyclazole 1 ग्राम प्रति लीटर छिड़कें।
3️⃣ 7 दिन बाद दोहराएँ।
4️⃣ नाइट्रोजन संतुलित रखें।
5️⃣ संक्रमित पौध अवशेष नष्ट करें।""",

'Rice_Healthy': """1️⃣ फसल स्वस्थ है।
2️⃣ रोग का कोई लक्षण नहीं।
3️⃣ संतुलित उर्वरक दें।
4️⃣ जल प्रबंधन ठीक रखें।
5️⃣ नियमित निगरानी करें।""",

'Rice_Insect': """1️⃣ पत्तियों में छेद या कीट दिखें तो पहचानें।
2️⃣ Imidacloprid 0.5 मिली प्रति लीटर छिड़कें।
3️⃣ सुबह या शाम स्प्रे करें।
4️⃣ 7 दिन बाद आवश्यकता अनुसार दोहराएँ।
5️⃣ खेत की सफाई रखें।""",

'Rice_Leaffolder': """1️⃣ पत्तियाँ मुड़ी हुई दिखें तो पहचानें।
2️⃣ Chlorantraniliprole 0.4 मिली प्रति लीटर छिड़कें।
3️⃣ 7 दिन बाद दोहराएँ।
4️⃣ कीटग्रस्त पत्तियाँ हटाएँ।
5️⃣ नियमित निरीक्षण रखें।""",

'Rice_Leaf_Scald': """1️⃣ पत्तियों पर भूरे किनारे दिखें तो पहचानें।
2️⃣ Mancozeb 2 ग्राम प्रति लीटर छिड़कें।
3️⃣ संतुलित नाइट्रोजन दें।
4️⃣ जल निकासी सही रखें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Rice_Stripes': """1️⃣ पत्तियों पर पीली धारियाँ दिखें।
2️⃣ संक्रमित पौधे हटाएँ।
3️⃣ कीट नियंत्रण करें।
4️⃣ स्वस्थ बीज का प्रयोग करें।
5️⃣ नियमित निगरानी रखें।""",

'Rice_Tungro': """1️⃣ पौधे पीले और छोटे दिखें तो पहचानें।
2️⃣ संक्रमित पौधे उखाड़कर नष्ट करें।
3️⃣ Imidacloprid छिड़कें।
4️⃣ कीट नियंत्रण करें।
5️⃣ स्वस्थ रोपाई अपनाएँ।""",

'Rice_wali': """1️⃣ पत्तियाँ मुड़कर सूखें तो पहचानें।
2️⃣ कीटनाशक का छिड़काव करें।
3️⃣ खेत में सफाई रखें।
4️⃣ संतुलित खाद दें।
5️⃣ नियमित निरीक्षण करें।""",

# =========================
# 🌱 SOYBEAN
# =========================

'Soybean___healthy': """1️⃣ फसल स्वस्थ है।
2️⃣ रोग का कोई लक्षण नहीं।
3️⃣ संतुलित उर्वरक दें।
4️⃣ उचित सिंचाई करें।
5️⃣ नियमित निगरानी रखें।""",


# =========================
# 🎃 SQUASH
# =========================

'Squash___Powdery_mildew': """1️⃣ पत्तियों पर सफेद चूर्ण जैसा दिखाई दे तो पहचानें।
2️⃣ Sulphur 2 ग्राम प्रति लीटर पानी में छिड़कें।
3️⃣ 7 दिन बाद आवश्यकता अनुसार दोहराएँ।
4️⃣ खेत में हवा का अच्छा प्रवाह रखें।
5️⃣ अधिक नमी से बचाव करें।""",


# =========================
# 🍓 STRAWBERRY
# =========================

'Strawberry___Leaf_scorch': """1️⃣ पत्तियों के किनारे भूरे व सूखे दिखें तो पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाकर नष्ट करें।
4️⃣ खेत में जल जमाव न होने दें।
5️⃣ 7–10 दिन बाद दोहराएँ।""",

'Strawberry___healthy': """1️⃣ पौधा पूर्णतः स्वस्थ है।
2️⃣ किसी रोग का लक्षण नहीं मिला।
3️⃣ संतुलित खाद और सिंचाई करें।
4️⃣ नियमित निरीक्षण बनाए रखें।
5️⃣ खेत की साफ-सफाई रखें।""",


# =========================
# 🌿 SUGARCANE
# =========================

'Sugarcane_Banded_Chlorosis': """1️⃣ पत्तियों पर पीली धारियाँ दिखें तो पहचानें।
2️⃣ जिंक सल्फेट 5 ग्राम प्रति लीटर छिड़कें।
3️⃣ मिट्टी की जाँच कराएँ।
4️⃣ संतुलित नाइट्रोजन दें।
5️⃣ सिंचाई प्रबंधन सही रखें।""",

'Sugarcane_BrownRust': """1️⃣ पत्तियों पर भूरे जंग जैसे धब्बे दिखें।
2️⃣ Propiconazole 1 मिली प्रति लीटर छिड़कें।
3️⃣ 10 दिन बाद दोहराएँ।
4️⃣ संक्रमित पत्तियाँ हटाएँ।
5️⃣ संतुलित खाद दें।""",

'Sugarcane_Brown_Spot': """1️⃣ पत्तियों पर छोटे भूरे धब्बे पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ खेत साफ रखें।
4️⃣ अधिक नमी से बचाव करें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Sugarcane_Dried_Leaves': """1️⃣ पत्तियाँ सूखती दिखें तो कारण जाँचें।
2️⃣ उचित सिंचाई करें।
3️⃣ संतुलित उर्वरक दें।
4️⃣ रोग या कीट की जांच करें।
5️⃣ आवश्यकता अनुसार उपचार करें।""",

'Sugarcane_Grassy_shoot': """1️⃣ पौधा घास जैसा पतला दिखे तो पहचानें।
2️⃣ संक्रमित पौधा उखाड़कर नष्ट करें।
3️⃣ स्वस्थ सेट का उपयोग करें।
4️⃣ कीट नियंत्रण करें।
5️⃣ नियमित निरीक्षण रखें।""",

'Sugarcane_Healthy_Leaves': """1️⃣ फसल स्वस्थ है।
2️⃣ कोई रोग लक्षण नहीं।
3️⃣ संतुलित पोषण दें।
4️⃣ सिंचाई सही रखें।
5️⃣ नियमित निगरानी जारी रखें।""",

'Sugarcane_Pokkah_Boeng': """1️⃣ पत्तियाँ मुड़कर सड़ती दिखें तो पहचानें।
2️⃣ Carbendazim 1 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ संतुलित खाद दें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Sugarcane_Sett_Rot': """1️⃣ बीज (सेट) सड़ता दिखे तो पहचानें।
2️⃣ बोने से पहले Carbendazim से बीज उपचार करें।
3️⃣ जल जमाव से बचाव करें।
4️⃣ स्वस्थ बीज का प्रयोग करें।
5️⃣ खेत की सफाई रखें।""",

'Sugarcane_smut': """1️⃣ गन्ने में काला चाबुक जैसा दिखाई दे तो पहचानें।
2️⃣ संक्रमित पौधे हटाकर नष्ट करें।
3️⃣ बीज उपचार अवश्य करें।
4️⃣ फसल चक्र अपनाएँ।
5️⃣ प्रतिरोधी किस्में लगाएँ।""",

'Sugarcane_Viral_Disease': """1️⃣ पत्तियाँ पीली व कमजोर दिखें तो पहचानें।
2️⃣ संक्रमित पौधे हटाएँ।
3️⃣ कीट नियंत्रण करें।
4️⃣ संतुलित उर्वरक दें।
5️⃣ नियमित निरीक्षण करें।""",

'Sugarcane_Yellow_Leaf': """1️⃣ पत्तियाँ नीचे से पीली पड़ें तो पहचानें।
2️⃣ जिंक या सूक्ष्म पोषक तत्व स्प्रे करें।
3️⃣ संतुलित नाइट्रोजन दें।
4️⃣ जल प्रबंधन सही रखें।
5️⃣ रोगग्रस्त पौधे अलग करें।""",


# =========================
# 🍅 TOMATO
# =========================

'Tomato___Bacterial_spot': """1️⃣ पत्तियों पर छोटे काले धब्बे दिखें तो पहचानें।
2️⃣ Copper Oxychloride 3 ग्राम प्रति लीटर छिड़कें।
3️⃣ Streptocycline मिलाकर स्प्रे करें।
4️⃣ संक्रमित पत्तियाँ हटाएँ।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Tomato___Early_blight': """1️⃣ गोल भूरे धब्बे दिखें तो पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ संतुलित खाद दें।
5️⃣ 7–10 दिन बाद दोहराएँ।""",

'Tomato___healthy': """1️⃣ पौधा स्वस्थ है।
2️⃣ रोग का कोई लक्षण नहीं।
3️⃣ संतुलित उर्वरक दें।
4️⃣ उचित सिंचाई करें।
5️⃣ नियमित निगरानी रखें।""",

'Tomato___Late_blight': """1️⃣ पत्तियाँ काली पड़ें तो पहचानें।
2️⃣ Metalaxyl + Mancozeb छिड़कें।
3️⃣ 5–7 दिन बाद दोहराएँ।
4️⃣ जल जमाव से बचें।
5️⃣ संक्रमित पौधे हटाएँ।""",

'Tomato___Leaf_Mold': """1️⃣ पत्तियों के नीचे फफूंद दिखे तो पहचानें।
2️⃣ Copper आधारित दवा छिड़कें।
3️⃣ नमी कम रखें।
4️⃣ संक्रमित पत्तियाँ हटाएँ।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Tomato___Septoria_leaf_spot': """1️⃣ छोटे गोल धब्बे दिखें तो पहचानें।
2️⃣ Carbendazim 1 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ फसल चक्र अपनाएँ।
5️⃣ 7–10 दिन बाद दोहराएँ।""",

'Tomato___Spider_mites Two-spotted_spider_mite': """1️⃣ पत्तियों पर जाल और पीले धब्बे दिखें।
2️⃣ Abamectin 0.5 मिली प्रति लीटर छिड़कें।
3️⃣ पत्तियों के नीचे स्प्रे करें।
4️⃣ सूखेपन से बचाएँ।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Tomato___Target_Spot': """1️⃣ गोल निशान दिखें तो पहचानें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ खेत में हवा का प्रवाह रखें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Tomato___Tomato_mosaic_virus': """1️⃣ पत्तियाँ मुड़ी-तुड़ी दिखें तो पहचानें।
2️⃣ संक्रमित पौधा उखाड़ दें।
3️⃣ उपकरण साफ रखें।
4️⃣ कीट नियंत्रण करें।
5️⃣ स्वस्थ बीज का उपयोग करें।""",

'Tomato___Tomato_Yellow_Leaf_Curl_Virus': """1️⃣ पत्तियाँ पीली व मुड़ी दिखें।
2️⃣ संक्रमित पौधे हटाएँ।
3️⃣ Whitefly नियंत्रण करें।
4️⃣ Imidacloprid छिड़कें।
5️⃣ नियमित निरीक्षण रखें।""",


# =========================
# 🌾 WHEAT
# =========================

'Wheat_Aphid': """1️⃣ पत्तियों पर छोटे हरे कीट दिखें।
2️⃣ Imidacloprid 0.5 मिली प्रति लीटर छिड़कें।
3️⃣ सुबह या शाम स्प्रे करें।
4️⃣ 10 दिन बाद दोहराएँ।
5️⃣ खेत की निगरानी रखें।""",

'Wheat_Black_Rust': """1️⃣ पत्तियों पर काले जंग जैसे धब्बे दिखें।
2️⃣ Propiconazole 1 मिली प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ संतुलित खाद दें।
5️⃣ 10 दिन बाद आवश्यकता अनुसार दोहराएँ।""",

'Wheat_Blast': """1️⃣ बालियों में सूखापन दिखे।
2️⃣ Tricyclazole 0.6 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित बालियाँ हटाएँ।
4️⃣ फसल चक्र अपनाएँ।
5️⃣ नियमित निरीक्षण रखें।""",

'Wheat_Brown_Rust': """1️⃣ पत्तियों पर भूरे दाने दिखें।
2️⃣ Propiconazole छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ अधिक नाइट्रोजन न दें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Wheat_Common_Root_Rot': """1️⃣ जड़ें काली व सड़ी दिखें।
2️⃣ बीज उपचार Carbendazim से करें।
3️⃣ जल जमाव से बचें।
4️⃣ स्वस्थ बीज प्रयोग करें।
5️⃣ संतुलित उर्वरक दें।""",

'Wheat_Fusarium_Head_Blight': """1️⃣ बालियाँ सफेद दिखें।
2️⃣ Tebuconazole छिड़कें।
3️⃣ फसल अवशेष हटाएँ।
4️⃣ नमी नियंत्रित रखें।
5️⃣ आवश्यकता अनुसार दोहराएँ।""",

'Wheat_Healthy': """1️⃣ फसल स्वस्थ है।
2️⃣ रोग का कोई लक्षण नहीं।
3️⃣ संतुलित खाद दें।
4️⃣ उचित सिंचाई करें।
5️⃣ नियमित निरीक्षण रखें।""",

'Wheat_Healthy_2': """1️⃣ फसल पूर्णतः स्वस्थ है।
2️⃣ किसी रोग का संकेत नहीं।
3️⃣ संतुलित पोषण दें।
4️⃣ सिंचाई सही रखें।
5️⃣ नियमित निगरानी जारी रखें।""",

'Wheat_Leaf_Blight': """1️⃣ पत्तियों पर भूरे बड़े धब्बे दिखें।
2️⃣ Mancozeb 2.5 ग्राम प्रति लीटर छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ खेत साफ रखें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Wheat_Mildew': """1️⃣ पत्तियों पर सफेद परत दिखे।
2️⃣ Sulphur 2 ग्राम प्रति लीटर छिड़कें।
3️⃣ हवा का प्रवाह रखें।
4️⃣ अधिक नमी से बचें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Wheat_Mite': """1️⃣ पत्तियाँ सिकुड़ी और पीली दिखें।
2️⃣ Abamectin 0.5 मिली प्रति लीटर छिड़कें।
3️⃣ पत्तियों के नीचे स्प्रे करें।
4️⃣ सूखेपन से बचें।
5️⃣ आवश्यकता अनुसार दोहराएँ।""",

'Wheat_Septoria': """1️⃣ छोटे भूरे धब्बे दिखें।
2️⃣ Carbendazim छिड़कें।
3️⃣ संक्रमित पत्तियाँ हटाएँ।
4️⃣ फसल चक्र अपनाएँ।
5️⃣ 7–10 दिन बाद दोहराएँ।""",

'Wheat_Stem_fly': """1️⃣ तना कमजोर और सूखा दिखे।
2️⃣ Chlorpyrifos छिड़कें।
3️⃣ समय पर बुवाई करें।
4️⃣ खेत की निगरानी रखें।
5️⃣ आवश्यकता अनुसार दोहराएँ।""",

'Wheat_Tan_spot': """1️⃣ पत्तियों पर पीले-भूरे धब्बे दिखें।
2️⃣ Mancozeb छिड़कें।
3️⃣ फसल अवशेष हटाएँ।
4️⃣ संतुलित खाद दें।
5️⃣ 7 दिन बाद दोहराएँ।""",

'Wheat_Yellow_Rust': """1️⃣ पत्तियों पर पीली धारियाँ दिखें।
2️⃣ Tebuconazole या Propiconazole छिड़कें।
3️⃣ संक्रमित पौधे अलग करें।
4️⃣ संतुलित पोषण दें।
5️⃣ 7 दिन बाद दोहराएँ।""",

}

# ==========================
# Input Validation Helper
# ==========================

def _is_valid_leaf_image(img_array: np.ndarray) -> bool:
    """
    Colour-based pre-check: returns True only if the image likely contains a
    plant leaf.

    Rejects:
      - Very bright images  (non-plant backgrounds)
      - Blue-dominant images (sky, water, indoor backgrounds)
      - Images with insufficient green content (objects, rooms, soil, food)
    """
    img   = img_array[0]            # shape (224, 224, 3), values in [0, 1]
    avg_r = float(np.mean(img[:, :, 0]))
    avg_g = float(np.mean(img[:, :, 1]))
    avg_b = float(np.mean(img[:, :, 2]))
    total = avg_r + avg_g + avg_b + 1e-7

    # Reject very bright images (non-plant backgrounds)
    if np.mean(img) > 0.88:
        return False

    # Reject if blue strongly dominates (sky, water, room backgrounds)
    if avg_b > avg_g * 1.30 and avg_b > avg_r * 1.20:
        return False

    # A leaf MUST have a meaningful green presence
    green_ratio = avg_g / total
    if green_ratio < 0.28:      # green < ~28% of total colour → not a leaf
        return False

    return True


# ==========================
# Prediction Function
# ==========================

CONFIDENCE_THRESHOLD = 70.0   # 70 %

def predict_disease(img_path):
    """
    Prints the disease diagnosis report for a valid leaf image.
    Prints an error message and returns early for invalid / unclear images.

    Validation layers applied:
      1. Colour pre-check  — rejects obviously non-leaf images
      2. Confidence gate   — rejects predictions below 70 % confidence
    """

    img       = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    # ── Layer 1: colour sanity check ──────────────────────────────────────────
    if not _is_valid_leaf_image(img_array):
        print("\n⚠️ Invalid Image: यह पत्ती / फसल की छवि नहीं लगती।")
        print("   Invalid Image or Image not clear. Please upload a proper leaf/crop image.")
        return

    # ── Layer 2: model inference ───────────────────────────────────────────────
    prediction      = model.predict(img_array)
    confidence      = float(np.max(prediction)) * 100
    predicted_index = int(np.argmax(prediction))
    predicted_class = class_names[predicted_index]

    print("\n==============================")
    print(" 🌿 कृषि फसल स्वास्थ्य एवं रोग निदान रिपोर्ट ")
    print("==============================")
    print(f"Predicted Disease : {predicted_class}")
    print(f"Confidence        : {confidence:.2f}%")
    print("==============================\n")

    # ── Layer 3: confidence threshold ─────────────────────────────────────────
    if confidence < CONFIDENCE_THRESHOLD:
        print(f"⚠️ Low confidence ({confidence:.1f}%) — image may not be a crop leaf or is unclear.")
        print("   Invalid Image or Image not clear. Please upload a proper leaf/crop image.")
        return

    if predicted_class in treatment_dict:
        print("📌 उपचार सुझाव:\n")
        print(treatment_dict[predicted_class])
    else:
        print("❗ इस रोग के लिए उपचार उपलब्ध नहीं है।")


# ==========================
# MAIN
# ==========================

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python Deployment.py image_path.jpg")
    else:
        image_path = sys.argv[1]
        predict_disease(image_path)