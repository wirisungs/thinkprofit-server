const express = require('express');
const { getBudgets, addBudget, updateBudget, deleteBudget } = require('../controllers/Budgets.controller');

const router = express.Router();

router.get('/', getBudgets);
router.post('/add/', addBudget);
router.put('/:id', updateBudget);
router.delete('/delete/:id', deleteBudget);

module.exports = router;
