import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(__dirname, '../data/calendar-events.json');

interface CalendarEvent {
  id: string;
  date: string;
  massiveActions: any[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to read calendar events
const readCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calendar events:', error);
    return [];
  }
};

// Helper function to write calendar events
const writeCalendarEvents = async (events: CalendarEvent[]): Promise<boolean> => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(events, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing calendar events:', error);
    return false;
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await readCalendarEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const events = await readCalendarEvents();
    const event = events.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar event' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const events = await readCalendarEvents();
    const newEvent: CalendarEvent = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    
    if (await writeCalendarEvents(events)) {
      res.status(201).json(newEvent);
    } else {
      res.status(500).json({ error: 'Failed to create calendar event' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const events = await readCalendarEvents();
    const index = events.findIndex(e => e.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    
    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    events[index] = updatedEvent;
    
    if (await writeCalendarEvents(events)) {
      res.json(updatedEvent);
    } else {
      res.status(500).json({ error: 'Failed to update calendar event' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const events = await readCalendarEvents();
    const filteredEvents = events.filter(e => e.id !== req.params.id);
    
    if (filteredEvents.length === events.length) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    
    if (await writeCalendarEvents(filteredEvents)) {
      res.json({ message: 'Calendar event deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete calendar event' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
}; 