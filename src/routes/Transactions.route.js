const express = require('express');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addSampleTransactions
} = require('../controllers/Transactions.controller');

const router = express.Router();

router.get('/', getTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

// Add sample data route
router.post('/sample', addSampleTransactions);

module.exports = router;
