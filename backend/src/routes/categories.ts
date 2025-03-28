import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// GET all categories
router.get('/', categoryController.getCategories);

// GET category by ID
router.get('/:id', categoryController.getCategoryById);

// POST create new category
router.post('/', categoryController.createCategory);

// PUT update category
router.put('/:id', categoryController.updateCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

export default router; 