const { db } = require('../config/firebase');

// 1. INIT CHAT (Now reserves the item!)
exports.initChat = async (req, res) => {
  try {
    const { itemId, itemName, sellerEmail } = req.body;
    const buyerEmail = req.user.id; 

    // Verify item is still available
    const itemDoc = await db.collection('items').doc(itemId).get();
    if (!itemDoc.exists || itemDoc.data().status !== 'approved') {
      return res.status(400).json({ error: 'Item is no longer available.' });
    }

    const newChatRef = await db.collection('chats').add({
      itemId,
      itemName,
      buyerEmail,
      sellerEmail,
      status: 'active', 
      createdAt: new Date().toISOString(),
      messages: [
        { senderRole: 'system', targetRole: 'all', text: 'Chat initiated. Item is now reserved and hidden from the storefront.', timestamp: new Date().toISOString() }
      ]
    });

    // 🛑 HIDE THE ITEM FROM THE STOREFRONT
    await db.collection('items').doc(itemId).update({ status: 'reserved' });

    res.status(201).json({ chatId: newChatRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize chat' });
  }
};

// 2. GET USER CHATS
exports.getUserChats = async (req, res) => {
  try {
    const userEmail = req.user.id;
    const buyingSnapshot = await db.collection('chats').where('buyerEmail', '==', userEmail).get();
    const sellingSnapshot = await db.collection('chats').where('sellerEmail', '==', userEmail).get();
    
    const chats = [];
    buyingSnapshot.forEach(doc => chats.push({ id: doc.id, role: 'buyer', ...doc.data() }));
    sellingSnapshot.forEach(doc => chats.push({ id: doc.id, role: 'seller', ...doc.data() }));
    chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// 3. SEND DIRECT MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text, senderRole, targetRole } = req.body;
    const chatRef = db.collection('chats').doc(chatId);
    
    const newMessage = { senderRole, targetRole: targetRole || 'all', text, timestamp: new Date().toISOString() };
    await chatRef.update({ messages: require('firebase-admin').firestore.FieldValue.arrayUnion(newMessage) });
    res.status(200).json({ message: 'Message sent securely' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// 4. REQUEST BUY
exports.requestBuy = async (req, res) => {
  try {
    const { chatId } = req.body;
    await db.collection('chats').doc(chatId).update({
      status: 'pending_admin',
      messages: require('firebase-admin').firestore.FieldValue.arrayUnion({
        senderRole: 'system', targetRole: 'all', text: 'Buyer has requested to purchase. An Admin will now broker this deal directly with both parties.', timestamp: new Date().toISOString()
      })
    });
    res.status(200).json({ message: 'Admin notified' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to escalate to admin' });
  }
};

// 5. ADMIN FETCH ALL CHATS
exports.getAllChatsForAdmin = async (req, res) => {
  try {
    const chatsSnapshot = await db.collection('chats').orderBy('createdAt', 'desc').get();
    const chats = [];
    chatsSnapshot.forEach(doc => chats.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin chats' });
  }
};

// 6. 🛑 BUYER CANCELS DEAL (Restores Item)
exports.cancelDeal = async (req, res) => {
  try {
    const { chatId } = req.body;
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found' });
    
    // Delete chat and restore item
    await db.collection('chats').doc(chatId).delete();
    await db.collection('items').doc(chatDoc.data().itemId).update({ status: 'approved' });
    res.status(200).json({ message: 'Deal cancelled, item restored.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel deal' });
  }
};

// 7. 🛑 ADMIN TERMINATES CHAT (Restores Item)
exports.adminDeleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chatDoc = await db.collection('chats').doc(id).get();
    if (!chatDoc.exists) return res.status(404).json({ error: 'Chat not found' });
    
    // Delete chat and restore item
    await db.collection('chats').doc(id).delete();
    await db.collection('items').doc(chatDoc.data().itemId).update({ status: 'approved' });
    res.status(200).json({ message: 'Chat terminated, item restored.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to terminate chat' });
  }
};