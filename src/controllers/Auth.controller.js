const { db } = require('../config/Firebase.config.db');
const admin = require('firebase-admin');

// 🔑 Tạo ID ngẫu nhiên cho người dùng
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

    // 👤 Tạo người dùng mới với Firebase Auth
    const userRecord = await admin.auth().createUser({
      uid: userId,
      email: userEmail,
      password: userPassword,
      displayName: userName
    });

    // 💾 Lưu thông tin bổ sung vào Firestore
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
    console.error('Error registering usser:', error);

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
        // 🐛 Ghi log chi tiết để gỡ lỗi
        console.error('Error detail:', {
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

    // 📝 Lưu ý: Đăng nhập phía máy chủ thường không cần thiết với Firebase Auth
    // 🔒 Client nên sử dụng Firebase Auth SDK để xác thực
    // 📌 Endpoint này có thể được sử dụng để lấy thêm dữ liệu người dùng sau khi xác thực phía client

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
    console.error('❌ Error when fetch user:', error);
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
