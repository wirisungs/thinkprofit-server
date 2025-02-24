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

    // Tự động gán role FREE cho người dùng mới
    await admin.auth().setCustomUserClaims(userId, { role: 'FREE' });

    // 💾 Lưu thông tin bổ sung vào Firestore
    await db.collection('users').doc(userId).set({
      userName,
      userEmail,
      userRole: 'FREE', // Mặc định role là FREE
      userBalance: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        uid: userId,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: 'FREE'
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

// 🔑 Đăng nhập người dùng
// Lưu ý 1: Không cần thiết lắm tại vì phần login sẽ nằm ở bên Flutter là chính
const loginUser = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    if (!userEmail || !userPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 📝 Lưu ý 2: Đăng nhập phía máy chủ thường không cần thiết với Firebase Auth
    // 🔒 Client nên sử dụng Firebase Auth SDK để xác thực
    // 📌 Endpoint này có thể được sử dụng để lấy dữ liệu người dùng mà không cần phải thông qua Firebase Auth SDK

    const userRecord = await admin.auth().getUserByEmail(userEmail);
    const userData = await db.collection('users').doc(userRecord.uid).get();

    // Lấy custom claims để kiểm tra role
    const customClaims = await admin.auth().getUser(userRecord.uid);
    const userRole = customClaims.customClaims?.role || 'FREE';

    res.status(200).json({
      message: 'User logged in successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRole,
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

// Thêm hàm mới để nâng cấp tài khoản lên Premium
const upgradeToPremium = async (req, res) => {
  try {
    const { userId } = req.params;

    // Cập nhật custom claims
    await admin.auth().setCustomUserClaims(userId, { role: 'PREMIUM' });

    // Cập nhật thông tin trong Firestore
    await db.collection('users').doc(userId).update({
      userRole: 'PREMIUM',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      message: 'User upgraded to Premium successfully',
      data: { userId, role: 'PREMIUM' }
    });
  } catch (error) {
    console.error('Error upgrading user:', error);
    res.status(500).json({ message: 'Error upgrading user role' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  upgradeToPremium
};
