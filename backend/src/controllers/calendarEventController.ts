import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';

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
    const rpmBlockId = id;
    const {
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    } = req.body;
    console.log("🔥 updateCalendarEvent reached")
    console.log('id', id);
    console.log('text', text);


    const event = await RpmBlockMassiveAction.findByPk(id);
    if (!event) {
      console.log("updateCalendarEvent not found event with id", id);
      return res.status(404).json({ error: 'Calendar event with RpmBlockMassiveAction id ' + id + ' not found' });
    }

    await event.update({
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    });
    console.log('event updated');
    const sanitizedEvent = sanitizeSequelizeModel(event);
    res.json(sanitizedEvent);
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
    console.log("🔥 getCalendarEventsByDateRange reached")
    console.log("Start date:", startDate);
    console.log("End date:", endDate);

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const startDateObj = new Date(startDate as string);
    const endDateObj = new Date(endDate as string);

    // Find events that:
    // 1. Start within the date range, OR
    // 2. End within the date range, OR
    // 3. Span across the date range (start before range and end after range)
    const events = await RpmBlockMassiveAction.findAll({
      where: {
        [Op.or]: [
          // Events that start within the date range
          {
            startDate: {
              [Op.between]: [startDateObj, endDateObj]
            }
          },
          // Events that end within the date range
          {
            endDate: {
              [Op.between]: [startDateObj, endDateObj]
            }
          },
          // Events that span across the date range
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDateObj } },
              { endDate: { [Op.gte]: endDateObj } }
            ]
          }
        ]
      },
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        }
      ],
      order: [['startDate', 'ASC']],
    });

    console.log(`Found ${events.length} events in the date range`);
    
    const sanitizedEvents = events.map(event => sanitizeSequelizeModel(event));
    res.json(sanitizedEvents);
  } catch (error) {
    console.error('Error fetching calendar events by date range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};