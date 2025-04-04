import express from 'express';
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../controllers/calendarEventController';

const router = express.Router();

// GET all calendar events
router.get('/', getCalendarEvents);

// GET calendar event by ID
router.get('/:id', getCalendarEventById);

// POST create new calendar event
router.post('/', createCalendarEvent);

// PUT update calendar event
router.put('/:id', updateCalendarEvent);

// DELETE calendar event
router.delete('/:id', deleteCalendarEvent);

export default router; 