import { Router } from 'express';
import Category from '../../models/Category';

const router = Router();

// GET All Categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    console.log("categories from backend:", categories);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST a New Category
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    const newCategory = await Category.create({ name, type });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// DELETE a Category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Category.destroy({ where: { id } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// PUT (Update) a Category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const [updated] = await Category.update({ name }, { where: { id } });

    if (updated) {
      const updatedCategory = await Category.findByPk(id);
      res.status(200).json(updatedCategory);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

export default router;