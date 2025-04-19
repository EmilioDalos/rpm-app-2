import { Router } from 'express';
import {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventsByDateRange,
  addRecurrenceException,
  deleteRecurrenceException
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
router.delete('/:id', deleteCalendarEvent);

// Get calendar events by date range   
router.get('/date-range', getCalendarEventsByDateRange);

// Add a recurrence exception to an action
router.post('/:actionId/exceptions', addRecurrenceException);

// Delete a recurrence exception
router.delete('/:actionId/exceptions/:exceptionId', deleteRecurrenceException);

export default router;