const mongoose = require('mongoose');

const soilRecordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  soil_type: { type: String, required: true },
  ph: { type: Number, required: true },
  moisture: { type: String, required: true },
  fertility: { type: String, required: true },
  recommended_crops: { type: [String], required: true },
  fertilizer_advice: { type: String, required: true },
  image_url: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
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

module.exports = mongoose.model('SoilRecord', soilRecordSchema);
