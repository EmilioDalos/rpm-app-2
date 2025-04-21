import { Router } from 'express';
import {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventsByDateRange,
  addRecurrenceException,
  deleteRecurrenceException,
  deleteCalendarEventByDate,
  addNote,
  updateNote,
  deleteNote
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

// Delete a calendar event by id and date
router.delete('/:id/:date', deleteCalendarEventByDate);

// Get calendar events by date range   
router.get('/date-range', getCalendarEventsByDateRange);

// Add a recurrence exception to an action
router.post('/:actionId/exceptions', addRecurrenceException);

// Delete a recurrence exception
router.delete('/:actionId/exceptions/:exceptionId', deleteRecurrenceException);

// Note management routes
router.post('/:actionId/notes', addNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

export default router;