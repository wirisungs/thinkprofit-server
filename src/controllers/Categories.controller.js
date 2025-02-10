import { database } from '../config/Firebase.config.db.js';

const generateId = () => {
  return 'CG' + Math.floor(100000 + Math.random() * 900000).toString();
};

const getCategories = async (req, res) => {
  try {
    const categories = await database.ref('categories').once('value');
    const categoriesData = categories.val();
    if (!categoriesData) {
      return res.status(200).json({});
    }
    res.status(200).json(categoriesData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
}

const addCategory = async (req, res) => {
  try {
    const { cateName, cateDescription, type } = req.body;

    // Validate required fields
    if (!cateName || !type) {
      return res.status(400).json({ success: false, message: 'Category name and type are required' });
    }

    if (type !== 'Sinh hoạt' && type !== 'Cá nhân') {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "Sinh hoạt" or "Cá nhân".' });
    }

    // Check for existing category with same name
    const existingCategories = await database.ref('categories')
      .orderByChild('cateName')
      .equalTo(cateName)
      .once('value');

    if (existingCategories.val()) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const newCategory = await database.ref('categories').push({
      cateId: generateId(),
      cateName,
      cateDescription: cateDescription || '',
      type,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully!',
      data: { id: newCategory.key }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding category', error: error.message });
  }
}

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cateName, cateDescription, type } = req.body;

    // Check if category exists
    const categoryRef = await database.ref(`categories/${id}`).once('value');
    if (!categoryRef.exists()) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (!cateName || !type) {
      return res.status(400).json({ success: false, message: 'Category name and type are required' });
    }

    if (type !== 'Sinh hoạt' && type !== 'Cá nhân') {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "Sinh hoạt" or "Cá nhân".' });
    }

    await database.ref(`categories/${id}`).update({
      cateName,
      cateDescription: cateDescription || '',
      type,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Category updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating category', error: error.message });
  }
}

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryRef = await database.ref(`categories/${id}`).once('value');
    if (!categoryRef.exists()) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await database.ref(`categories/${id}`).remove();
    res.status(200).json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
}

export { getCategories, addCategory, updateCategory, deleteCategory };
