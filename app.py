import logging
import random
import string
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super_secret_krishi_key_2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///krishi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# ==========================================
# Database Models
# ==========================================
class Farmer(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile_no = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Profile Info
    village = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    language = db.Column(db.String(20), nullable=True)
    
    # Farm Info
    land_acres = db.Column(db.Float, nullable=True)
    irrigation = db.Column(db.String(100), nullable=True)
    soil_type = db.Column(db.String(100), nullable=True)
    own_tractor = db.Column(db.String(10), nullable=True)
    
    # Crops (stored as comma separated string)
    crops = db.Column(db.String(200), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return Farmer.query.get(int(user_id))

# Create database tables
with app.app_context():
    db.create_all()

# ==========================================
# Error Handlers
# ==========================================
@app.errorhandler(404)
def page_not_found(e):
    logger.warning(f"Page not found: {e}")
    return "<h1>404 - Page Not Found</h1>", 404

@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"Internal server error: {e}")
    return "<h1>500 - Internal Server Error</h1>", 500

# ==========================================
# Authentication Routes
# ==========================================
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        mobile_no = request.form.get('mobile_no')
        password = request.form.get('password')
        
        # Check if farmer exists
        if Farmer.query.filter_by(mobile_no=mobile_no).first() or Farmer.query.filter_by(email=email).first():
            flash('Account with this email or mobile number already exists.', 'danger')
            return redirect(url_for('register'))
            
        # Generate Farmer ID: Name's first 2 letters + Year (last 2 digits) + 4 random numbers
        year_str = str(datetime.now().year)[-2:]
        name_prefix = (name[:2] if len(name) >= 2 else name.ljust(2, 'X')).upper()
        random_digits = ''.join(random.choices(string.digits, k=4))
        farmer_id = f"{name_prefix}{year_str}{random_digits}"
        
        # Make sure farmer_id is unique
        while Farmer.query.filter_by(farmer_id=farmer_id).first():
            random_digits = ''.join(random.choices(string.digits, k=4))
            farmer_id = f"{name_prefix}{year_str}{random_digits}"
        
        farmer = Farmer(
            farmer_id=farmer_id,
            name=name,
            email=email,
            mobile_no=mobile_no
        )
        farmer.set_password(password)
        db.session.add(farmer)
        db.session.commit()
        
        flash(f'Registration successful! Your Farmer ID is {farmer_id}. Please login.', 'success')
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
        
    if request.method == 'POST':
        identifier = request.form.get('identifier') # Can be Farmer ID or Mobile No
        password = request.form.get('password')
        
        farmer = Farmer.query.filter((Farmer.farmer_id == identifier) | (Farmer.mobile_no == identifier)).first()
        
        if farmer and farmer.check_password(password):
            login_user(farmer)
            flash('Logged in successfully!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('dashboard'))
        else:
            flash('Invalid Farmer ID/Mobile No or password.', 'danger')
            
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

# ==========================================
# Core Routes
# ==========================================
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    return redirect(url_for('login'))

@app.route('/home')
@login_required
def home():
    logger.info("Accessed Home page")
    return render_template('home.html')

@app.route('/dashboard')
@login_required
def dashboard():
    logger.info("Accessed Dashboard page")
    return render_template('dashboard.html')

@app.route('/disease')
@login_required
def disease():
    logger.info("Accessed Disease page")
    return render_template('disease.html')

@app.route('/soil')
@login_required
def soil():
    logger.info("Accessed Soil page")
    return render_template('soil.html')

@app.route('/weather')
@login_required
def weather():
    logger.info("Accessed Weather page")
    return render_template('weather.html')

@app.route('/chatbot')
@login_required
def chatbot():
    logger.info("Accessed Chatbot page")
    return render_template('chatbot.html')

@app.route('/chatbot/query', methods=['POST'])
@login_required
def chatbot_query():
    data = request.get_json() or {}
    message = data.get('message', '').lower()
    
    # Check for empty message
    if not message:
        return jsonify({'response': "कृपया अपना सवाल पूछें।"})
        
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables.")
        model = genai.GenerativeModel('gemini-3.5-flash')
        prompt = f"You are Krishi AI, an AI assistant for Indian farmers. Answer the following question helpfully and concisely in the language it was asked (mostly Hindi or English). Focus on agriculture, weather, crops, market prices, and government schemes. Keep answers brief (2-4 sentences max) and do not use markdown except for basic bolding. Question: {message}"
        
        response = model.generate_content(prompt)
        ai_response = response.text
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        ai_response = "माफ़ कीजिए, अभी AI जवाब देने में असमर्थ है। कृपया थोड़ी देर बाद प्रयास करें।"
        
    return jsonify({'response': ai_response})

@app.route('/chatbot/clear', methods=['POST'])
@login_required
def chatbot_clear():
    return jsonify({'status': 'success'})

@app.route('/voice')
@login_required
def voice():
    logger.info("Accessed Voice page")
    return render_template('voice.html')

@app.route('/machinery')
@login_required
def machinery():
    logger.info("Accessed Machinery page")
    return render_template('machinery.html')

@app.route('/market')
@login_required
def market():
    logger.info("Accessed Market page")
    return render_template('market.html')

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        # Update user details
        current_user.name = request.form.get('name', current_user.name)
        current_user.mobile_no = request.form.get('mobile', current_user.mobile_no)
        current_user.village = request.form.get('village', current_user.village)
        current_user.district = request.form.get('district', current_user.district)
        current_user.state = request.form.get('state', current_user.state)
        current_user.language = request.form.get('language', current_user.language)
        
        land_acres = request.form.get('land_acres')
        if land_acres:
            current_user.land_acres = float(land_acres)
            
        current_user.irrigation = request.form.get('irrigation', current_user.irrigation)
        current_user.soil_type = request.form.get('soil_type', current_user.soil_type)
        current_user.own_tractor = request.form.get('own_tractor', current_user.own_tractor)
        
        # Handle crops list
        crops_list = request.form.getlist('crops')
        current_user.crops = ",".join(crops_list) if crops_list else ""
        
        db.session.commit()
        flash('प्रोफाइल सफलतापूर्वक सेव हो गई!', 'success')
        return redirect(url_for('profile'))
        
    logger.info("Accessed Profile page")
    # For rendering template, ensure crops is passed as a list
    user_crops = current_user.crops.split(',') if current_user.crops else []
    
    # We will temporarily inject user_crops to the object or pass it to template
    # Since current_user is passed implicitly to jinja, we can just do:
    # {% if crop in current_user.crops.split(',') %} in template. 
    # But since the template expects current_user.crops as a list/iterable, 
    # we can modify current_user temporarily for rendering or just update the template.
    # The template currently uses: `if crop in current_user.crops`. 
    # Since crops is a string "गेहूं,धान", `in` operator works! (e.g. "गेहूं" in "गेहूं,धान" is True)
    
    return render_template('profile.html')

@app.route('/alerts')
@login_required
def alerts():
    logger.info("Accessed Alerts page")
    return render_template('alerts.html')

@app.route('/schemes')
@login_required
def schemes():
    logger.info("Accessed Schemes page")
    return render_template('schemes.html')

@app.route('/yield')
@login_required
def yield_page():
    logger.info("Accessed Yield page")
    return render_template('yield.html')

# ==========================================
# App Execution
# ==========================================
if __name__ == '__main__':
    logger.info("Starting the Flask application...")
    # Running in debug mode for development; should be False in production
    app.run(host='0.0.0.0', port=5000, debug=True)