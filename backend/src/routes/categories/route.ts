import { Router } from 'express';
import Category from '../../models/Category';
import Role from '../../models/Role';
import CategoryThreeToThrive from '../../models/CategoryThreeToThrive';
import CategoryResult from '../../models/CategoryResult';
import CategoryActionPlan from '../../models/CategoryActionPlan';
import sequelize from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET All Categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        { model: Role },
        { model: CategoryThreeToThrive },
        { model: CategoryResult },
        { model: CategoryActionPlan }
      ]
    });

    // Transform the response to match frontend expectations
    const transformedCategories = categories.map(category => ({
      ...category.toJSON(),
      roles: category.roles?.map(role => ({
        id: role.id,
        name: role.name,
        purpose: role.purpose || "",
        description: role.description || ""
      })),
      threeToThrive: category.CategoryThreeToThrives?.map(item => item.three_to_thrive) || [],
      results: category.CategoryResults?.map(item => item.result) || [],
      actionPlans: category.CategoryActionPlans?.map(item => item.action_plan) || [],
      imageBlob: category.image_blob ? `data:image/jpeg;base64,${Buffer.from(category.image_blob).toString('base64')}` : null,
      description: category.description || "",
      vision: category.vision || "",
      purpose: category.purpose || "",
      resources: category.resources || ""
    }));

    res.json(transformedCategories);
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
    
    // Start a transaction
    const t = await sequelize.transaction();
    
    try {
      // Delete the category and all related data
      await Category.destroy({ 
        where: { id },
        transaction: t
      });
      
      await t.commit();
      
      // Fetch remaining categories
      const remainingCategories = await Category.findAll({
        include: [
          { model: Role },
          { model: CategoryThreeToThrive },
          { model: CategoryResult },
          { model: CategoryActionPlan }
        ]
      });

      // Transform the response to match frontend expectations
      const transformedCategories = remainingCategories.map(category => ({
        ...category.toJSON(),
        roles: category.roles?.map(role => ({
          id: role.id,
          name: role.name,
          purpose: role.purpose || "",
          description: role.description || ""
        })),
        threeToThrive: category.CategoryThreeToThrives?.map(item => item.three_to_thrive) || [],
        results: category.CategoryResults?.map(item => item.result) || [],
        actionPlans: category.CategoryActionPlans?.map(item => item.action_plan) || [],
        imageBlob: category.image_blob ? `data:image/jpeg;base64,${Buffer.from(category.image_blob).toString('base64')}` : null,
        description: category.description || "",
        vision: category.vision || "",
        purpose: category.purpose || "",
        resources: category.resources || ""
      }));

      res.status(200).json(transformedCategories);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// PUT: Update a Category
router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      vision,
      purpose,
      resources,
      color,
      roles,
      threeToThrive,
      results,
      actionPlans,
      imageBlob
    } = req.body;

    console.log('Updating category with data:', {
      id,
      name,
      type,
      description,
      vision,
      purpose,
      resources,
      color,
      roles,
      threeToThrive,
      results,
      actionPlans,
      imageBlob: imageBlob ? 'present' : 'not present'
    });

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Convert base64 image to Buffer if present
    let imageBlobBuffer: Buffer | undefined;
    if (imageBlob) {
      const base64Data = imageBlob.replace(/^data:image\/\w+;base64,/, '');
      imageBlobBuffer = Buffer.from(base64Data, 'base64');
    }

    await category.update({
      name,
      type,
      description,
      vision,
      purpose,
      resources,
      color,
      image_blob: imageBlobBuffer,
      updated_at: new Date()
    }, { transaction: t });

    // Delete existing related data
    await Role.destroy({ where: { category_id: id }, transaction: t });
    await CategoryThreeToThrive.destroy({ where: { category_id: id }, transaction: t });
    await CategoryResult.destroy({ where: { category_id: id }, transaction: t });
    await CategoryActionPlan.destroy({ where: { category_id: id }, transaction: t });

    // Insert new roles
    if (roles && roles.length > 0) {
      const roleValues = roles.map((role: { name: string; purpose?: string; description?: string }) => ({
        id: uuidv4(),
        category_id: id,
        name: role.name,
        purpose: role.purpose || null,
        description: role.description || null,
        created_at: new Date(),
        updated_at: new Date()
      }));
      console.log('Creating roles:', roleValues);
      await Role.bulkCreate(roleValues, { transaction: t });
    }

    // Insert new three to thrive
    if (threeToThrive && threeToThrive.length > 0) {
      const threeToThriveValues = threeToThrive.map((value: string) => ({
        id: uuidv4(),
        category_id: id,
        three_to_thrive: value,
        created_at: new Date(),
        updated_at: new Date()
      }));
      console.log('Creating three to thrive:', threeToThriveValues);
      await CategoryThreeToThrive.bulkCreate(threeToThriveValues, { transaction: t });
    }

    // Insert new results
    if (results && results.length > 0) {
      const resultValues = results.map((value: string) => ({
        id: uuidv4(),
        category_id: id,
        result: value,
        created_at: new Date(),
        updated_at: new Date()
      }));
      console.log('Creating results:', resultValues);
      await CategoryResult.bulkCreate(resultValues, { transaction: t });
    }

    // Insert new action plans
    if (actionPlans && actionPlans.length > 0) {
      const actionPlanValues = actionPlans.map((value: string) => ({
        id: uuidv4(),
        category_id: id,
        action_plan: value,
        created_at: new Date(),
        updated_at: new Date()
      }));
      console.log('Creating action plans:', actionPlanValues);
      await CategoryActionPlan.bulkCreate(actionPlanValues, { transaction: t });
    }

    await t.commit();

    // Fetch the updated category with all related data
    const updatedCategory = await Category.findByPk(id, {
      include: [
        { model: Role },
        { model: CategoryThreeToThrive },
        { model: CategoryResult },
        { model: CategoryActionPlan }
      ]
    });

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found after update' });
    }

    // Transform the response to match frontend expectations
    const response = {
      ...updatedCategory.toJSON(),
      roles: updatedCategory.roles?.map(role => ({
        id: role.id,
        name: role.name,
        purpose: role.purpose || "",
        description: role.description || ""
      })),
      threeToThrive: updatedCategory.CategoryThreeToThrives?.map(item => item.three_to_thrive) || [],
      results: updatedCategory.CategoryResults?.map(item => item.result) || [],
      actionPlans: updatedCategory.CategoryActionPlans?.map(item => item.action_plan) || [],
      imageBlob: updatedCategory.image_blob ? `data:image/jpeg;base64,${Buffer.from(updatedCategory.image_blob).toString('base64')}` : null,
      description: updatedCategory.description || "",
      vision: updatedCategory.vision || "",
      purpose: updatedCategory.purpose || "",
      resources: updatedCategory.resources || ""
    };

    res.status(200).json(response);
  } catch (error) {
    await t.rollback();
    console.error('Error updating category:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    res.status(500).json({ 
      error: 'Failed to update category',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;