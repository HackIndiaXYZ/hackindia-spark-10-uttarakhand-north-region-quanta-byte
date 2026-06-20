import logging
import random
import string
import os
import uuid
import base64
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

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
    pincode = db.Column(db.String(10), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
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

class ChatSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'), nullable=False)
    session_id = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade="all, delete-orphan")

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    role = db.Column(db.String(10), nullable=False) # 'user' or 'bot'
    content = db.Column(db.Text, nullable=False)
    image_data = db.Column(db.Text, nullable=True) # Base64 string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
    sessions = ChatSession.query.filter_by(farmer_id=current_user.id).order_by(ChatSession.created_at.desc()).all()
    
    active_session = None
    chat_history = []
    
    session_id_param = request.args.get('session_id')
    is_new = request.args.get('new')
    
    if is_new:
        active_session = None
    elif session_id_param:
        active_session = ChatSession.query.filter_by(session_id=session_id_param, farmer_id=current_user.id).first()
    elif sessions:
        active_session = sessions[0]
        
    if active_session:
        messages = ChatMessage.query.filter_by(session_id=active_session.id).order_by(ChatMessage.created_at.asc()).all()
        for msg in messages:
            ist_time = msg.created_at + timedelta(hours=5, minutes=30)
            time_str = ist_time.strftime('%I:%M %p')
            chat_history.append({
                'role': msg.role,
                'message': msg.content,
                'time': time_str,
                'image_data': msg.image_data
            })
            
    return render_template('chatbot.html', sessions=sessions, active_session=active_session, chat_history=chat_history)

@app.route('/chatbot/query', methods=['POST'])
@login_required
def chatbot_query():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    client_session_id = data.get('session_id')
    image_data = data.get('image_data')
    
    if not message and not image_data:
        return jsonify({'response': "कृपया अपना सवाल पूछें या फोटो भेजें।"})
        
    chat_session = None
    if client_session_id:
        chat_session = ChatSession.query.filter_by(session_id=client_session_id, farmer_id=current_user.id).first()
        
    if not chat_session:
        if not client_session_id:
            client_session_id = str(uuid.uuid4())
            
        title = message[:30] + "..." if len(message) > 30 else message
        if not message and image_data:
            title = "Image Upload"
            
        chat_session = ChatSession(farmer_id=current_user.id, session_id=client_session_id, title=title)
        db.session.add(chat_session)
        db.session.commit()
        
    user_msg = ChatMessage(session_id=chat_session.id, role='user', content=message, image_data=image_data)
    db.session.add(user_msg)
    db.session.commit()
    
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables.")
            
        model = genai.GenerativeModel('gemini-3.5-flash')
        prompt = f"You are Krishi AI, an AI assistant for Indian farmers. Answer the following question helpfully and concisely in the language it was asked (mostly Hindi or English). Focus on agriculture, weather, crops, market prices, and government schemes. Keep answers brief (2-4 sentences max) and do not use markdown except for basic bolding. Question: {message}"
        
        contents = []
        if image_data:
            try:
                mime_type, base64_data = image_data.split(';base64,')
                mime_type = mime_type.replace('data:', '')
                image_bytes = base64.b64decode(base64_data)
                contents.append({'mime_type': mime_type, 'data': image_bytes})
            except Exception as e:
                logger.error(f"Error decoding image data: {e}")
                
        contents.append(prompt)
        
        response = model.generate_content(contents)
        ai_response = response.text
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        ai_response = "माफ़ कीजिए, अभी AI जवाब देने में असमर्थ है। कृपया थोड़ी देर बाद प्रयास करें।"
        
    bot_msg = ChatMessage(session_id=chat_session.id, role='bot', content=ai_response)
    db.session.add(bot_msg)
    db.session.commit()
        
    return jsonify({'response': ai_response, 'session_id': chat_session.session_id})

@app.route('/chatbot/clear', methods=['POST'])
@login_required
def chatbot_clear():
    data = request.get_json() or {}
    client_session_id = data.get('session_id')
    if client_session_id:
        chat_session = ChatSession.query.filter_by(session_id=client_session_id, farmer_id=current_user.id).first()
        if chat_session:
            db.session.delete(chat_session)
            db.session.commit()
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
        
        new_mobile = request.form.get('mobile')
        if new_mobile and new_mobile != current_user.mobile_no:
            existing = Farmer.query.filter_by(mobile_no=new_mobile).first()
            if existing:
                flash('यह मोबाइल नंबर पहले से किसी और अकाउंट से जुड़ा है। कृपया दूसरा नंबर दर्ज करें।', 'danger')
                return redirect(url_for('profile'))
            current_user.mobile_no = new_mobile
            
        current_user.village = request.form.get('village', current_user.village)
        current_user.district = request.form.get('district', current_user.district)
        current_user.state = request.form.get('state', current_user.state)
        current_user.pincode = request.form.get('pincode', current_user.pincode)
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
        
        # Handle avatar upload
        avatar_file = request.files.get('avatar')
        if avatar_file and avatar_file.filename != '':
            filename = secure_filename(f"{current_user.id}_{avatar_file.filename}")
            filepath = os.path.join(app.root_path, 'static', 'uploads', 'avatars')
            os.makedirs(filepath, exist_ok=True)
            avatar_file.save(os.path.join(filepath, filename))
            current_user.avatar = url_for('static', filename=f'uploads/avatars/{filename}')
            
        db.session.commit()
        flash('प्रोफाइल सफलतापूर्वक सेव हो गई!', 'success')
        return redirect(url_for('profile'))
        
    logger.info("Accessed Profile page")
    
    # Determine edit mode
    edit_mode = request.args.get('edit', '0') == '1'
    if not current_user.village or not current_user.pincode:
        edit_mode = True
        
    # For rendering template, ensure crops is passed as a list
    user_crops = current_user.crops.split(',') if current_user.crops else []
    
    return render_template('profile.html', edit_mode=edit_mode)

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