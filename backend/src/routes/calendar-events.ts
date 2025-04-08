import { Router } from 'express';
import {
  getAllCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../controllers/calendarEventController';

const router = Router();

// Get all calendar events
router.get('/', getAllCalendarEvents);

// Get a single calendar event by ID
router.get('/:id', getCalendarEventById);

// Create a new calendar event
router.post('/', createCalendarEvent);

// Update a calendar event
router.put('/:id', updateCalendarEvent);

// Delete a calendar event
router.delete('/:id', deleteCalendarEvent);

export default router;