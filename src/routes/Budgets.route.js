const express = require('express');
const { getBudgets, addBudget, updateBudget, deleteBudget } = require('../controllers/Budgets.controller');
const { verifyToken } = require('../middlewares/Auth.middleware');

const router = express.Router();

router.get('/', getBudgets, verifyToken);
router.post('/add/', addBudget, verifyToken);
router.put('/:id', updateBudget, verifyToken);
router.delete('/delete/:id', deleteBudget, verifyToken);

module.exports = router;
