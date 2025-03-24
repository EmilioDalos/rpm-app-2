const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to categories.json file
const categoriesFilePath = path.join(__dirname, '../data/categories.json');

// Helper function to read categories
const readCategories = () => {
  try {
    const data = fs.readFileSync(categoriesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories file:', error);
    return [];
  }
};

// Helper function to write categories
const writeCategories = (categories) => {
  try {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing categories file:', error);
    return false;
  }
};

// Get all categories
exports.getAllCategories = (req, res) => {
  const categories = readCategories();
  res.json(categories);
};

// Get a single category by ID
exports.getCategoryById = (req, res) => {
  const { id } = req.params;
  const categories = readCategories();
  const category = categories.find(cat => cat.id === id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(category);
};

// Create a new category
exports.createCategory = (req, res) => {
  const categories = readCategories();
  const newCategory = {
    ...req.body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  categories.push(newCategory);
  
  if (writeCategories(categories)) {
    res.status(201).json(newCategory);
  } else {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update a category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const categories = readCategories();
  const index = categories.findIndex(cat => cat.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const updatedCategory = {
    ...categories[index],
    ...req.body,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  categories[index] = updatedCategory;
  
  if (writeCategories(categories)) {
    res.json(updatedCategory);
  } else {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;
  const categories = readCategories();
  const filteredCategories = categories.filter(cat => cat.id !== id);
  
  if (filteredCategories.length === categories.length) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  if (writeCategories(filteredCategories)) {
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete category' });
  }
}; 