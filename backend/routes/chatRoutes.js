const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');
const { initChat, getUserChats, sendMessage, requestBuy, getAllChatsForAdmin, cancelDeal, adminDeleteChat } = require('../controllers/chatController');

// Normal Student Routes
router.post('/init', auth, initChat);
router.get('/my-chats', auth, getUserChats);
router.post('/message', auth, sendMessage);
router.post('/request-buy', auth, requestBuy);
router.post('/cancel', auth, cancelDeal); // 🛑 NEW

// 🛡️ Master Admin Routes
router.get('/admin/all', auth, adminAuth, getAllChatsForAdmin);
router.delete('/admin/:id', auth, adminAuth, adminDeleteChat); // 🛑 NEW

module.exports = router;