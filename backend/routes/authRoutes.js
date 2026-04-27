const express = require('express');
const router = express.Router();
const { register, login, verifyOtp, updateProfile, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify', verifyOtp);
router.post('/login', login);
router.put('/profile', auth, updateProfile); // Protected route
router.get('/me', auth, getMe); // Protected route

module.exports = router;