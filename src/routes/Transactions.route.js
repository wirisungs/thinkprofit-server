const express = require('express');
const { verifyToken } = require('../middlewares/Auth.middleware');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addSampleTransactions
} = require('../controllers/Transactions.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Protected routes with role-based access
router.get('/', getTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

// Development only routes - should be disabled in production
if (process.env.NODE_ENV === 'development') {
  router.post('/sample', async (req, res, next) => {
    const adminId = req.user.uid;
    const adminDoc = await db.collection('users').doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }, addSampleTransactions);
}

module.exports = router;
