const { database } = require('../config/Firebase.config.db');

const generateId = () => {
  return 'BG' + Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔹 Lấy tất cả ngân sách
const getBudgets = async (req, res) => {
  try {
    const { userId } = req.query;
    const snapshot = await database.ref('budgets').once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'No budgets found' });
    }

    const budgets = snapshot.val();
    if (userId) {
      const filteredBudgets = Object.values(budgets).filter(budget => budget.userId === userId);
      return res.status(200).json(filteredBudgets);
    }
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Error fetching budgets' });
  }
};

// 🔹 Thêm ngân sách mới
const addBudget = async (req, res) => {
  try {
    const { userId, budgetAmount, startDate, endDate, categoryId, budgetStatus } = req.body;
    if (!userId || !budgetAmount || !startDate || !endDate || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (budgetAmount <= 0) {
      return res.status(400).json({ message: 'Budget amount must be greater than 0' });
    }

    // Check for overlapping budgets in the same category
    const snapshot = await database.ref('budgets').once('value');
    if (snapshot.exists()) {
      const budgets = Object.values(snapshot.val());
      const overlapping = budgets.some(budget =>
        budget.categoryId === categoryId &&
        budget.userId === userId &&
        ((new Date(startDate) >= new Date(budget.startDate) && new Date(startDate) <= new Date(budget.endDate)) ||
         (new Date(endDate) >= new Date(budget.startDate) && new Date(endDate) <= new Date(budget.endDate)))
      );

      if (overlapping) {
        return res.status(400).json({ message: 'A budget already exists for this category during the specified period' });
      }
    }

    const budgetId = generateId();
    const newBudget = {
      budgetId,
      userId,
      budgetAmount,
      remainingAmount: budgetAmount,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId,
      budgetStatus: budgetStatus || 'active'
    };

    await database.ref(`budgets/${budgetId}`).set(newBudget);

    res.status(201).json({ message: 'Budget added successfully!', id: budgetId });
  } catch (error) {
    console.error('Error adding budget:', error);
    res.status(500).json({ message: 'Error adding budget' });
  }
};

// 🔹 Cập nhật ngân sách
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { budgetAmount, startDate, endDate, categoryId, budgetStatus } = req.body;

    // Kiểm tra xem budget có tồn tại không
    const snapshot = await database.ref(`budgets/${id}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const currentBudget = snapshot.val();
    const newBudgetAmount = budgetAmount || currentBudget.budgetAmount;

    // Calculate new remaining amount proportionally
    const remainingAmount = budgetAmount
      ? (currentBudget.remainingAmount / currentBudget.budgetAmount) * newBudgetAmount
      : currentBudget.remainingAmount;

    const updatedBudget = {
      budgetAmount: newBudgetAmount,
      remainingAmount,
      startDate: startDate || currentBudget.startDate,
      endDate: endDate || currentBudget.endDate,
      updatedAt: new Date().toISOString(),
      categoryId: categoryId || currentBudget.categoryId,
      budgetStatus: budgetStatus || currentBudget.budgetStatus
    };

    await database.ref(`budgets/${id}`).update(updatedBudget);

    res.status(200).json({ message: 'Budget updated successfully!' });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget' });
  }
};

// 🔹 Xóa ngân sách
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem budget có tồn tại không
    const snapshot = await database.ref(`budgets/${id}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await database.ref(`budgets/${id}`).remove();

    res.status(200).json({ message: 'Budget deleted successfully!' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
};

module.exports = { getBudgets, addBudget, updateBudget, deleteBudget };
