const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize the App
const app = express();

// --- 1. MIDDLEWARE ---

// 🛡️ THE BOUNCER: Explicitly allows your live Vercel frontend
const allowedOrigins = [
  'http://localhost:3000', 
  'https://campus-hub-weld.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Allows the server to read JSON data from requests
app.use(express.json()); 
// Allows the server to read URL-encoded data
app.use(express.urlencoded({ extended: true })); 

// --- 2. THE ROUTER SWITCHBOARD ---
// Every time the frontend makes a request, the server sends it to the right file here:

// Handles Login & Registration
app.use('/api/auth', require('./routes/authRoutes')); 

// Handles the Marketplace, 7% Commission, God-Mode Uploads, and Cloudinary Images
app.use('/api/items', require('./routes/itemRoutes')); 

// Handles the Navbar Avatars and Profile Setup
app.use('/api/users', require('./routes/userRoutes')); 
app.use('/api/chats', require('./routes/chatRoutes'));

// --- 3. HEALTH CHECK ---
// A simple route to verify the server is alive if you visit https://campus-hub-2tb0.onrender.com
app.get('/', (req, res) => {
  res.send('✅ Campus Hub API is active and running.');
});

// --- 4. IGNITE THE ENGINE ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Campus Hub Server running securely on port ${PORT}`);
});