import { Router } from 'express';
import Role from '../../../models/Role';
import Category from '../../../models/Category';

const router = Router();

// GET: Fetch Role by ID with Category Info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({
      where: { id },
      include: [{ model: Category, as: 'category' }]
    });

    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// PUT: Update Role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRole = req.body;

    const result = await Role.update(updatedRole, { where: { id } });

    if (result[0] > 0) {
      const role = await Role.findByPk(id);
      res.json(role);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE: Remove Role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Role.destroy({ where: { id } });

    if (result > 0) {
      res.json({ message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;