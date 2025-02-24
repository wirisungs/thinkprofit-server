const { db } = require('../config/Firebase.config.db.js');
const admin = require('firebase-admin');

// 🎲 Tạo ID ngẫu nhiên cho danh mục
const generateId = () => {
  return 'CG' + Math.floor(100000 + Math.random() * 900000).toString();
};

// 📋 Lấy danh sách tất cả danh mục của người dùng
const getCategories = async (req, res) => {
  try {
    const userId = req.user.uid;
    const categoriesSnapshot = await db.collection('categories')
      .where('userId', '==', userId)
      .get();

    const categories = {};
    categoriesSnapshot.forEach(doc => {
      categories[doc.id] = doc.data();
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
}

// ➕ Thêm danh mục mới
// 🔍 Kiểm tra:
// - Tên danh mục và loại danh mục không được trống
// - Loại danh mục phải là "Sinh hoạt" hoặc "Cá nhân"
// - Tên danh mục không được trùng lặp
const addCategory = async (req, res) => {
  try {
    const { cateName, cateDescription, type } = req.body;
    const userId = req.user.uid;
    const userRole = req.user.role || 'FREE';

    // Check if user is premium
    if (userRole !== 'PREMIUM') {
      return res.status(403).json({
        success: false,
        message: 'Only premium users can create custom categories'
      });
    }

    if (!cateName || !type) {
      return res.status(400).json({ success: false, message: 'Category name and type are required' });
    }

    if (type !== 'Sinh hoạt' && type !== 'Cá nhân') {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "Sinh hoạt" or "Cá nhân".' });
    }

    const existingCategory = await db.collection('categories')
      .where('cateName', '==', cateName)
      .where('userId', '==', userId)
      .get();

    if (!existingCategory.empty) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const cateId = generateId();
    await db.collection('categories').doc(cateId).set({
      id: cateId,
      userId,
      cateName,
      cateDescription: cateDescription || '',
      type,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully!',
      data: { id: cateId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding category', error: error.message });
  }
}

// 🔄 Cập nhật thông tin danh mục
// 🔍 Kiểm tra:
// - Danh mục phải tồn tại
// - Tên và loại danh mục không được trống
// - Loại danh mục phải hợp lệ
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cateName, cateDescription, type } = req.body;
    const userRole = req.user.role || 'FREE';

    // Check if user is premium
    if (userRole !== 'PREMIUM') {
      return res.status(403).json({
        success: false,
        message: 'Only premium users can update categories'
      });
    }

    const categoryRef = await db.collection('categories').doc(id).get();
    if (!categoryRef.exists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (!cateName || !type) {
      return res.status(400).json({ success: false, message: 'Category name and type are required' });
    }

    if (type !== 'Sinh hoạt' && type !== 'Cá nhân') {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "Sinh hoạt" or "Cá nhân".' });
    }

    await db.collection('categories').doc(id).update({
      cateName,
      cateDescription: cateDescription || '',
      type,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'Category updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
  }
}

// 🗑️ Xóa danh mục
// 🔍 Kiểm tra danh mục tồn tại trước khi xóa
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role || 'FREE';

    // Check if user is premium
    if (userRole !== 'PREMIUM') {
      return res.status(403).json({
        success: false,
        message: 'Only premium users can delete categories'
      });
    }

    const categoryRef = await db.collection('categories').doc(id).get();
    if (!categoryRef.exists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await db.collection('categories').doc(id).delete();
    res.status(200).json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
}

module.exports = { getCategories, addCategory, updateCategory, deleteCategory };
