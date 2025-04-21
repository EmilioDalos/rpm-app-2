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
  deleteNote,
  getCalendarEventById
} from '../controllers/calendarEventController';

const router = Router();

// Note management routes (specifiek pad vóór de generieke)
router.post('/:actionId/notes', addNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

// Get calendar events by date range   
router.get('/date-range', getCalendarEventsByDateRange);

// Get a single calendar event by ID
router.get('/:id', getCalendarEventById);

// Create a new calendar event
router.post('/', createCalendarEvent);

// Delete a calendar event by id and date
router.delete('/:id/:date', deleteCalendarEventByDate);

// Delete a calendar event
router.delete('/:id', deleteCalendarEvent);

// Update a calendar event
router.put('/:id', updateCalendarEvent);

// Add a recurrence exception to an action
router.post('/:actionId/exceptions', addRecurrenceException);

export default router;