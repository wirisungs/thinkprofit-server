const express = require('express');
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/Categories.controller.js');

const router = express.Router();

router.get('/', getCategories);
router.post('/', addCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
