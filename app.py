from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/disease')
def disease():
    return render_template('disease.html')

@app.route('/soil')
def soil():
    return render_template('soil.html')

@app.route('/weather')
def weather():
    return render_template('weather.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/voice')
def voice():
    return render_template('voice.html')

@app.route('/machinery')
def machinery():
    return render_template('machinery.html')

@app.route('/market')
def market():
    return render_template('market.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/alerts')
def alerts():
    return render_template('alerts.html')

@app.route('/schemes')
def schemes():
    return render_template('schemes.html')

@app.route('/yield')
def yield_page():
    return render_template('yield.html')

if __name__ == '__main__':
    app.run(debug=True)