const { db } = require('../config/firebase');
const sendDiscordNotification = require('../utils/discord');
const sendEmail = require('../utils/email'); // 📧 NEW: The Email Engine!

// --- 1. NORMAL UPLOAD (WITH 3-AD LIMIT & CLOUDINARY) ---
exports.createItem = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!req.file) return res.status(400).json({ error: 'An image is required.' });

    const userAdsSnapshot = await db.collection('items')
      .where('sellerEmail', '==', req.user.id)
      .get();
      
    if (userAdsSnapshot.size >= 3) {
      return res.status(403).json({ 
        error: 'Limit Reached: You have used your 3 free ads! Contact admin to post more.' 
      });
    }

    const newItemRef = await db.collection('items').add({
      sellerEmail: req.user.id, 
      name,
      price: Number(price),
      description: description || "",
      imageUrl: req.file.path, 
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    const discordMessage = `
🚨 **NEW CAMPUS HUB SUBMISSION** 🚨
**Item:** ${name}
**Price:** ₹${price}
**Seller:** ${req.user.id}
**Image:** ${req.file.path}

🟢 **[APPROVE IN ADMIN PANEL]**(http://localhost:3000/admin)
    `;
    
    await sendDiscordNotification(discordMessage);

    res.status(201).json({ message: 'Item submitted for admin review!', itemId: newItemRef.id });
  } catch (error) {
    console.error("🚨 ITEM UPLOAD ERROR:", error);
    res.status(500).json({ error: 'Failed to submit item' });
  }
};

// --- 2. FETCH APPROVED ITEMS (WITH 7% COMMISSION) ---
exports.getApprovedItems = async (req, res) => {
  try {
    const itemsSnapshot = await db.collection('items').where('status', '==', 'approved').get();
    const items = [];
    
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      const adminCut = data.price * 0.07;
      const finalPriceToBuyer = Math.ceil(data.price + adminCut);
      
      items.push({ 
        id: doc.id, 
        ...data,
        displayPrice: finalPriceToBuyer
      });
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load shop items' });
  }
};

// --- 3. ADMIN PANEL: FETCH EVERYTHING ---
exports.getAllItemsForAdmin = async (req, res) => {
  try {
    const itemsSnapshot = await db.collection('items').orderBy('createdAt', 'desc').get();
    const items = [];
    itemsSnapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load admin items' });
  }
};

// --- 4. ADMIN PANEL: APPROVE OR DENY (WITH AUTOMATED EMAILS) ---
exports.adminAction = async (req, res) => {
  try {
    const { action, id } = req.params;
    const itemRef = db.collection('items').doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) return res.status(404).json({ error: 'Item not found' });
    
    const itemData = doc.data();
    const sellerEmail = itemData.sellerEmail;
    const itemName = itemData.name;

    if (action === 'approve') {
      await itemRef.update({ status: 'approved' });
      
      // 📧 FIRE APPROVAL EMAIL
      await sendEmail(
        sellerEmail, 
        "✅ Your Ad is Live on Campus Hub!", 
        `Good news! Your ad for "${itemName}" has been approved by the admin and is now live on the marketplace.`
      );

      return res.status(200).json({ message: 'Item Approved' });
    } 
    
    if (action === 'deny') {
      await itemRef.delete();
      
      // 📧 FIRE DENIAL EMAIL
      await sendEmail(
        sellerEmail, 
        "❌ Campus Hub Ad Declined", 
        `Unfortunately, your ad for "${itemName}" was denied by the admin and has been removed. Please ensure your posts meet campus guidelines.`
      );

      return res.status(200).json({ message: 'Item Denied and Deleted' });
    }
  } catch (error) {
    console.error("🚨 ADMIN ACTION ERROR:", error);
    res.status(500).json({ error: 'Server Error processing action.' });
  }
};

// --- 5. ADMIN PANEL: FORCE DELETE ---
exports.deleteItem = async (req, res) => {
  try {
    await db.collection('items').doc(req.params.id).delete();
    res.status(200).json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// --- 6. ⚡ ADMIN PANEL: GOD-MODE UPLOAD ---
exports.adminCreateItem = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!req.file) return res.status(400).json({ error: 'An image is required.' });

    const newItemRef = await db.collection('items').add({
      sellerEmail: 'Campus Hub Official',
      name,
      price: Number(price),
      description: description || "",
      imageUrl: req.file.path, 
      status: 'approved',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Official Ad Posted!', itemId: newItemRef.id });
  } catch (error) {
    console.error("🚨 ADMIN UPLOAD ERROR:", error);
    res.status(500).json({ error: 'Failed to post official ad' });
  }
};