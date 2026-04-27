const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    // The Hard Truth Regex: Now explicitly allows BOTH domains
    match: [/^[a-zA-Z0-9._%+-]+@(mru\.edu\.in|mru\.ac\.in)$/, 'Must use a valid MRU campus email (@mru.edu.in or @mru.ac.in)']
  },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  mobile: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);