const express = require('express');
const { getTransactions, addTransaction, updateTransaction, deleteTransaction } = require('../controllers/Transactions.controller');

const router = express.Router();

router.get('/', getTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
