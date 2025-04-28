import { Router } from 'express';
import {
  //getAllCalendarEvents,
  createCalendarEvent,
  deleteCalendarEventByActionId,
  getCalendarEventsByDateRange,
  deleteCalendarEventByDate,
  addNote,
  updateNote,
  deleteNote,
  getCalendarEventById,
  updateCalendarEvent,
  updateCalendarEventByActionId
} from '../controllers/calendarEventController';

const router = Router();

// Note management routes
router.post('/:id/notes', addNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

// Occurrences management
router.put('/occurrences/:occurrenceId', updateCalendarEvent);

// Get calendar events by date range   
router.get('/date-range', getCalendarEventsByDateRange);

// Get a single calendar event by ID
router.get('/:id', getCalendarEventById);

//Get All Calendar Events
// rpmblocks is used for the calendar events!!!
//router.get('/', getAllCalendarEvents);

// Create a new calendar event
router.post('/', createCalendarEvent);

// Delete a calendar event by id and date
router.delete('/:id/:date', deleteCalendarEventByDate);

// Delete a calendar event by action id
router.delete('/:actionId', deleteCalendarEventByActionId);

// Update a calendar event
router.put('/:actionId', updateCalendarEventByActionId);

export default router;