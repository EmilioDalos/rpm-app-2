import { Router } from 'express';
import {
  //getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventsByDateRange,
  deleteCalendarEventByDate,
  addNote,
  updateNote,
  deleteNote,
  getCalendarEventById
} from '../controllers/calendarEventController';

const router = Router();

// Note management routes
router.post('/:occurrenceId/notes', addNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);


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

// Delete a calendar event
router.delete('/:id', deleteCalendarEvent);

// Update a calendar event
router.put('/:id', updateCalendarEvent);

export default router;