const admin = require('firebase-admin');
const serviceAccount = require('../firebaseServiceKey.json');

// Initialize the Firebase connection
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export the database engine
const db = admin.firestore();

module.exports = { admin, db };