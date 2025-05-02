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
    
    console.log(`[getRpmBlockMassiveActionById] Request received for ID: ${id}`);

    // First try to fetch the action directly
    console.log(`[getRpmBlockMassiveActionById] Fetching action with ID: ${id}`);
    let action = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { association: 'category', attributes: ['id', 'name', 'type', 'color'] },
        { 
          association: 'notes',
          attributes: ['id', 'text', 'type', 'created_at', 'updated_at']
        }
      ]
    });

    if (!action) {
      console.log(`[getRpmBlockMassiveActionById] Action not found: ${id}`);
      return res.status(404).json({ error: 'Massive action not found' });
    }

    // If it's a recurring action, fetch all occurrences
    if (action.recurrenceType) {
      console.log(`[getRpmBlockMassiveActionById] Fetching occurrences for recurring action: ${id}`);
      const occurrences = await RpmMassiveActionOccurrence.findAll({
        where: { actionId: id },
        order: [['date', 'ASC']]
      });

      action = action.set('occurrences', occurrences);
    }

    // If it's a date range action, fetch all occurrences within the range
    if (action.isDateRange) {
      console.log(`[getRpmBlockMassiveActionById] Fetching occurrences for date range action: ${id}`);
      const occurrences = await RpmMassiveActionOccurrence.findAll({
        where: { actionId: id },
        order: [['date', 'ASC']]
      });

      action = action.set('occurrences', occurrences);
    }

    // If it's a single occurrence action, fetch the single occurrence
    if (!action.recurrenceType && !action.isDateRange) {
      console.log(`[getRpmBlockMassiveActionById] Fetching single occurrence for action: ${id}`);
      const occurrence = await RpmMassiveActionOccurrence.findOne({
        where: { actionId: id }
      });

      if (occurrence) {
        action = action.set('occurrences', [occurrence]);
      }
    }

    // Format the response
    const actionJson = {
      ...action.toJSON(),
      isRecurringDays: !!action.recurrenceType,
      occurrences: action.occurrences?.map(occurrence => ({
        ...occurrence.toJSON(),
        date: occurrence.date.toISOString(),
        hour: occurrence.hour,
        durationAmount: occurrence.durationAmount,
        durationUnit: occurrence.durationUnit,
        location: occurrence.location
      })) || []
    };

    // Wrap in CalendarEventDay
    const response = {
      date: action.startDate?.toISOString() || new Date().toISOString(),
      events: [actionJson]
    };

    console.log(`[getRpmBlockMassiveActionById] Returning data for ID ${id}, date: ${action.startDate?.toISOString()}`);
    res.json(response);
  } catch (error) {
    console.error('[getRpmBlockMassiveActionById] Error fetching massive action:', error);
    res.status(500).json({ error: 'Failed to fetch massive action', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createMassiveAction = async (req: Request, res: Response) => {
  try {
    const {
      text,
      color,
      textColor,
      status,
      categoryId,
      hour,
      startDate,
      endDate,
      isDateRange,
      leverage,
      description,
      recurrenceType,
      recurrencePattern
    } = req.body;

    if (!text || !categoryId) {
      return res.status(400).json({ error: 'Text and categoryId are required' });
    }

    const action = await RpmBlockMassiveAction.create({
      rpmBlockId: req.body.blockId, // Use blockId from request body
      text,
      color,
      textColor,
      status,
      categoryId,
      hour,
      startDate,
      endDate,
      isDateRange,
      leverage,
      description,
      recurrenceType,
      recurrencePattern
    });

    res.status(201).json(action);
  } catch (error) {
    console.error('Error creating massive action:', error);
    res.status(500).json({ error: 'Failed to create massive action' });
  }
};

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