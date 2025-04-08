import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CalendarEvent from '../models/CalendarEvent';
import sequelize from '../config/db';
import { Op } from 'sequelize';

export const getAllCalendarEvents = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    let whereClause = {};
    if (start && end) {
      whereClause = {
        startDate: {
          [Op.gte]: new Date(start as string),
          [Op.lte]: new Date(end as string)
        }
      };
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      order: [['startDate', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

export const getCalendarEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findByPk(id);
    
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
    const { title, description, startDate, endDate, location, categoryId, color } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const event = await CalendarEvent.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        categoryId,
        color
      }, { transaction: t });

      return event;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, categoryId, color } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        return null;
      }

      await event.update({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        categoryId,
        color
      }, { transaction: t });

      return event;
    });

    if (!result) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json(result);
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
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};