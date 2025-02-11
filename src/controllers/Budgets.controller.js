const { db } = require('../config/Firebase.config.db');
const admin = require('firebase-admin');

const generateId = () => {
  return 'BG' + Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔹 Lấy tất cả ngân sách
const getBudgets = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = db.collection('budgets');

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No budgets found' });
    }

    const budgets = {};
    snapshot.forEach(doc => {
      budgets[doc.id] = doc.data();
    });
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
    const overlappingBudgets = await db.collection('budgets')
      .where('categoryId', '==', categoryId)
      .where('userId', '==', userId)
      .get();

    const isOverlapping = overlappingBudgets.docs.some(doc => {
      const budget = doc.data();
      return (
        (new Date(startDate) >= new Date(budget.startDate) && new Date(startDate) <= new Date(budget.endDate)) ||
        (new Date(endDate) >= new Date(budget.startDate) && new Date(endDate) <= new Date(budget.endDate))
      );
    });

    if (isOverlapping) {
      return res.status(400).json({ message: 'A budget already exists for this category during the specified period' });
    }

    const budgetId = generateId();
    const newBudget = {
      budgetId,
      userId,
      budgetAmount,
      remainingAmount: budgetAmount,
      startDate,
      endDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      categoryId,
      budgetStatus: budgetStatus || 'active'
    };

    await db.collection('budgets').doc(budgetId).set(newBudget);

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

    const budgetRef = await db.collection('budgets').doc(id).get();
    if (!budgetRef.exists) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const currentBudget = budgetRef.data();
    const newBudgetAmount = budgetAmount || currentBudget.budgetAmount;

    // Calculate new remaining amount proportionally
    const remainingAmount = budgetAmount
      ? (currentBudget.remainingAmount / currentBudget.budgetAmount) * newBudgetAmount
      : currentBudget.remainingAmount;

    const updates = {
      budgetAmount: newBudgetAmount,
      remainingAmount,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(categoryId && { categoryId }),
      ...(budgetStatus && { budgetStatus }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('budgets').doc(id).update(updates);

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

    const budgetRef = await db.collection('budgets').doc(id).get();
    if (!budgetRef.exists) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await db.collection('budgets').doc(id).delete();

    res.status(200).json({ message: 'Budget deleted successfully!' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
};

module.exports = { getBudgets, addBudget, updateBudget, deleteBudget };
