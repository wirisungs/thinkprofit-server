const express = require('express');
const {
  getSavingGoals,
  getSavingGoalsByUserId,
  addSavingGoal,
  updateSavingGoal,
  deleteSavingGoal
} = require('../controllers/SavingGoals.controller');

const router = express.Router();

router.get('/', getSavingGoals);
router.get('/user/:userId', getSavingGoalsByUserId);
router.post('/', addSavingGoal);
router.put('/:id', updateSavingGoal);
router.delete('/:id', deleteSavingGoal);

module.exports = router;
