import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionRecurrence from '../models/RpmMassiveActionRecurrence';
import RpmMassiveActionRecurrenceException from '../models/RpmMassiveActionRecurrenceException';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface RecurrencePattern {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exceptions?: RecurrenceException[];
}

interface RecurrenceException {
  exceptionDate: string;
  reason?: string;
  actionRecurrenceId: string;
}

export const getAllCalendarEvents = async (req: Request, res: Response) => {
  try {
    // Get all events and filter in memory to avoid type issues
    const allEvents = await RpmBlockMassiveAction.findAll({
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        }
      ],
      order: [['startDate', 'ASC']]
    });
    
    // Filter events with startDate not null
    const events = allEvents.filter(event => event.startDate !== null);

    const sanitizedEvents = events.map(event => sanitizeSequelizeModel(event));
    res.json(sanitizedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

// export const getCalendarEventById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const event = await RpmBlockMassiveAction.findByPk(id, {
//       include: [
//         { 
//           association: 'category',
//           attributes: ['id', 'name', 'type', 'color']
//         }
//       ]
//     });

//     if (!event) {
//       return res.status(404).json({ error: 'Calendar event not found' });
//     }

//     const sanitizedEvent = sanitizeSequelizeModel(event);
//     res.json(sanitizedEvent);
//   } catch (error) {
//     console.error('Error fetching calendar event:', error);
//     res.status(500).json({ error: 'Failed to fetch calendar event' });
//   }
// };

export const createCalendarEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rpmBlockId = id;
  try {
    const {
      rpmBlockId,
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    } = req.body;

    const event = await RpmBlockMassiveAction.create({
      rpmBlockId,
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    });

    const sanitizedEvent = sanitizeSequelizeModel(event);
    res.status(201).json(sanitizedEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
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
      recurrencePattern,
      recurrenceExceptions
    } = req.body;

    console.log('Received update request for action:', id);
    console.log('Request body:', req.body);
    console.log('startDate type:', typeof startDate, 'value:', startDate);
    console.log('endDate type:', typeof endDate, 'value:', endDate);

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Update the massive action
      const updateData: any = {
        text: text || 'Nieuwe actie',
        description: description || '',
        isDateRange: isDateRange || false,
        categoryId: categoryId || undefined
      };
      
      // Handle startDate - explicitly set to null if null is provided
      if (startDate === null) {
        updateData.startDate = null;
      } else if (startDate) {
        updateData.startDate = new Date(startDate);
      }
      
      // Handle endDate - explicitly set to null if null is provided
      if (endDate === null) {
        updateData.endDate = null;
      } else if (endDate) {
        updateData.endDate = new Date(endDate);
      }
      
      // Handle hour - explicitly set to null if null is provided
      if (hour === null) {
        updateData.hour = null;
      } else if (hour !== undefined) {
        updateData.hour = hour;
      }
      
      console.log('Update data being sent to database:', updateData);
      
      const [updatedCount] = await RpmBlockMassiveAction.update(updateData, {
        where: { id },
        transaction
      });

      console.log('Update result:', updatedCount);

      if (updatedCount === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Calendar event not found' });
      }

      // Handle recurrence pattern updates
      if (recurrencePattern) {
        // Delete existing recurrence patterns
        await RpmMassiveActionRecurrence.destroy({
          where: { actionId: id },
          transaction
        });

        // Create new recurrence patterns
        if (Array.isArray(recurrencePattern) && recurrencePattern.length > 0) {
          await RpmMassiveActionRecurrence.bulkCreate(
            recurrencePattern.map((pattern: RecurrencePattern) => ({
              actionId: id,
              dayOfWeek: pattern.dayOfWeek
            })),
            { transaction }
          );
        }
      }

      // Handle recurrence exceptions updates
      if (recurrenceExceptions) {
        // Delete existing recurrence exceptions
        await RpmMassiveActionRecurrenceException.destroy({
          where: { actionId: id },
          transaction
        });

        // Create new recurrence exceptions
        if (Array.isArray(recurrenceExceptions) && recurrenceExceptions.length > 0) {
          await RpmMassiveActionRecurrenceException.bulkCreate(
            recurrenceExceptions.map((exception: RecurrenceException) => ({
              actionId: id,
              actionRecurrenceId: exception.actionRecurrenceId,
              exceptionDate: new Date(exception.exceptionDate),
              reason: exception.reason
            })),
            { transaction }
          );
        }
      }

      await transaction.commit();
      res.json({ message: 'Calendar event updated successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await RpmBlockMassiveAction.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await event.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};

export const getCalendarEventsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    console.log(`Fetching events for date range: ${start.toISOString()} to ${end.toISOString()}`);

    // Get all events that fall within the date range
    const events = await RpmBlockMassiveAction.findAll({
      where: {
        [Op.or]: [
          // Events that start within the range
          {
            startDate: {
              [Op.between]: [start, end]
            }
          },
          // Events that end within the range
          {
            endDate: {
              [Op.between]: [start, end]
            }
          },
          // Events that span across the range
          {
            [Op.and]: [
              { startDate: { [Op.lte]: start } },
              { endDate: { [Op.gte]: end } }
            ]
          }
        ]
      },
      include: [
        // Include category information
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        // Include recurrence patterns and their exceptions
        {
          model: RpmMassiveActionRecurrence,
          as: 'recurrencePattern',
          required: false,
          include: [
            {
              model: RpmMassiveActionRecurrenceException,
              as: 'exceptions',
              required: false
            }
          ]
        }
      ],
      logging: console.log
    });

    console.log(`Found ${events.length} base events`);

    const processedEvents = events.map(event => {
      const eventData = event.toJSON();
      // If the event has recurrence patterns, consolidate recurrence dates into one object
      if (eventData.recurrencePattern && eventData.recurrencePattern.length > 0) {
        const recurrenceDates: string[] = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
          const dayName = format(currentDate, 'EEEE');
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          const isException = eventData.recurrencePattern.some(pattern => 
            pattern.exceptions?.some(
              (exception: any) => format(new Date(exception.exceptionDate), 'yyyy-MM-dd') === dateKey
            )
          );
          const isRecurringDay = eventData.recurrencePattern.some(
            (pattern: any) => pattern.dayOfWeek === dayName
          );
          if (!isException && isRecurringDay) {
            recurrenceDates.push(dateKey);
          }
          currentDate = addDays(currentDate, 1);
        }
        return {
          ...eventData,
          recurrenceDates,
          isRecurring: recurrenceDates.length > 0
        };
      }
      // For date range events without recurrence, consolidate dates into recurrenceDates array
      else if (eventData.isDateRange && eventData.startDate && eventData.endDate) {
        const recurrenceDates: string[] = [];
        const eventStart = new Date(eventData.startDate);
        const eventEnd = new Date(eventData.endDate);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(23, 59, 59, 999);
        const effectiveStart = eventStart > start ? eventStart : start;
        const effectiveEnd = eventEnd < end ? eventEnd : end;
        let currentDate = new Date(effectiveStart);
        while (currentDate <= effectiveEnd) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          recurrenceDates.push(dateKey);
          currentDate = addDays(currentDate, 1);
        }
        return {
          ...eventData,
          recurrenceDates,
          isRecurring: false,
          isDateRange: true
        };
      }
      // For single-day events, return as is
      else {
        return eventData;
      }
    });

    console.log(`Found ${processedEvents.length} processed events for the date range`);
    
    // Log the first event to see its structure
    if (processedEvents.length > 0) {
      console.log(`First event structure: ${JSON.stringify(processedEvents[0], null, 2)}`);
    }
    
    res.json(processedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

export const addRecurrenceException = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    const { exceptionDate, reason, actionRecurrenceId } = req.body;

    // Validate input
    if (!actionId || !exceptionDate || !actionRecurrenceId) {
      return res.status(400).json({ error: 'Action ID, exception date, and action recurrence ID are required' });
    }

    // Check if the action exists
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if the recurrence pattern exists
    const recurrencePattern = await RpmMassiveActionRecurrence.findOne({
      where: { 
        id: actionRecurrenceId,
        actionId 
      }
    });

    if (!recurrencePattern) {
      return res.status(404).json({ error: 'Recurrence pattern not found' });
    }

    // Check if the exception already exists
    const existingException = await RpmMassiveActionRecurrenceException.findOne({
      where: {
        actionId,
        actionRecurrenceId,
        exceptionDate: new Date(exceptionDate)
      }
    });

    if (existingException) {
      return res.status(400).json({ error: 'Exception for this date already exists' });
    }

    // Create the exception
    const exception = await RpmMassiveActionRecurrenceException.create({
      actionId,
      actionRecurrenceId,
      exceptionDate: new Date(exceptionDate),
      reason: reason || 'Cancelled by user'
    });

    res.status(201).json(exception);
  } catch (error) {
    console.error('Error adding recurrence exception:', error);
    res.status(500).json({ error: 'Failed to add recurrence exception' });
  }
};

export const deleteRecurrenceException = async (req: Request, res: Response) => {
  try {
    const { actionId, exceptionId } = req.params;

    // Validate input
    if (!actionId || !exceptionId) {
      return res.status(400).json({ error: 'Action ID and exception ID are required' });
    }

    // Check if the action exists
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if the exception exists
    const exception = await RpmMassiveActionRecurrenceException.findOne({
      where: {
        id: exceptionId,
        actionId
      }
    });

    if (!exception) {
      return res.status(404).json({ error: 'Exception not found' });
    }

    // Delete the exception
    await exception.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recurrence exception:', error);
    res.status(500).json({ error: 'Failed to delete recurrence exception' });
  }
};