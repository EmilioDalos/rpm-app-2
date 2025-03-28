import { Router } from 'express';
import * as calendarEventController from '../controllers/calendarEventController';

const router = Router();

// GET all calendar events
router.get('/', calendarEventController.getEvents);

// GET calendar event by ID
router.get('/:id', calendarEventController.getEventById);

// POST create new calendar event
router.post('/', calendarEventController.createEvent);

// PUT update calendar event
router.put('/:id', calendarEventController.updateEvent);

// DELETE calendar event
router.delete('/:id', calendarEventController.deleteEvent);

export default router; 