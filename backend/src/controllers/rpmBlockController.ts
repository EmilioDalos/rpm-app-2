import { Request, Response } from 'express';
import RpmBlock from '../models/RpmBlock';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import RpmBlockPurpose from '../models/RpmBlockPurpose';
import Category from '../models/Category';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import sequelize from '../config/db';

interface MassiveAction {
  text: string;
  leverage?: string;
  durationAmount?: number;
  durationUnit?: string;
  priority?: number;
  key?: string;
}

interface Purpose {
  purpose: string;
}

export const getRpmBlocks = async (req: Request, res: Response) => {
  try {
    const blocks = await RpmBlock.findAll({
      include: [
        { model: RpmBlockMassiveAction, as: 'rpmBlockMassiveActions' },
        { model: RpmBlockPurpose, as: 'rpmBlockPurposes' },
        { model: Category, as: 'category' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(blocks);
  } catch (error) {
    console.error('Error fetching RPM blocks:', error);
    res.status(500).json({ error: 'Failed to fetch RPM blocks' });
  }
};

export const getRpmBlockById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = await RpmBlock.findByPk(id, {
      include: [
        { model: RpmBlockMassiveAction, as: 'rpmBlockMassiveActions' },
        { model: RpmBlockPurpose, as: 'rpmBlockPurposes' },
        { model: Category, as: 'category' }
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
};

export const createRpmBlock = async (req: Request, res: Response) => {
  try {
    const { category_id, result, type, order, content } = req.body;

    // Start een transactie
    const transaction = await sequelize.transaction();

    try {
      // Parse content als het een string is
      let parsedContent;
      try {
        parsedContent = content ? (typeof content === 'string' ? JSON.parse(content) : content) : {};
      } catch (error) {
        console.error('Error parsing content:', error);
        parsedContent = {};
      }

      // Maak het block aan
      const block = await RpmBlock.create({
        categoryId: category_id || null,
        result,
        type,
        order
      }, { transaction });

      // Maak massive actions aan als ze aanwezig zijn
      if (parsedContent.massiveActions && Array.isArray(parsedContent.massiveActions)) {
        await Promise.all(parsedContent.massiveActions.map((action: MassiveAction) => 
          RpmBlockMassiveAction.create({
            text: action.text,
            leverage: action.leverage || '',
            durationAmount: action.durationAmount || 0,
            durationUnit: action.durationUnit || 'min',
            priority: action.priority || 0,
            key: action.key || '?',
            rpmBlockId: block.id
          }, { transaction })
        ));
      }

      // Maak purposes aan als ze aanwezig zijn
      if (parsedContent.purposes && Array.isArray(parsedContent.purposes)) {
        await Promise.all(parsedContent.purposes.map((purpose: Purpose) => 
          RpmBlockPurpose.create({
            purpose: typeof purpose === 'string' ? purpose : purpose.purpose,
            rpmBlockId: block.id
          }, { transaction })
        ));
      }

      // Commit de transactie
      await transaction.commit();

      // Haal het aangemaakte block op met alle relaties
      const createdBlock = await RpmBlock.findByPk(block.id, {
        include: [
          { model: RpmBlockMassiveAction, as: 'rpmBlockMassiveActions' },
          { model: RpmBlockPurpose, as: 'rpmBlockPurposes' },
          { model: Category, as: 'category' }
        ]
      });

      res.status(201).json(createdBlock);
    } catch (error) {
      // Rollback bij error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating RPM block:', error);
    res.status(500).json({ 
      error: 'Failed to create RPM block',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
    });
  }
};

export const updateRpmBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, result, type, order, content } = req.body;

    console.log('Updating RPM block with ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Start een transactie
    const transaction = await sequelize.transaction();

    try {
      console.log('Finding RPM block with ID:', id);
      const block = await RpmBlock.findByPk(id, {
        include: [
          { model: RpmBlockMassiveAction, as: 'rpmBlockMassiveActions' },
          { model: RpmBlockPurpose, as: 'rpmBlockPurposes' }
        ],
        transaction
      });

      if (!block) {
        console.log('RPM block not found with ID:', id);
        await transaction.rollback();
        return res.status(404).json({ error: 'RPM block not found' });
      }

      console.log('Found RPM block:', JSON.stringify(block, null, 2));

      // Update basis block data
      console.log('Updating block with data:', {
        categoryId: category_id || null,
        result,
        type,
        order
      });
      
      await block.update({
        categoryId: category_id || null,
        result,
        type,
        order
      }, { transaction });

      // Parse content als het een string is
      let parsedContent: { massiveActions?: MassiveAction[]; purposes?: Purpose[] } = {};
      try {
        parsedContent = content ? (typeof content === 'string' ? JSON.parse(content) : content) : {};
        console.log('Parsed content:', JSON.stringify(parsedContent, null, 2));
      } catch (error) {
        console.error('Error parsing content:', error);
        parsedContent = {};
      }

      // Update massive actions
      if (parsedContent.massiveActions && Array.isArray(parsedContent.massiveActions)) {
        console.log('Deleting existing massive actions for block ID:', id);
        // Verwijder bestaande massive actions
        await RpmBlockMassiveAction.destroy({
          where: { rpmBlockId: id },
          transaction
        });

        console.log('Creating new massive actions:', JSON.stringify(parsedContent.massiveActions, null, 2));
        // Maak nieuwe massive actions aan
        await Promise.all(parsedContent.massiveActions.map((action: MassiveAction) => 
          RpmBlockMassiveAction.create({
            text: action.text,
            leverage: action.leverage || '',
            durationAmount: action.durationAmount || 0,
            durationUnit: action.durationUnit || 'min',
            priority: action.priority || 0,
            key: action.key || '?',
            rpmBlockId: id
          }, { transaction })
        ));
      }

      // Update purposes
      if (parsedContent.purposes && Array.isArray(parsedContent.purposes)) {
        console.log('Deleting existing purposes for block ID:', id);
        // Verwijder bestaande purposes
        await RpmBlockPurpose.destroy({
          where: { rpmBlockId: id },
          transaction
        });

        console.log('Creating new purposes:', JSON.stringify(parsedContent.purposes, null, 2));
        // Maak nieuwe purposes aan
        await Promise.all(parsedContent.purposes.map((purpose: Purpose) => 
          RpmBlockPurpose.create({
            purpose: typeof purpose === 'string' ? purpose : purpose.purpose,
            rpmBlockId: id
          }, { transaction })
        ));
      }

      // Commit de transactie
      console.log('Committing transaction');
      await transaction.commit();

      // Haal het bijgewerkte block op met alle relaties
      console.log('Fetching updated block with ID:', id);
      const updatedBlock = await RpmBlock.findByPk(id, {
        include: [
          { model: RpmBlockMassiveAction, as: 'rpmBlockMassiveActions' },
          { model: RpmBlockPurpose, as: 'rpmBlockPurposes' },
          { model: Category, as: 'category' }
        ]
      });

      console.log('Sending response with updated block');
      res.json(updatedBlock);
    } catch (error) {
      // Rollback bij error
      console.error('Error in transaction:', error);
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating RPM block:', error);
    res.status(500).json({ 
      error: 'Failed to update RPM block',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
    });
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