const { database } = require('../config/Firebase.config.db');

const generateId = () => {
  return 'TR' + Math.floor(100000 + Math.random() * 900000).toString();
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await database.ref('transactions').once('value');
    res.status(200).json(transactions.val());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
}

const addTransaction = async (req, res) => {
  try {
    const { title, amount, userId, categoryId, type, date } = req.body;

    if (!['Chi tiêu', 'Thu nhập'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const newTransaction = await database.ref('transactions').push({
      title,
      amount: Number(amount),
      userId,
      categoryId,
      type,
      date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'Transaction added successfully!', id: newTransaction.key });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error });
  }
}

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, userId, categoryId, type, date } = req.body;

    if (type && !['Chi tiêu', 'Thu nhập'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const updates = {
      ...(title && { title }),
      ...(amount && { amount: Number(amount) }),
      ...(userId && { userId }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(date && { date }),
      updatedAt: new Date().toISOString()
    };

    await database.ref(`transactions/${id}`).update(updates);
    res.status(200).json({ message: 'Transaction updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error });
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await database.ref(`transactions/${id}`).remove();
    res.status(200).json({ message: 'Transaction deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
}

module.exports = { getTransactions, addTransaction, updateTransaction, deleteTransaction };
