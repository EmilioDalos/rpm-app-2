import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RPMBlock from '../../models/RpmBlock';
import sequelize from '../../config/db';
import RpmBlockMassiveAction from '@/models/RpmBlockMassiveAction';
import RpmBlockPurpose from '@/models/RpmBlockPurpose';

const router = Router();

// GET: Fetch all RPM blocks
router.get('/', async (req, res) => {
  try {
    const blocks = await RPMBlock.findAll({
      include: [
        { model: RpmBlockMassiveAction },
        { model: RpmBlockPurpose },
      ],
      order: [['created_at', 'ASC']]
    });
    res.json(blocks);
  } catch (error) {
    console.error('Error fetching RPM blocks:', error);
    res.status(500).json({ error: 'Failed to fetch RPM blocks' });
  }
});

// GET: Fetch a single RPM block by ID
router.get('/:id', async (req, res) => {
  try {
    const block = await RPMBlock.findByPk(req.params.id, {
      include: [
        { model: RpmBlockMassiveAction },
        { model: RpmBlockPurpose },
      ]
    });

   if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    res.json(block);
  } catch (error) {
    console.error('Error fetching RPM block:', error);
    res.status(500).json({ error: 'Failed to fetch RPM block' });
  }
});

// POST: Create a new RPM block
router.post('/', async (req, res) => {
  try {
    const { title, description, type, content, order, categoryId, result, saved } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // If order is not provided, get the highest order and increment
      let finalOrder = order;
      if (order === undefined) {
        const maxOrder = await RPMBlock.max('order', { transaction: t });
        finalOrder = (maxOrder || 0) + 1;
      }

      // Create the block
      const block = await RPMBlock.create({
        id: uuidv4(),
        title,
        description,
        type,
        content,
        order: finalOrder,
        categoryId,
        result,
        saved,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      return block;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating RPM block:', error);
    res.status(500).json({ error: 'Failed to create RPM block' });
  }
});

// PUT: Update an existing RPM block
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, content, order } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const block = await RPMBlock.findByPk(id);
      if (!block) {
        return null;
      }

      await block.update({
        title,
        description,
        type,
        content,
        order,
        updated_at: new Date()
      }, { transaction: t });

      return block;
    });

    if (!result) {
      return res.status(404).json({ error: 'RPM block not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating RPM block:', error);
    res.status(500).json({ error: 'Failed to update RPM block' });
  }
});

// DELETE: Remove an RPM block
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const block = await RPMBlock.findByPk(id);
      if (!block) {
        return null;
      }

      await block.destroy({ transaction: t });
      return block;
    });

    if (!result) {
      return res.status(404).json({ error: 'RPM block not found' });
    }

    res.json({ message: 'RPM block deleted successfully', block: result });
  } catch (error) {
    console.error('Error deleting RPM block:', error);
    res.status(500).json({ error: 'Failed to delete RPM block' });
  }
});

export default router;
