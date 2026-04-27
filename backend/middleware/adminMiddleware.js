const { db } = require('../config/firebase');

const adminAuth = async (req, res, next) => {
  try {
    // req.user.id comes from your regular auth middleware
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) return res.status(401).json({ error: 'User not found.' });

    const userData = userDoc.data();

    // Check if they have the admin keys
    if (userData.isAdmin !== true) {
      return res.status(403).json({ error: 'Access Denied: You do not have Admin privileges.' });
    }

    // If they are an admin, let them through!
    next(); 
  } catch (error) {
    console.error("🚨 ADMIN AUTH ERROR:", error);
    res.status(500).json({ error: 'Server error verifying admin status.' });
  }
};

module.exports = adminAuth;