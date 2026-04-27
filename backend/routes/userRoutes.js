const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// 1. Tell Cloudinary to save these in a specific "Profiles" folder
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campushub_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});
const upload = multer({ storage: storage });

// 2. GET: Send the user's current data to the Navbar and Profile page
router.get('/me', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("🚨 FETCH PROFILE ERROR:", error);
    res.status(500).json({ error: 'Failed to load profile data' });
  }
});

// 3. PUT: Save the new Name, Mobile, and Avatar to Firebase
router.put('/profile', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, mobile, profilePicUrl } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;

    // If they uploaded a custom image, use the Cloudinary URL. 
    // Otherwise, use the colorful preset URL they clicked.
    if (req.file) {
      updateData.profilePic = req.file.path; 
    } else if (profilePicUrl) {
      updateData.profilePic = profilePicUrl;
    }

    // Save to the vault!
    await db.collection('users').doc(req.user.id).update(updateData);
    
    res.status(200).json({ message: 'Profile updated successfully!', profilePic: updateData.profilePic });
  } catch (error) {
    console.error("🚨 SAVE PROFILE ERROR:", error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;