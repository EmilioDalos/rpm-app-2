import express from 'express';
import { getAllCalendarEvents, getCalendarEventById, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEventsByDateRange } from '../controllers/calendarEventController';

const router = express.Router();

// Special routes first (before parameter routes)
router.get('/range', getCalendarEventsByDateRange);

// CRUD routes
//router.get('/', getAllCalendarEvents);
router.post('/', createCalendarEvent);

// Parameter routes last
//router.get('/:id', getCalendarEventById);
router.put('/:id', updateCalendarEvent);
router.delete('/:id', deleteCalendarEvent);

export default router; 