const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to calendar events JSON file
const calendarEventsFilePath = path.join(__dirname, '../data/calendar-events.json');

// Helper function to read calendar events
const readCalendarEvents = () => {
  try {
    const data = fs.readFileSync(calendarEventsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calendar events file:', error);
    return {};
  }
};

// Helper function to write calendar events
const writeCalendarEvents = (events) => {
  try {
    fs.writeFileSync(calendarEventsFilePath, JSON.stringify(events, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing calendar events file:', error);
    return false;
  }
};

// Get all calendar events
exports.getAllCalendarEvents = (req, res) => {
  const events = readCalendarEvents();
  res.json(events);
};

// Get events for a specific date
exports.getEventsByDate = (req, res) => {
  const { dateKey } = req.params;
  const events = readCalendarEvents();
  
  if (!events[dateKey]) {
    return res.json({ dateKey, actions: [] });
  }
  
  res.json({ dateKey, actions: events[dateKey] });
};

// Get a specific action from a date
exports.getActionById = (req, res) => {
  const { dateKey, actionId } = req.params;
  const events = readCalendarEvents();
  
  if (!events[dateKey]) {
    return res.status(404).json({ error: 'No events for this date' });
  }
  
  const action = events[dateKey].find(act => act.id === actionId);
  
  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }
  
  res.json(action);
};

// Create a new calendar action
exports.createAction = (req, res) => {
  const { dateKey } = req.params;
  const events = readCalendarEvents();
  const newAction = {
    ...req.body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!events[dateKey]) {
    events[dateKey] = [];
  }
  
  events[dateKey].push(newAction);
  
  if (writeCalendarEvents(events)) {
    res.status(201).json(newAction);
  } else {
    res.status(500).json({ error: 'Failed to create action' });
  }
};

// Update a calendar action
exports.updateAction = (req, res) => {
  const { dateKey, actionId } = req.params;
  const events = readCalendarEvents();
  
  if (!events[dateKey]) {
    return res.status(404).json({ error: 'No events for this date' });
  }
  
  const actionIndex = events[dateKey].findIndex(act => act.id === actionId);
  
  if (actionIndex === -1) {
    return res.status(404).json({ error: 'Action not found' });
  }
  
  const updatedAction = {
    ...events[dateKey][actionIndex],
    ...req.body,
    id: actionId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  events[dateKey][actionIndex] = updatedAction;
  
  if (writeCalendarEvents(events)) {
    res.json(updatedAction);
  } else {
    res.status(500).json({ error: 'Failed to update action' });
  }
};

// Delete a calendar action
exports.deleteAction = (req, res) => {
  const { dateKey, actionId } = req.params;
  const events = readCalendarEvents();
  
  if (!events[dateKey]) {
    return res.status(404).json({ error: 'No events for this date' });
  }
  
  const originalLength = events[dateKey].length;
  events[dateKey] = events[dateKey].filter(act => act.id !== actionId);
  
  if (events[dateKey].length === originalLength) {
    return res.status(404).json({ error: 'Action not found' });
  }
  
  // If no more actions for this date, remove the date key
  if (events[dateKey].length === 0) {
    delete events[dateKey];
  }
  
  if (writeCalendarEvents(events)) {
    res.json({ message: 'Action deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete action' });
  }
}; 