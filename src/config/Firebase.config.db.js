const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServices.json");

// Initialize Firebase only if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://thinkprofit-867dc-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

async function generateCustomToken(uid) {
  if (!uid || typeof uid !== 'string') {
    throw new Error('UID must be a non-empty string');
  }
  try {
    const token = await admin.auth().createCustomToken(uid);
    return token;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}

const db = admin.firestore();
const database = admin.database();
const auth = admin.auth();

module.exports = { admin, database, db, auth, generateCustomToken };
