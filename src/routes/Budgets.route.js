const express = require('express');
const { getBudgets, addBudgets, updateBudgets, deleteBudgets } = require('../controllers/Budgets.controller');

const router = express.Router();

router.get('/', getBudgets);
router.post('/add/', addBudgets);
router.put('/:id', updateBudgets);
router.delete('/delete/:id', deleteBudgets);

module.exports = router;
