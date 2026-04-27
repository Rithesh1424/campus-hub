const express = require('express');
const router = express.Router();
const { 
  createItem, 
  getApprovedItems, 
  getAllItemsForAdmin, 
  adminAction, 
  deleteItem, 
  adminCreateItem 
} = require('../controllers/itemController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware'); 
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 1. Authenticate with Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Tell Multer to send files straight to the Cloud
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campushub_items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});

const upload = multer({ storage: storage });

// 3. The Routes
router.get('/', getApprovedItems);
router.post('/', auth, upload.single('image'), createItem); 
router.get('/admin/all', auth, adminAuth, getAllItemsForAdmin);
router.delete('/admin/:id', auth, adminAuth, deleteItem);
router.get('/admin/:action/:id', auth, adminAuth, adminAction);

// ⚡ THE NEW GOD-MODE ADMIN ROUTE
router.post('/admin/create', auth, adminAuth, upload.single('image'), adminCreateItem);

module.exports = router;