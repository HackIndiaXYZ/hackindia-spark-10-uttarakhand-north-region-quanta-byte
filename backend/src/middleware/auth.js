const User = require('../models/User');

// Middleware to extract/verify user or fallback to mock dev user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    let firebaseUid = 'fb_default';
    if (token) {
      if (token.startsWith('mock_')) {
        firebaseUid = token.replace('mock_', '');
      } else {
        firebaseUid = `fb_${token.substring(0, 10)}`;
      }
    }

    let user = null;
    try {
      user = await User.findOne({ firebase_uid: firebaseUid });
      if (!user) {
        user = await User.create({
          firebase_uid: firebaseUid,
          name: 'किसान जी',
          mobile: '9999999999',
          village: '',
          district: '',
          state: 'Uttar Pradesh',
          language: 'hi',
          crops: []
        });
      }
    } catch (dbErr) {
      user = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        firebase_uid: firebaseUid,
        name: 'किसान जी',
        mobile: '9999999999',
        village: 'रामपुर',
        district: 'वाराणसी',
        state: 'Uttar Pradesh',
        language: 'hi',
        land_acres: 3.5,
        irrigation: 'नहर / बोरवेल',
        soil_type: 'जलोढ़ मिट्टी',
        own_tractor: true,
        crops: ['गेहूं', 'धान'],
        toJSON: function() { return { id: '65f1a2b3c4d5e6f7a8b9c0d1', ...this }; }
      };
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ detail: 'Authentication error' });
  }
};

module.exports = authMiddleware;
