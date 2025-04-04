import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CalendarEvent from '../../models/CalendarEvent';
import sequelize from '../../config/db';

const router = Router();

// GET: Fetch all calendar events
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    let whereClause = {};
    if (start && end) {
      whereClause = {
        start_date: {
          [sequelize.Op.gte]: new Date(start as string),
          [sequelize.Op.lte]: new Date(end as string)
        }
      };
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      order: [['start_date', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET: Fetch a single calendar event by ID
router.get('/:id', async (req, res) => {
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
});

// POST: Create a new calendar event
router.post('/', async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, category, color } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const event = await CalendarEvent.create({
        id: uuidv4(),
        title,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        location,
        category,
        color,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      return event;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// PUT: Update an existing calendar event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, location, category, color } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        return null;
      }

      await event.update({
        title,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        location,
        category,
        color,
        updated_at: new Date()
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
});

// DELETE: Remove a calendar event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const event = await CalendarEvent.findByPk(id);
      if (!event) {
        return null;
      }

      await event.destroy({ transaction: t });
      return event;
    });

    if (!result) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ message: 'Calendar event deleted successfully', event: result });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

export default router;