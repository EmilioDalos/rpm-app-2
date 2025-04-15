import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionRecurrence from '../models/RpmMassiveActionRecurrence';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface RecurrencePattern {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
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
      recurrencePattern 
    } = req.body;

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Update the massive action
      const [updatedCount] = await RpmBlockMassiveAction.update({
        text: text || 'Nieuwe actie',
        description: description || '',
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isDateRange: isDateRange || false,
        hour: hour || undefined,
        categoryId: categoryId || undefined
      }, {
        where: { id },
        transaction
      });

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
        {
          model: RpmMassiveActionRecurrence,
          as: 'recurrencePattern',
          required: false
        }
      ]
    });

    // Process recurring events
    const processedEvents = events.flatMap(event => {
      const events = [event];
      const eventData = event.toJSON();

      // If the event has recurrence patterns, create additional events
      if (eventData.recurrencePattern && eventData.recurrencePattern.length > 0) {
        const recurrenceEvents = eventData.recurrencePattern.flatMap((pattern: RecurrencePattern) => {
          const dayEvents = [];
          let currentDate = new Date(start);
          
          while (currentDate <= end) {
            // Check if the current day matches the recurrence pattern
            const dayName = format(currentDate, 'EEEE');
            if (dayName === pattern.dayOfWeek) {
              // Create a new event for this day
              const dayEvent = {
                ...eventData,
                id: `${eventData.id}-${format(currentDate, 'yyyy-MM-dd')}`,
                startDate: format(currentDate, 'yyyy-MM-dd'),
                endDate: format(currentDate, 'yyyy-MM-dd'),
                isDateRange: false,
                recurrencePattern: [pattern]
              };
              dayEvents.push(dayEvent);
            }
            currentDate = addDays(currentDate, 1);
          }
          return dayEvents;
        });
        events.push(...recurrenceEvents);
      }

      return events;
    });

    console.log(`Found ${processedEvents.length} events for the date range`);
    res.json(processedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};