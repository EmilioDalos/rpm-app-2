import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Category from '../../models/Category';
import Role from '../../models/Role';
import sequelize from '../../config/db';
import { QueryTypes } from 'sequelize';

interface RoleWithRelations {
  id: string;
  category_id: string;
  category_name: string;
  category_type: string;
  name: string;
  purpose: string | null;
  description: string | null;
  identity_statement: string | null;
  image_blob: Buffer | null;
  core_qualities: string[];
  incantations: string[];
  created_at: Date;
  updated_at: Date;
}

const router = Router();

// GET: Fetch all roles with category info and related data
router.get('/', async (req, res) => {
  try {
    console.log('Fetching roles...');
    
    // Get roles with their categories and related data using a raw query
    const roles = await sequelize.query<RoleWithRelations>(`
      WITH role_data AS (
        SELECT 
          r.*,
          c.name as category_name,
          c.type as category_type,
          (
            SELECT COALESCE(json_agg(DISTINCT quality), '[]'::json)
            FROM role_core_quality rcq
            WHERE rcq.role_id = r.id
          ) as core_qualities,
          (
            SELECT COALESCE(json_agg(DISTINCT incantation), '[]'::json)
            FROM role_incantation ri
            WHERE ri.role_id = r.id
          ) as incantations
        FROM role r
        JOIN category c ON r.category_id = c.id
      )
      SELECT * FROM role_data;
    `, {
      type: QueryTypes.SELECT
    });

    console.log('Found roles:', JSON.stringify(roles, null, 2));

    if (!roles || roles.length === 0) {
      console.log('No roles found in database');
      return res.json([]);
    }

    // Transform the data
    const transformedRoles = roles.map(role => ({
      id: role.id,
      categoryId: role.category_id,
      category: role.category_name,
      name: role.name,
      purpose: role.purpose || "",
      description: role.description || "",
      coreQualities: role.core_qualities || [],
      identityStatement: role.identity_statement || "",
      reflection: "",
      imageBlob: role.image_blob || "",
      incantations: role.incantations || [],
      createdAt: role.created_at,
      updatedAt: role.updated_at
    }));

    console.log('Transformed roles:', JSON.stringify(transformedRoles, null, 2));
    res.json(transformedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST: Add a new role
router.post('/', async (req, res) => {
  try {
    const { categoryId, name, purpose, description, identityStatement } = req.body;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create the role
    const role = await Role.create({
      id: uuidv4(),
      category_id: categoryId,
      name,
      purpose,
      description,
      identity_statement: identityStatement
    });

    // Fetch the created role with all related data
    const [createdRole] = await sequelize.query<RoleWithRelations>(`
      WITH role_data AS (
        SELECT 
          r.*,
          c.name as category_name,
          c.type as category_type,
          (
            SELECT COALESCE(json_agg(DISTINCT quality), '[]'::json)
            FROM role_core_quality rcq
            WHERE rcq.role_id = r.id
          ) as core_qualities,
          (
            SELECT COALESCE(json_agg(DISTINCT incantation), '[]'::json)
            FROM role_incantation ri
            WHERE ri.role_id = r.id
          ) as incantations
        FROM role r
        JOIN category c ON r.category_id = c.id
        WHERE r.id = :id
      )
      SELECT * FROM role_data;
    `, {
      replacements: { id: role.id },
      type: QueryTypes.SELECT
    });

    if (!createdRole) {
      return res.status(500).json({ error: 'Role created but failed to fetch details' });
    }

    // Transform the data to match frontend structure
    const transformedRole = {
      id: createdRole.id,
      categoryId: createdRole.category_id,
      category: createdRole.category_name,
      name: createdRole.name,
      purpose: createdRole.purpose || "",
      description: createdRole.description || "",
      coreQualities: createdRole.core_qualities || [],
      identityStatement: createdRole.identity_statement || "",
      reflection: "",
      imageBlob: createdRole.image_blob || "",
      incantations: createdRole.incantations || [],
      createdAt: createdRole.created_at,
      updatedAt: createdRole.updated_at
    };

    res.status(201).json(transformedRole);
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(500).json({ error: 'Failed to add role' });
  }
});

// PUT: Update an existing role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const roleData = req.body;

    // First update the role
    const [updated] = await Role.update({
      name: roleData.name,
      purpose: roleData.purpose,
      description: roleData.description,
      identity_statement: roleData.identityStatement,
      category_id: roleData.categoryId
    }, { 
      where: { id } 
    });

    if (!updated) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Then fetch the updated role with all related data
    const [updatedRole] = await sequelize.query<RoleWithRelations>(`
      WITH role_data AS (
        SELECT 
          r.*,
          c.name as category_name,
          c.type as category_type,
          (
            SELECT COALESCE(json_agg(DISTINCT quality), '[]'::json)
            FROM role_core_quality rcq
            WHERE rcq.role_id = r.id
          ) as core_qualities,
          (
            SELECT COALESCE(json_agg(DISTINCT incantation), '[]'::json)
            FROM role_incantation ri
            WHERE ri.role_id = r.id
          ) as incantations
        FROM role r
        JOIN category c ON r.category_id = c.id
        WHERE r.id = :id
      )
      SELECT * FROM role_data;
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found after update' });
    }

    // Transform the data to match frontend structure
    const transformedRole = {
      id: updatedRole.id,
      categoryId: updatedRole.category_id,
      category: updatedRole.category_name,
      name: updatedRole.name,
      purpose: updatedRole.purpose || "",
      description: updatedRole.description || "",
      coreQualities: updatedRole.core_qualities || [],
      identityStatement: updatedRole.identity_statement || "",
      reflection: "",
      imageBlob: updatedRole.image_blob || "",
      incantations: updatedRole.incantations || [],
      createdAt: updatedRole.created_at,
      updatedAt: updatedRole.updated_at
    };

    res.json(transformedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE: Remove a role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First fetch the role to return its data after deletion
    const [roleToDelete] = await sequelize.query<RoleWithRelations>(`
      WITH role_data AS (
        SELECT 
          r.*,
          c.name as category_name,
          c.type as category_type,
          (
            SELECT COALESCE(json_agg(DISTINCT quality), '[]'::json)
            FROM role_core_quality rcq
            WHERE rcq.role_id = r.id
          ) as core_qualities,
          (
            SELECT COALESCE(json_agg(DISTINCT incantation), '[]'::json)
            FROM role_incantation ri
            WHERE ri.role_id = r.id
          ) as incantations
        FROM role r
        JOIN category c ON r.category_id = c.id
        WHERE r.id = :id
      )
      SELECT * FROM role_data;
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (!roleToDelete) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Delete the role
    await Role.destroy({ where: { id } });

    // Transform the data to match frontend structure
    const deletedRole = {
      id: roleToDelete.id,
      categoryId: roleToDelete.category_id,
      category: roleToDelete.category_name,
      name: roleToDelete.name,
      purpose: roleToDelete.purpose || "",
      description: roleToDelete.description || "",
      coreQualities: roleToDelete.core_qualities || [],
      identityStatement: roleToDelete.identity_statement || "",
      reflection: "",
      imageBlob: roleToDelete.image_blob || "",
      incantations: roleToDelete.incantations || [],
      createdAt: roleToDelete.created_at,
      updatedAt: roleToDelete.updated_at
    };

    res.json({ message: 'Role deleted successfully', role: deletedRole });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;