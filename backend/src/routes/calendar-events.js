const express = require('express');
const router = express.Router();
const calendarEventController = require('../controllers/calendarEventController');

// GET all calendar events
router.get('/', calendarEventController.getAllCalendarEvents);

// GET events for a specific date
router.get('/:dateKey', calendarEventController.getEventsByDate);

// GET a specific action from a date
router.get('/:dateKey/actions/:actionId', calendarEventController.getActionById);

// POST create a new action for a date
router.post('/:dateKey/actions', calendarEventController.createAction);

// PUT update an action
router.put('/:dateKey/actions/:actionId', calendarEventController.updateAction);

// DELETE an action
router.delete('/:dateKey/actions/:actionId', calendarEventController.deleteAction);

module.exports = router;
