const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // Links the item to the specific student who is selling it
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  // The core logic engine for your broker model
  status: {
    type: String,
    enum: ['pending', 'active', 'requested', 'sold'],
    default: 'pending' // Defaults to pending so it doesn't go live automatically
  },
  // Links to the buyer ONLY once they click "Request Availability"
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);