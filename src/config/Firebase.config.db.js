const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServices.json");

// Initialize Firebase only if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://thinkprofit-867dc-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.firestore();
const database = admin.database();
const auth = admin.auth();

module.exports = { admin, database, db, auth };
