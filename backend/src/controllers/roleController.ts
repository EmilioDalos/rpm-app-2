import { Request, Response } from 'express';
import Category from '../models/Category';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();
    const roles = categories.flatMap(category => category.roles || []);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    const category = await Category.findByPk(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const role = category.roles?.find(r => r.id === roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const roleData = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newRole = {
      id: Date.now().toString(),
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    category.roles = [...(category.roles || []), newRole];
    await category.save();

    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    const roleData = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const roleIndex = category.roles?.findIndex(r => r.id === roleId);
    if (roleIndex === undefined || roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const updatedRole = {
      ...category.roles[roleIndex],
      ...roleData,
      id: roleId,
      updatedAt: new Date()
    };

    category.roles[roleIndex] = updatedRole;
    await category.save();

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const roleIndex = category.roles?.findIndex(r => r.id === roleId);
    if (roleIndex === undefined || roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    category.roles = category.roles.filter(r => r.id !== roleId);
    await category.save();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
}; 