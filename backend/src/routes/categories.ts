import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = Router();

// GET All Categories
router.get('/', getAllCategories);

// GET Category by ID
router.get('/:id', getCategoryById);

// POST a New Category
router.post('/', createCategory);

// PUT Update Category
router.put('/:id', updateCategory);

// DELETE Category
router.delete('/:id', deleteCategory);

export default router;