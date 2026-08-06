const mongoose = require('mongoose');

const diseaseRecordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  symptoms: { type: String },
  disease_name: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, required: true },
  cause: { type: String, required: true },
  treatment: { type: [String], required: true },
  prevention: { type: String, required: true },
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

module.exports = mongoose.model('DiseaseRecord', diseaseRecordSchema);
