import { Router } from 'express';
import {
  createCalendarEvent,
  getCalendarEventsByDateRange,
  getCalendarEventById,
  updateCalendarEventByActionId,
  updateCalendarEvent
} from '../controllers/calendarEventController';

const router = Router();

// Occurrences management
router.put('/occurrences/:occurrenceId', updateCalendarEvent);

// Get calendar events by date range   
router.get('/date-range', getCalendarEventsByDateRange);

// Get a single calendar event by ID
router.get('/:id', getCalendarEventById);

// Create a new calendar event
router.post('/', createCalendarEvent);

// Update a calendar event by action ID
router.put('/action/:actionId', updateCalendarEventByActionId);

// Update a calendar event
router.put('/:id', updateCalendarEvent);

export default router;