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
      imageBlob: role.image_blob ? `data:image/jpeg;base64,${role.image_blob.toString('base64')}` : "",
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
    const { categoryId, name, purpose, description, identityStatement, imageBlob, coreQualities, incantations } = req.body;
    console.log('Creating role with data:', JSON.stringify(req.body, null, 2));
    console.log('Image blob present:', !!imageBlob);
    if (imageBlob) {
      console.log('Image blob type:', typeof imageBlob);
      console.log('Image blob length:', imageBlob.length);
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Convert base64 image to Buffer if present
    let imageBlobBuffer: Buffer | undefined;
    if (imageBlob) {
      // Remove the data URL prefix if present
      const base64Data = imageBlob.replace(/^data:image\/\w+;base64,/, '');
      imageBlobBuffer = Buffer.from(base64Data, 'base64');
      console.log('Converted image blob to Buffer:', imageBlobBuffer instanceof Buffer);
      console.log('Buffer length:', imageBlobBuffer.length);
    }

    // Create the role
    const role = await Role.create({
      id: uuidv4(),
      category_id: categoryId,
      name,
      purpose,
      description,
      identity_statement: identityStatement,
      image_blob: imageBlobBuffer
    });

    // Insert core qualities
    if (coreQualities && coreQualities.length > 0) {
      const coreQualitiesValues = coreQualities.map((quality: string) => 
        `('${role.id}', '${quality.replace(/'/g, "''")}')`
      ).join(',');
      
      await sequelize.query(
        `INSERT INTO role_core_quality (role_id, quality) VALUES ${coreQualitiesValues}`
      );
    }

    // Insert incantations
    if (incantations && incantations.length > 0) {
      const incantationsValues = incantations.map((incantation: string) => 
        `('${role.id}', '${incantation.replace(/'/g, "''")}')`
      ).join(',');
      
      await sequelize.query(
        `INSERT INTO role_incantation (role_id, incantation) VALUES ${incantationsValues}`
      );
    }

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
      imageBlob: createdRole.image_blob ? `data:image/jpeg;base64,${createdRole.image_blob.toString('base64')}` : "",
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
    console.log('Updating role with data:', JSON.stringify(roleData, null, 2));
    console.log('Image blob present:', !!roleData.imageBlob);
    if (roleData.imageBlob) {
      console.log('Image blob type:', typeof roleData.imageBlob);
      console.log('Image blob length:', roleData.imageBlob.length);
    }

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      try {
        // Convert base64 image to Buffer if present
        let imageBlob: Buffer | undefined;
        if (roleData.imageBlob) {
          // Remove the data URL prefix if present
          const base64Data = roleData.imageBlob.replace(/^data:image\/\w+;base64,/, '');
          imageBlob = Buffer.from(base64Data, 'base64');
          console.log('Converted image blob to Buffer:', imageBlob instanceof Buffer);
          console.log('Buffer length:', imageBlob.length);
        }

        // First update the role
        const [updated] = await Role.update({
          name: roleData.name,
          purpose: roleData.purpose,
          description: roleData.description,
          identity_statement: roleData.identityStatement,
          category_id: roleData.categoryId,
          image_blob: imageBlob
        }, { 
          where: { id },
          transaction: t
        });

        console.log('Role update result:', updated);

        if (!updated) {
          return null;
        }

        // Delete existing core qualities and incantations
        await sequelize.query(
          'DELETE FROM role_core_quality WHERE role_id = :id',
          { replacements: { id }, transaction: t }
        );
        await sequelize.query(
          'DELETE FROM role_incantation WHERE role_id = :id',
          { replacements: { id }, transaction: t }
        );

        // Insert new core qualities
        if (roleData.coreQualities && roleData.coreQualities.length > 0) {
          const coreQualitiesValues = roleData.coreQualities.map((quality: string) => 
            `('${id}', '${quality.replace(/'/g, "''")}')`
          ).join(',');
          
          await sequelize.query(
            `INSERT INTO role_core_quality (role_id, quality) VALUES ${coreQualitiesValues}`,
            { transaction: t }
          );
        }

        // Insert new incantations
        if (roleData.incantations && roleData.incantations.length > 0) {
          const incantationsValues = roleData.incantations.map((incantation: string) => 
            `('${id}', '${incantation.replace(/'/g, "''")}')`
          ).join(',');
          
          await sequelize.query(
            `INSERT INTO role_incantation (role_id, incantation) VALUES ${incantationsValues}`,
            { transaction: t }
          );
        }

        // Fetch the updated role with all related data
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

        console.log('Updated role data:', JSON.stringify(updatedRole, null, 2));
        return updatedRole;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Transform the data to match frontend structure
    const transformedRole = {
      id: result.id,
      categoryId: result.category_id,
      category: result.category_name,
      name: result.name,
      purpose: result.purpose || "",
      description: result.description || "",
      coreQualities: result.core_qualities || [],
      identityStatement: result.identity_statement || "",
      reflection: "",
      imageBlob: result.image_blob ? `data:image/jpeg;base64,${result.image_blob.toString('base64')}` : "",
      incantations: result.incantations || [],
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };

    res.json(transformedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ 
      error: 'Failed to update role', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE: Remove a role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      try {
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
          type: QueryTypes.SELECT,
          transaction: t
        });

        if (!roleToDelete) {
          return null;
        }

        // Delete related core qualities and incantations
        await sequelize.query(
          'DELETE FROM role_core_quality WHERE role_id = :id',
          { replacements: { id }, transaction: t }
        );
        await sequelize.query(
          'DELETE FROM role_incantation WHERE role_id = :id',
          { replacements: { id }, transaction: t }
        );

        // Delete the role
        await Role.destroy({ 
          where: { id },
          transaction: t
        });

        return roleToDelete;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Transform the data to match frontend structure
    const deletedRole = {
      id: result.id,
      categoryId: result.category_id,
      category: result.category_name,
      name: result.name,
      purpose: result.purpose || "",
      description: result.description || "",
      coreQualities: result.core_qualities || [],
      identityStatement: result.identity_statement || "",
      reflection: "",
      imageBlob: result.image_blob || "",
      incantations: result.incantations || [],
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };

    res.json({ message: 'Role deleted successfully', role: deletedRole });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ 
      error: 'Failed to delete role', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;