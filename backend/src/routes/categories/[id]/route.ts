import { Router, Request, Response, RequestHandler } from 'express';
import Category, { CategoryCreationAttributes } from '../../../models/Category';

interface CategoryParams {
  id?: string;
}

interface CategoryBody {
  name: string;
  type: 'personal' | 'professional';
  description: string;
  vision: string;
  purpose: string;
  roles?: any[];
  threeToThrive: string[];
  resources: string;
  results: string[];
  actionPlans: string[];
  imageBlob?: string;
}

const router = Router();

// GET /api/categories
const getAllCategories: RequestHandler = async (_req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// GET /api/categories/:id
const getCategoryById: RequestHandler<CategoryParams> = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// POST /api/categories
const createCategory: RequestHandler<{}, {}, CategoryBody> = async (req, res) => {
  try {
    const category = await Category.create(req.body as CategoryCreationAttributes);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// PUT /api/categories/:id
const updateCategory: RequestHandler<CategoryParams, {}, CategoryBody> = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    await category.update(req.body as CategoryCreationAttributes);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// DELETE /api/categories/:id
const deleteCategory: RequestHandler<CategoryParams> = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;