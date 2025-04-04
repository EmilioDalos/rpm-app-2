import { Request, Response } from 'express';
import RPMBlock from '../models/RpmBlock';

export const getRPMBlocks = async (req: Request, res: Response) => {
  try {
    const blocks = await RPMBlock.findAll({
      order: [['order', 'ASC']]
    });
    res.status(200).json(blocks);
  } catch (error) {
    console.error('Error fetching RPM blocks:', error);
    res.status(500).json({ error: 'Failed to fetch RPM blocks' });
  }
};

export const getRPMBlockById = async (req: Request, res: Response) => {
  try {
    const block = await RPMBlock.findByPk(req.params.id);
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    res.json(block);
  } catch (error) {
    console.error('Error fetching RPM block:', error);
    res.status(500).json({ error: 'Failed to fetch RPM block' });
  }
};

export const createRPMBlock = async (req: Request, res: Response) => {
  try {
    const { category_id, result, type, order } = req.body;
    
    // If order is not provided, get the highest order and increment it
    let finalOrder = order;
    if (!order) {
      const highestBlock = await RPMBlock.findOne({
        order: [['order', 'DESC']]
      });
      finalOrder = highestBlock ? highestBlock.order + 1 : 1;
    }

    const block = await RPMBlock.create({
      category_id: category_id || null,
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

export const updateRPMBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, result, type, order } = req.body;

    const block = await RPMBlock.findByPk(id);
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }

    await block.update({
      category_id: category_id || null,
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

export const deleteRPMBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = await RPMBlock.findByPk(id);
    
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