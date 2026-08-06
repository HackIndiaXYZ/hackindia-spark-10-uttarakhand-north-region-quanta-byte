const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');

// Route Imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const diseaseRoutes = require('./routes/disease');
const soilRoutes = require('./routes/soil');
const weatherRoutes = require('./routes/weather');
const marketRoutes = require('./routes/market');
const schemesRoutes = require('./routes/schemes');
const yieldsRoutes = require('./routes/yields');
const machineryRoutes = require('./routes/machinery');
const alertsRoutes = require('./routes/alerts');
const chatbotRoutes = require('./routes/chatbot');
const voiceRoutes = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize Database & Seeding
connectDB().then(() => {
  seedDatabase();
});

// Middleware Setup
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads / assets folder
app.use('/static', express.static(path.join(__dirname, '../public')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/yield', yieldsRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/voice', voiceRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Krishi AI V2.0 Express & MongoDB API Server (MERN Stack)" });
});

app.listen(PORT, () => {
  console.log(`🚀 Krishi AI MERN Express Backend Server running on port ${PORT}`);
});
