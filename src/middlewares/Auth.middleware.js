const { auth, db } = require('../config/Firebase.config.db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'No authorization header provided'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);

    // Get additional user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'User data not found'
      });
    }

    // Combine auth and database user data
    req.user = {
      ...decodedToken,
      ...userDoc.data()
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been revoked'
      });
    }

    return res.status(403).json({
      status: 'error',
      message: 'Invalid authentication credentials',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken
};
