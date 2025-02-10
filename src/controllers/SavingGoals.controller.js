const { database } = require('../config/Firebase.config.db');

const generateId = () => {
  return 'SG' + Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔹 Lấy danh sách mục tiêu tiết kiệm
const getSavingGoals = async (req, res) => {
  try {
    const snapshot = await database.ref('savingGoals').once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'No saving goals found' });
    }
    res.status(200).json(snapshot.val());
  } catch (error) {
    console.error('Error fetching saving goals:', error);
    res.status(500).json({ message: 'Error fetching saving goals' });
  }
};

// 🔹 Lấy danh sách mục tiêu tiết kiệm theo user ID
const getSavingGoalsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const snapshot = await database.ref('savingGoals')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'No saving goals found for this user' });
    }
    res.status(200).json(snapshot.val());
  } catch (error) {
    console.error('Error fetching user saving goals:', error);
    res.status(500).json({ message: 'Error fetching user saving goals', error: error.message });
  }
};

// 🔹 Thêm mục tiêu tiết kiệm mới
const addSavingGoal = async (req, res) => {
  try {
    const { savingName, savingAmount, targetAmount, savingDescription, userId, savingStatus, goalType, dueDate } = req.body;

    // Enhanced input validation
    if (!savingName?.trim()) {
      return res.status(400).json({ message: 'Saving name is required' });
    }
    if (!Number.isFinite(Number(savingAmount)) || savingAmount < 0) {
      return res.status(400).json({ message: 'Invalid saving amount' });
    }
    if (!Number.isFinite(Number(targetAmount)) || targetAmount <= 0) {
      return res.status(400).json({ message: 'Invalid target amount' });
    }
    if (!userId?.trim()) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (goalType && !['short-term', 'long-term'].includes(goalType)) {
      return res.status(400).json({ message: 'Goal type must be either short-term or long-term' });
    }

    const savingId = generateId();
    const newSavingGoal = {
      savingId,
      savingName,
      savingAmount,
      targetAmount,
      savingDescription: savingDescription || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      savingStatus: savingStatus || 'active',
      goalType: goalType || 'short-term',
      dueDate: dueDate || null
    };

    await database.ref(`savingGoals/${savingId}`).set(newSavingGoal);

    res.status(201).json({
      message: 'Saving goal added successfully!',
      data: newSavingGoal
    });
  } catch (error) {
    console.error('Error adding saving goal:', error);
    res.status(500).json({ message: 'Error adding saving goal' });
  }
};

// 🔹 Cập nhật mục tiêu tiết kiệm
const updateSavingGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { savingName, savingAmount, targetAmount, savingDescription, userId, savingStatus, goalType, dueDate } = req.body;

    // Validate goal type
    if (goalType && !['short-term', 'long-term'].includes(goalType)) {
      return res.status(400).json({ message: 'Goal type must be either short-term or long-term' });
    }

    // Kiểm tra mục tiêu có tồn tại không
    const snapshot = await database.ref(`savingGoals/${id}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    const updatedSavingGoal = {
      savingName,
      savingAmount,
      targetAmount,
      savingDescription,
      updatedAt: new Date().toISOString(),
      userId,
      savingStatus,
      goalType: goalType || 'short-term',
      dueDate: dueDate || null
    };

    await database.ref(`savingGoals/${id}`).update(updatedSavingGoal);

    res.status(200).json({ message: 'Saving goal updated successfully!' });
  } catch (error) {
    console.error('Error updating saving goal:', error);
    res.status(500).json({ message: 'Error updating saving goal' });
  }
};

// 🔹 Xóa mục tiêu tiết kiệm
const deleteSavingGoal = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra mục tiêu có tồn tại không
    const snapshot = await database.ref(`savingGoals/${id}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    await database.ref(`savingGoals/${id}`).remove();

    res.status(200).json({ message: 'Saving goal deleted successfully!' });
  } catch (error) {
    console.error('Error deleting saving goal:', error);
    res.status(500).json({ message: 'Error deleting saving goal' });
  }
};

module.exports = {
  getSavingGoals,
  getSavingGoalsByUserId,
  addSavingGoal,
  updateSavingGoal,
  deleteSavingGoal
};
