import { Router } from 'express';
import {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventsByDateRange
} from '../controllers/calendarEventController';

const router = Router();

// Get all calendar events
//router.get('/', getAllCalendarEvents);

// Get a single calendar event by ID
//router.get('/:id', getCalendarEventById);

// Create a new calendar event
router.post('/', createCalendarEvent);

// Update a calendar event
router.put('/:id', updateCalendarEvent);

// Delete a calendar event
//router.delete('/:id', deleteCalendarEvent);

// Get calendar events by date range   
router.get('/range', getCalendarEventsByDateRange);

export default router;