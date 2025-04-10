import { Request, Response } from 'express';
import Category from '../models/Category';
import Role from '../models/Role';
import CategoryThreeToThrive from '../models/CategoryThreeToThrive';
import CategoryResult from '../models/CategoryResult';
import CategoryActionPlan from '../models/CategoryActionPlan';
import sequelize from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { isUUID } from 'validator';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // Eerst proberen we alleen de basis categorieën op te halen
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'type', 'description', 'vision', 'purpose', 'resources'],
      order: [['name', 'ASC']]
    });

    // Transformeer de data op een veilige manier
    const transformedCategories = categories.map(category => {
      const plainCategory = category.get({ plain: true });
      return {
        id: plainCategory.id,
        name: plainCategory.name,
        type: plainCategory.type,
        description: plainCategory.description || "",
        vision: plainCategory.vision || "",
        purpose: plainCategory.purpose || "",
        resources: plainCategory.resources || ""
      };
    });

    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // UUID validatie
    if (!isUUID(id)) {
      return res.status(400).json({ error: 'Invalid category ID format (must be UUID)' });
    }

    const category = await Category.findByPk(id, {
      include: [
        { model: Role, as: 'roles' },
        { model: CategoryThreeToThrive, as: 'CategoryThreeToThrives' },
        { model: CategoryResult, as: 'CategoryResults' },
        { model: CategoryActionPlan, as: 'CategoryActionPlans' }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const transformedCategory = {
      ...category.toJSON(),
      roles: category.roles?.map(role => ({
        id: role.id,
        name: role.name,
        purpose: role.purpose || "",
        description: role.description || ""
      })),
      threeToThrive: category.CategoryThreeToThrives?.map(item => item.threeToThrive) || [],
      results: category.CategoryResults?.map(item => item.result) || [],
      actionPlans: category.CategoryActionPlans?.map(item => item.actionPlan) || [],
      imageBlob: category.imageBlob ? `data:image/jpeg;base64,${Buffer.from(category.imageBlob).toString('base64')}` : null,
      description: category.description || "",
      vision: category.vision || "",
      purpose: category.purpose || "",
      resources: category.resources || ""
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const newCategory = await Category.create({ name, type });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update(updateData);
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}; 