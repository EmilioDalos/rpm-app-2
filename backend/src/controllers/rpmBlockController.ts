import { Request, Response } from 'express';
import RpmBlock from '../models/RpmBlock';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import RpmBlockPurpose from '../models/RpmBlockPurpose';
import Category from '../models/Category';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';

export const getRpmBlocks = async (req: Request, res: Response) => {
  try {
    const blocks = await RpmBlock.findAll({
      nest: true,
      include: [
        { model: RpmBlockMassiveAction, as: 'rpmMassiveActions' },
        { model: RpmBlockPurpose, as: 'rpmBlockPurpose' },
        { model: Category, as: 'category' },
      ],
    });
    // const formattedBlocks= blocks.map(category => ({
    //   ...category,
    //   updatedAt: category.updated_at, // Zorg ervoor dat je de juiste naam gebruikt
    // }));

    // Sanitize the blocks
    console.log(typeof blocks[0]);              // object
    console.log(blocks[0].constructor.name);    // RpmBlock?
    const cleanBlocks = blocks.map((block) => sanitizeSequelizeModel(block));
    res.status(200).json(cleanBlocks);   
  } catch (error) {
    console.error('Error fetching RPM blocks:', error);
    res.status(500).json({ error: 'Failed to fetch RPM blocks' });
  }
};

export const getRpmBlockById = async (req: Request, res: Response) => {
  try {
    const block = await RpmBlock.findByPk(req.params.id);
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    res.json(block);
  } catch (error) {
    console.error('Error fetching RPM block:', error);
    res.status(500).json({ error: 'Failed to fetch RPM block' });
  }
};

export const createRpmBlock = async (req: Request, res: Response) => {
  try {
    const { category_id, result, type, order } = req.body;
    
    // If order is not provided, get the highest order and increment it
    let finalOrder = order;
    if (!order) {
      const highestBlock = await RpmBlock.findOne({
        order: [['order', 'DESC']]
      });
      finalOrder = highestBlock ? highestBlock.order + 1 : 1;
    }

    const block = await RpmBlock.create({
      categoryId: category_id || null,
      result,
      type,
      order: finalOrder
    });

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating RPM block:', error);
    res.status(500).json({ 
      error: 'Failed to create RPM block',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateRpmBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, result, type, order } = req.body;

    const block = await RpmBlock.findByPk(id);
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }

    await block.update({
      categoryId: category_id || null,
      result,
      type,
      order
    });

    res.json(block);
  } catch (error) {
    console.error('Error updating RPM block:', error);
    res.status(500).json({ error: 'Failed to update RPM block' });
  }
};

export const deleteRpmBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = await RpmBlock.findByPk(id);
    
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }

    await block.destroy();
    res.json({ message: 'RPM block deleted successfully', block });
  } catch (error) {
    console.error('Error deleting RPM block:', error);
    res.status(500).json({ error: 'Failed to delete RPM block' });
  }
};