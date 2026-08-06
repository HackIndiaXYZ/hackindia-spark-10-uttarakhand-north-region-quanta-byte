const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  session_id: { type: String, required: true, index: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
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

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
