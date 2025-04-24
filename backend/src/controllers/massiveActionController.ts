import { Request, Response } from 'express';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionOccurrence from '../models/RpmMassiveActionOccurrence';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveActionNote from '../models/RpmBlockMassiveActionNote';
import { Op } from 'sequelize';

/**
 * Get all massive actions with their associations
 */
export const getRpmBlockMassiveActions = async (req: Request, res: Response) => {
  try {
    const actions = await RpmBlockMassiveAction.findAll({
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        {
          association: 'notes',
          attributes: ['id', 'text', 'type', 'created_at', 'updated_at']
        },
        {
          association: 'occurrences',
          attributes: ['id', 'date', 'hour', 'location', 'leverage', 'durationAmount', 'durationUnit']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const sanitizedActions = actions.map(action => sanitizeSequelizeModel(action));
    res.json(sanitizedActions);
  } catch (error) {
    console.error('Error fetching massive actions:', error);
    res.status(500).json({ error: 'Failed to fetch massive actions' });
  }
};

/**
 * Get a single massive action by ID with all associations
 */
export const getRpmBlockMassiveActionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const action = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        {
          association: 'notes',
          attributes: ['id', 'text', 'type', 'created_at', 'updated_at']  
        },
        {
          association: 'occurrences',
          attributes: ['id', 'date', 'hour', 'location', 'leverage', 'durationAmount', 'durationUnit'],
          include: [
            {
              association: 'notes',
              attributes: ['id', 'text', 'type', 'created_at', 'updated_at']
            }
          ]
        }
      ]
    });

    if (!action) {
      return res.status(404).json({ error: 'Massive action not found' });
    }

    const sanitizedAction = sanitizeSequelizeModel(action);
    res.json(sanitizedAction);
  } catch (error) {
    console.error('Error fetching massive action:', error);
    res.status(500).json({ error: 'Failed to fetch massive action' });
  }
};

/**
 * Update a massive action and its related data
 */
export const updateRpmBlockMassiveAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId,
      location,
      leverage,
      durationAmount,
      durationUnit,
      notes,
      status,
      color,
      textColor,
      priority
    } = req.body;

    console.log(`Updating massive action with id=${id}, status=${status}`);

    // Find the action
    const action = await RpmBlockMassiveAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ error: 'Massive action not found' });
    }

    // Update the action
    await action.update({
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId,
      status,
      color,
      textColor,
      priority
    });

    console.log(`Massive action ${id} status updated to: ${action.status}`);

    // If this is a single event (not a date range), update or create an occurrence
    if (!isDateRange && startDate) {
      // Find existing occurrence for this date
      const existingOccurrence = await RpmMassiveActionOccurrence.findOne({
        where: {
          actionId: id,
          date: startDate
        }
      });

      if (existingOccurrence) {
        // Update existing occurrence
        await existingOccurrence.update({
          hour,
          location,
          leverage,
          durationAmount,
          durationUnit
        });

        // Handle notes if provided
        if (notes && Array.isArray(notes)) {
          // Delete existing notes
          await RpmBlockMassiveActionNote.destroy({
            where: {
              occurrenceId: existingOccurrence.id
            }
          });

          // Create new notes
          for (const note of notes) {
            await RpmBlockMassiveActionNote.create({
              id: uuidv4(),
              occurrenceId: existingOccurrence.id,
              text: note.text,
              type: note.type
            });
          }
        }
      } else {
        // Create new occurrence
        const occurrence = await RpmMassiveActionOccurrence.create({
          id: uuidv4(),
          actionId: id,
          date: startDate,
          hour,
          location,
          leverage,
          durationAmount,
          durationUnit
        });

        // Create notes if provided
        if (notes && Array.isArray(notes)) {
          for (const note of notes) {
            await RpmBlockMassiveActionNote.create({
              id: uuidv4(),
              occurrenceId: occurrence.id,
              text: note.text,
              type: note.type
            });
          }
        }
      }
    }

    // Fetch the updated action with all associations
    const updatedAction = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        {
          association: 'notes',
          attributes: ['id', 'text', 'type', 'created_at', 'updated_at']
        },
        {
          association: 'occurrences',
          attributes: ['id', 'date', 'hour', 'location', 'leverage', 'durationAmount', 'durationUnit'],
          include: [
            {
              association: 'notes',
              attributes: ['id', 'text', 'type', 'created_at', 'updated_at']  
            }
          ]
        }
      ]
    });

    res.json(sanitizeSequelizeModel(updatedAction));
  } catch (error) {
    console.error('Error updating massive action:', error);
    res.status(500).json({ error: 'Failed to update massive action' });
  }
};

/**
 * Delete a massive action and all its related data
 */
export const deleteRpmBlockMassiveAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the action
    const action = await RpmBlockMassiveAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ error: 'Massive action not found' });
    }

    // Delete the action (this will cascade delete occurrences and notes)
    await action.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting massive action:', error);
    res.status(500).json({ error: 'Failed to delete massive action' });
  }
};

/**
 * Delete a massive action occurrence for a specific date
 */
export const deleteRpmBlockMassiveActionByDate = async (req: Request, res: Response) => {
  try {
    const { id, date } = req.params;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    console.log(`Deleting occurrence for action ${id} on date ${date}`);

    // Parse the date and create a range that spans the entire day in UTC
    const inputDate = new Date(date);
    // Create date range for the full day (from 00:00:00 to 23:59:59 in UTC)
    const startOfDayUTC = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 23, 59, 59, 999));

    console.log(`Looking for occurrences between ${startOfDayUTC.toISOString()} and ${endOfDayUTC.toISOString()}`);

    // Find any occurrence for this date range
    const occurrence = await RpmMassiveActionOccurrence.findOne({
      where: {
        actionId: id,
        date: {
          [Op.between]: [startOfDayUTC, endOfDayUTC]
        }
      },
      logging: (sql) => console.log('Sequelize SQL:', sql)
    });

    if (!occurrence) {
      console.log(`No occurrence found for action ${id} on date ${date}`);
      return res.status(404).json({ error: 'Occurrence not found for this date' });
    }

    console.log(`Found occurrence with ID ${occurrence.id}, deleting...`);

    // Delete the occurrence (this will cascade delete notes)
    await occurrence.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting massive action by date:', error);
    res.status(500).json({ error: 'Failed to delete massive action by date' });
  }
}; 