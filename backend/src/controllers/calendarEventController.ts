import { Request, Response } from 'express';
import CalendarEvent from '../models/CalendarEvent';
import { Op } from 'sequelize';

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    let whereClause = {};
    if (start && end) {
      whereClause = {
        start_date: {
          [Op.gte]: new Date(start as string),
          [Op.lte]: new Date(end as string)
        }
      };
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      order: [['start_date', 'ASC']]
    });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCalendarEventById = async (req: Request, res: Response) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ error: 'Failed to fetch calendar event' });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, location, category, color } = req.body;
    
    const event = await CalendarEvent.create({
      title,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      location,
      category,
      color
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, location, category, color } = req.body;

    const event = await CalendarEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await event.update({
      title,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      location,
      category,
      color
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await event.destroy();
    res.json({ message: 'Calendar event deleted successfully', event });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
}; 