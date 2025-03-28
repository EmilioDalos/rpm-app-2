import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Category from '../models/Category';
import Role from '../models/Role';

// Define the Role Type
interface RoleType {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  identity_statement?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// GET: Fetch all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Role, as: 'roles' }]
    });

    const roles: RoleType[] = categories.flatMap((category: any) => category.roles || []);
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// GET: Fetch a specific role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    const category = await Category.findByPk(categoryId, {
      include: [{ model: Role, as: 'roles' }]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const role = (category.roles as RoleType[]).find(r => r.id === roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

// POST: Create a new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const roleData: RoleType = req.body;

    const category = await Category.findByPk(categoryId, {
      include: [{ model: Role, as: 'roles' }]
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newRole: RoleType = {
      id: uuidv4(),
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const roles = (category.roles as RoleType[]) || [];
    roles.push(newRole);
    category.roles = roles as any;
    await category.save();

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// PUT: Update a role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    const roleData: Partial<RoleType> = req.body;

    const category = await Category.findByPk(categoryId, {
      include: [{ model: Role, as: 'roles' }]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const roles = (category.roles as RoleType[]) || [];
    const roleIndex = roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const updatedRole = {
      ...roles[roleIndex],
      ...roleData,
      updatedAt: new Date()
    };

    roles[roleIndex] = updatedRole;
    category.roles = roles as any;
    await category.save();

    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// DELETE: Remove a role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { categoryId, roleId } = req.params;
    
    const category = await Category.findByPk(categoryId, {
      include: [{ model: Role, as: 'roles' }]
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const roles = (category.roles as RoleType[]) || [];
    const updatedRoles = roles.filter(r => r.id !== roleId);
    
    if (roles.length === updatedRoles.length) {
      return res.status(404).json({ error: 'Role not found' });
    }

    category.roles = updatedRoles as any;
    await category.save();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};