const { db } = require('../config/Firebase.config.db');
const admin = require('firebase-admin');

const generateId = () => {
  return 'UID' + Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;
    if (!userName || !userEmail || !userPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userId = generateId();

    // Create user with Firebase Auth
    const userRecord = await admin.auth().createUser({
      uid: userId,
      email: userEmail,
      password: userPassword,
      displayName: userName
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userId).set({
      userName,
      userEmail,
      userBalance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        uid: userId,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);

    switch (error.code) {
      case 'auth/email-already-exists':
        return res.status(400).json({ message: 'Email already registered' });
      case 'auth/invalid-email':
        return res.status(400).json({ message: 'Invalid email format' });
      case 'auth/weak-password':
        return res.status(400).json({ message: 'Password should be at least 6 characters' });
      case 'auth/invalid-display-name':
        return res.status(400).json({ message: 'Invalid username format' });
      default:
        // Log detailed error for debugging
        console.error('Detailed error:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        return res.status(500).json({
          message: 'Server error while registering user',
          error: error.message
        });
    }
  }
}

const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    if (!userEmail || !userPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Note: Server-side login is not typically needed with Firebase Auth
    // Client should use Firebase Auth client SDK for authentication
    // This endpoint can be used to fetch additional user data after client-side auth

    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const userData = await db.collection('users').doc(userRecord.uid).get();

    res.status(200).json({
      message: 'User logged in successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        ...userData.data()
      }
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Error retrieving user data' });
  }
}

module.exports = {
  registerUser,
  loginUser
};
