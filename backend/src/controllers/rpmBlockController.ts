import { Request, Response } from 'express';
import RpmBlock from '../models/RpmBlock';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import RpmBlockPurpose from '../models/RpmBlockPurpose';
import Category from '../models/Category';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import sequelize from '../config/db';
import RpmMassiveActionRecurrence from '../models/RpmMassiveActionRecurrence';

interface MassiveAction {
  id?: string;
  text: string;
  priority?: number;
  status?: 'new' | 'planned' | 'in_progress' | 'leveraged' | 'completed' | 'cancelled' | 'not_needed' | 'moved';
  actionStatus?: string; // Voor backward compatibility
  startDate?: Date;
  endDate?: Date;
  isDateRange?: boolean;
  hour?: number;
  color?: string;
  textColor?: string;
  categoryId?: string;
  missedDate?: Date;
}

interface Purpose {
  purpose: string;
}

export const getRpmBlocks = async (req: Request, res: Response) => {
  try {
    const blocks = await RpmBlock.findAll({
      include: [
        { model: RpmBlockMassiveAction, as: 'massiveActions' },
        { model: RpmBlockPurpose,     as: 'purposes'      },
        { model: Category,             as: 'category'      },
      ],
      order: [['created_at', 'DESC']],
    });

    const sanitized = blocks.map(block => sanitizeSequelizeModel(block));
    res.json(sanitized);
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
        { model: RpmBlockMassiveAction, as: 'massiveActions' },
        { model: RpmBlockPurpose, as: 'purposes' },
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
            actionStatus: action.actionStatus || 'new',
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
          { model: RpmBlockMassiveAction, as: 'massiveActions' },
          { model: RpmBlockPurpose, as: 'purposes' },
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
    const { category_id, result, type, order, content, idsToKeep } = req.body;

    console.log('Updating RPM block with ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('IDs to keep (if provided):', idsToKeep);

    // Start een transactie
    const transaction = await sequelize.transaction();

    try {
      console.log('Finding RPM block with ID:', id);
      const block = await RpmBlock.findByPk(id, {
        include: [
          { model: RpmBlockMassiveAction, as: 'massiveActions' },
          { model: RpmBlockPurpose, as: 'purposes' }
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
        // Als idsToKeep is meegegeven, gebruiken we een andere aanpak om de kalendergebeurtenissen te behouden
        if (idsToKeep && Array.isArray(idsToKeep) && idsToKeep.length > 0) {
          console.log('Using selective update approach with idsToKeep:', idsToKeep);
          
          // Maak een map van action ID's naar hun bijbehorende actie-object
          const actionsById = parsedContent.massiveActions.reduce((map: Record<string, any>, action: any) => {
            if (action.id) {
              map[action.id] = action;
            }
            return map;
          }, {});
          
          // Vind alle bestaande acties
          const existingActions = await RpmBlockMassiveAction.findAll({
            where: { rpmBlockId: id },
            transaction
          });
          
          // Houd bij welke actie-ID's we al hebben bijgewerkt
          const processedIds = new Set<string>();
          
          // Werk bestaande acties bij die in idsToKeep staan
          for (const existingAction of existingActions) {
            if (idsToKeep.includes(existingAction.id)) {
              // Deze actie moet behouden blijven, werk deze bij
              const updatedData = actionsById[existingAction.id];
              if (updatedData) {
                console.log(`Updating existing action with ID ${existingAction.id}`);
                // Gebruik de juiste velden uit het model
                await existingAction.update({
                  text: updatedData.text,
                  priority: updatedData.priority || existingAction.priority,
                  status: updatedData.status || existingAction.status,
                  // Behoud deze velden om kalenderrelaties intact te houden
                  startDate: existingAction.startDate,
                  endDate: existingAction.endDate,
                  isDateRange: updatedData.isDateRange !== undefined ? updatedData.isDateRange : existingAction.isDateRange,
                  hour: updatedData.hour !== undefined ? updatedData.hour : existingAction.hour,
                  missedDate: existingAction.missedDate,
                  color: updatedData.color || existingAction.color,
                  textColor: updatedData.textColor || existingAction.textColor,
                  categoryId: updatedData.categoryId || existingAction.categoryId
                }, { transaction });
                
                processedIds.add(existingAction.id);
              }
            } else {
              // Deze actie staat niet in idsToKeep, verwijder deze
              console.log(`Deleting action with ID ${existingAction.id} (not in idsToKeep)`);
              await existingAction.destroy({ transaction });
            }
          }
          
          // Voeg nieuwe acties toe die nog niet bestaan
          for (const action of parsedContent.massiveActions) {
            if (action.id && !processedIds.has(action.id)) {
              console.log(`Creating new action with ID ${action.id}`);
              await RpmBlockMassiveAction.create({
                id: action.id, // Behoud het ID
                rpmBlockId: id,
                text: action.text,
                priority: action.priority || 0,
                status: action.status || 'new',
                startDate: action.startDate,
                endDate: action.endDate,
                isDateRange: action.isDateRange,
                hour: action.hour,
                color: action.color,
                textColor: action.textColor,
                categoryId: action.categoryId
              }, { transaction });
            }
          }
        } else {
          // Standaard aanpak: verwijder alle bestaande acties en maak nieuwe aan
          console.log('Using default approach: deleting all existing actions');
          
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
              priority: action.priority || 0,
              status: action.actionStatus || 'new',
              rpmBlockId: id
            }, { transaction })
          ));
        }
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
          { model: RpmBlockMassiveAction, as: 'massiveActions' },
          { model: RpmBlockPurpose, as: 'purposes' },
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