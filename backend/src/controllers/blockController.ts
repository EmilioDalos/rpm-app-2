import { Request, Response } from 'express';
import RpmBlock from '../models/RpmBlock';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';

export const createBlock = async (req: Request, res: Response) => {
  try {
    const { name, type, order, categoryId } = req.body;

    if (!name || !type || !order) {
      return res.status(400).json({ error: 'Name, type, and order are required' });
    }

    const block = await RpmBlock.create({
      result: name,
      type,
      order,
      categoryId
    });

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ error: 'Failed to create block' });
  }
};
