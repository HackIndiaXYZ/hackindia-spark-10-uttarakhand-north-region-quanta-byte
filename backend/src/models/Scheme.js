const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  benefit: { type: String, required: true },
  apply_url: { type: String, required: true }
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

module.exports = mongoose.model('Scheme', schemeSchema);
