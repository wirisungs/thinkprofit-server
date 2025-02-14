const { db, admin } = require('../config/Firebase.config.db');

// 🎲 Tạo ID ngẫu nhiên cho giao dịch với tiền tố 'TR'
const generateId = () => {
  return 'TR' + Math.floor(100000 + Math.random() * 900000).toString();
};

// 📋 Lấy tất cả các giao dịch từ database
const getTransactions = async (req, res) => {
  try {
    const transactionsSnapshot = await db.collection('transactions').get();
    const transactions = {};
    transactionsSnapshot.forEach(doc => {
      transactions[doc.id] = doc.data();
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
}

// ➕ Thêm một giao dịch mới vào database
const addTransaction = async (req, res) => {
  try {
    const { title, amount, userId, categoryId, type, date } = req.body;
    const transactionId = generateId();

    if (!['Chi tiêu', 'Thu nhập'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    await db.collection('transactions').doc(transactionId).set({
      id: transactionId,
      title,
      amount: Number(amount),
      userId,
      categoryId,
      type,
      date,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: 'Transaction added successfully!', id: transactionId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error });
  }
}

// 🔄 Cập nhật thông tin của một giao dịch dựa trên ID
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('transactions').doc(id).update(updates);
    res.status(200).json({ message: 'Transaction updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error });
  }
}

// 🗑️ Xóa một giao dịch dựa trên ID
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('transactions').doc(id).delete();
    res.status(200).json({ message: 'Transaction deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
}

// 🧪 Thêm các giao dịch mẫu vào database để test
const addSampleTransactions = async (req, res) => {
  try {
    console.log('Starting to add sample transactions...');

    const sampleData = [
      {
        title: "Lương tháng 12",
        amount: 15000000,
        userId: "user1",
        categoryId: "salary",
        type: "Thu nhập",
        date: new Date().toISOString().split('T')[0] // Today's date
      },
      {
        title: "Tiền điện tháng 12",
        amount: 500000,
        userId: "user1",
        categoryId: "utilities",
        type: "Chi tiêu",
        date: new Date().toISOString().split('T')[0]
      },
      {
        title: "Tiền ăn uống",
        amount: 300000,
        userId: "user1",
        categoryId: "food",
        type: "Chi tiêu",
        date: new Date().toISOString().split('T')[0]
      }
    ];

    // Validate data before processing
    for (const transaction of sampleData) {
      if (!transaction.title || !transaction.amount || !transaction.userId ||
          !transaction.categoryId || !transaction.type || !transaction.date) {
        throw new Error('Missing required fields in sample data');
      }
      if (!['Chi tiêu', 'Thu nhập'].includes(transaction.type)) {
        throw new Error('Invalid transaction type in sample data');
      }
    }

    console.log('Data validation passed, creating batch...');
    const batch = admin.firestore().batch();  // Changed this line

    for (const transaction of sampleData) {
      const transactionId = generateId();
      const docRef = db.collection('transactions').doc(transactionId);
      console.log(`Adding transaction with ID: ${transactionId}`);

      const docData = {
        id: transactionId,
        ...transaction,
        amount: Number(transaction.amount),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(docRef, docData);  // Changed to use batch variable
    }

    console.log('Committing batch...');
    await batch.commit();  // Changed to use batch variable
    console.log('Batch committed successfully');

    res.status(201).json({
      message: 'Sample transactions added successfully!',
      count: sampleData.length
    });
  } catch (error) {
    console.error('Error in addSampleTransactions:', error);
    res.status(500).json({
      message: 'Error adding sample transactions',
      error: error.message || 'Unknown error occurred'
    });
  }
}

// 📦 Export các hàm để sử dụng trong routes
module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addSampleTransactions
};
