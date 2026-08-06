const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebase_uid: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, default: 'किसान जी' },
  mobile: { type: String },
  village: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: 'Uttar Pradesh' },
  language: { type: String, default: 'hi' },
  land_acres: { type: Number, default: 0 },
  irrigation: { type: String, default: '' },
  soil_type: { type: String, default: '' },
  own_tractor: { type: Boolean, default: false },
  crops: { type: [String], default: [] },
  avatar_url: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
