const mongoose = require('mongoose');

const machinerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  price_per_day: { type: Number, required: true },
  owner_name: { type: String, required: true },
  mobile: { type: String, required: true },
  available: { type: Boolean, default: true },
  image_url: { type: String }
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

module.exports = mongoose.model('Machinery', machinerySchema);
