const { db } = require('../config/Firebase.config.db.js');
const admin = require('firebase-admin');

const generateId = () => {
  return 'CG' + Math.floor(100000 + Math.random() * 900000).toString();
};

const getCategories = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming you have user auth middleware
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

const addCategory = async (req, res) => {
  try {
    const { cateName, cateDescription, type } = req.body;
    const userId = req.user.uid; // Assuming you have user auth middleware

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

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cateName, cateDescription, type } = req.body;

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

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
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
