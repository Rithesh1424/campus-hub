const { admin, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Your NodeMailer Setup (uses the EMAIL_USER and EMAIL_PASS from your .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 🛡️ THE DOMAIN WALL
    const emailDomain = email.split('@')[1];
    
    // Check if it matches the allowed MRU domains
    if (emailDomain !== 'mru.edu.in' && emailDomain !== 'mru.ac.in') {
      return res.status(403).json({ 
        error: 'Access Denied: Only MRU emails (@mru.edu.in or @mru.ac.in) are allowed.' 
      });
    }

    // In Firebase, we use the user's email as their unique Document ID
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (doc.exists) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    // Save the new user to Firebase
    await userRef.set({
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
      createdAt: new Date().toISOString()
    });

    // Send the OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Campus Hub - Verification',
      text: `Your verification OTP is: ${otp}`
    });

    res.status(200).json({ message: 'OTP sent to email', requiresOtp: true });
  } catch (error) {
    console.error("🚨 REGISTRATION ERROR:", error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = doc.data();

    if (userData.otp !== otp || userData.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update user in Firebase and clear the OTP
    await userRef.update({
      isVerified: true,
      otp: admin.firestore.FieldValue.delete(),
      otpExpiry: admin.firestore.FieldValue.delete()
    });

    // Generate login token
    const token = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, needsSetup: !userData.isProfileComplete });
  } catch (error) {
    console.error("🚨 VERIFICATION ERROR:", error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doc = await db.collection('users').doc(email).get();

    if (!doc.exists) return res.status(400).json({ error: 'Invalid credentials' });
    const userData = doc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    if (!userData.isVerified) return res.status(400).json({ error: 'Please verify your email first' });

    const token = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, needsSetup: !userData.isProfileComplete });
  } catch (error) {
    console.error("🚨 LOGIN ERROR:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    
    // If user doesn't exist, don't let them reset
    if (!doc.exists) return res.status(404).json({ error: 'No account found with that email' });

    // Generate new OTP
    const otp = generateOTP();
    await userRef.update({
      otp: otp,
      otpExpiry: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Campus Hub - Password Reset',
      text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`
    });

    res.status(200).json({ message: 'Reset OTP sent to your email' });
  } catch (error) {
    console.error("🚨 FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ error: 'Server error requesting password reset' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = doc.data();
    
    // Check if OTP is correct and not expired
    if (userData.otp !== otp || userData.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash the new password and save it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear the OTP so it can't be used again
    await userRef.update({
      password: hashedPassword,
      otp: admin.firestore.FieldValue.delete(),
      otpExpiry: admin.firestore.FieldValue.delete()
    });

    res.status(200).json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    console.error("🚨 RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = doc.data();
    
    // Don't send the password back to the frontend
    delete userData.password;
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, mobile, profilePic } = req.body;
    await db.collection('users').doc(req.user.id).update({
      name, mobile, profilePic, isProfileComplete: true
    });
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving profile' });
  }
};