import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionRecurrence from '../models/RpmMassiveActionRecurrence';
import RpmMassiveActionRecurrenceException from '../models/RpmMassiveActionRecurrenceException';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import RpmBlockMassiveActionNote from '../models/RpmBlockMassiveActionNote';

interface RecurrencePattern {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exceptions?: RecurrenceException[];
}

interface RecurrenceException {
  exceptionDate: string;
  reason?: string;
  actionRecurrenceId: string;
}

export const getAllCalendarEvents = async (req: Request, res: Response) => {
  try {
    // Get all events and filter in memory to avoid type issues
    const allEvents = await RpmBlockMassiveAction.findAll({
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        }
      ],
      order: [['startDate', 'ASC']]
    });
    
    // Filter events with startDate not null
    const events = allEvents.filter(event => event.startDate !== null);

    const sanitizedEvents = events.map(event => sanitizeSequelizeModel(event));
    res.json(sanitizedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

export const getCalendarEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        {
          association: 'notes',
          attributes: ['id', 'text', 'type', 'createdAt', 'updatedAt']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const sanitizedEvent = sanitizeSequelizeModel(event);
    res.json(sanitizedEvent);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ error: 'Failed to fetch calendar event' });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rpmBlockId = id;
  try {
    const {
      rpmBlockId,
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    } = req.body;

    const event = await RpmBlockMassiveAction.create({
      rpmBlockId,
      text,
      description,
      location,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    });

    const sanitizedEvent = sanitizeSequelizeModel(event);
    res.status(201).json(sanitizedEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    text, 
    startDate, 
    endDate, 
    rpmBlockId,
    notes,
    recurrencePattern,
    dayOfWeek,
    recurrenceExceptions 
  } = req.body;

  try {
    const action = await RpmBlockMassiveAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Update action
    await action.update({
      text,
      rpmBlockId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    // Handle notes
    if (notes && Array.isArray(notes)) {
      // Delete existing notes
      await RpmBlockMassiveActionNote.destroy({
        where: { actionId: id }
      });

      // Create new notes
      await Promise.all(notes.map(note => 
        RpmBlockMassiveActionNote.create({
          actionId: id,
          text: note.text,
          type: note.type || 'note'
        })
      ));
    }

    // Handle recurrence pattern
    if (recurrencePattern && Array.isArray(recurrencePattern)) {
      // Geldig recurrencePattern opgegeven, sla recurrence logic over

      // Delete existing recurrence pattern and exceptions
      await RpmMassiveActionRecurrenceException.destroy({
        where: { actionId: id }
      });
      await RpmMassiveActionRecurrence.destroy({
        where: { actionId: id }
      });

    // Create new recurrence patterns for each provided pattern
      const recurrences = [];
      for (const pattern of recurrencePattern) {
        if (!pattern.dayOfWeek) continue;
        const rec = await RpmMassiveActionRecurrence.create({
          actionId: id,
          dayOfWeek: pattern.dayOfWeek,
        
        });
        recurrences.push(rec);
      }

      // Create exceptions if any for each recurrence
      if (recurrenceExceptions && Array.isArray(recurrenceExceptions)) {
        await Promise.all(recurrenceExceptions.flatMap(exception =>
          recurrences.map(rec =>
            RpmMassiveActionRecurrenceException.create({
              actionId: id,
              actionRecurrenceId: rec.id,
              exceptionDate: new Date(exception.exceptionDate),
              reason: exception.reason
            })
          )
        ));
      }
    }

    // Fetch updated action with all relations
    const updatedAction = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        {
          model: RpmMassiveActionRecurrence,
          as: 'recurrencePattern',
          include: [
            {
              model: RpmMassiveActionRecurrenceException,
              as: 'exceptions'
            }
          ]
        },
        {
          model: RpmMassiveActionRecurrenceException,
          as: 'recurrenceExceptions'
        },
        {
          model: RpmBlockMassiveActionNote,
          as: 'notes'
        }
      ]
    });

    res.json(updatedAction);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await RpmBlockMassiveAction.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    await event.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};

/**
 * DELETE /calendar-events/:id?date=YYYY-MM-DD
 * If the event has a recurrence pattern on that date, add an exception.
 * Otherwise, nullify startDate and endDate on the event.
 */
export const deleteCalendarEventByDate = async (req: Request, res: Response) => {
  try {
    const { id, date } = req.params;
   // const { date } = req.query as { date?: string };
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' });
    }

    // Fetch action with its recurrence patterns
    const action = await RpmBlockMassiveAction.findByPk(id, {
      include: [{ model: RpmMassiveActionRecurrence, as: 'recurrencePattern', required: false }]
    });
    if (!action) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const targetDate = new Date(date);
    const dayName = format(targetDate, 'EEEE');
    const pattern = action.recurrencePattern?.find(p => p.dayOfWeek === dayName);

    if (pattern) {
      // Create an exception for this recurrence on the specified date
      const [exception, created] = await RpmMassiveActionRecurrenceException.findOrCreate({
        where: {
          actionId: id,
          actionRecurrenceId: pattern.id,
          exceptionDate: targetDate
        },
        defaults: {
          reason: 'Cancelled by user'
        },
        logging: console.log
      });
      return res.status(created ? 201 : 200).json(exception);
    }

    // No recurrence pattern on that date: nullify date range on the event
    await RpmBlockMassiveAction.update(
      { startDate: null, endDate: null },
      { where: { id } }
    );
    const updated = await RpmBlockMassiveAction.findByPk(id);
    return res.status(200).json(sanitizeSequelizeModel(updated));
  } catch (error) {
    console.error('Error deleting calendar event by date:', error);
    return res.status(500).json({ error: 'Failed to delete calendar event by date' });
  }
};

export const getCalendarEventsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    console.log(`Fetching events for date range: ${start.toISOString()} to ${end.toISOString()}`);

    // Fetch base events that start, end, or span the range, including category and recurrence data
    const events = await RpmBlockMassiveAction.findAll({
      where: {
        [Op.or]: [
          { startDate: { [Op.between]: [start, end] } },
          { endDate:   { [Op.between]: [start, end] } },
          { [Op.and]: [
              { startDate: { [Op.lte]: start } },
              { endDate:   { [Op.gte]: end   } }
            ]
          }
        ]
      },
      include: [
        { association: 'category', attributes: ['id', 'name', 'type', 'color'] },
        { 
          model: RpmMassiveActionRecurrence, 
          as: 'recurrencePattern', 
          required: false, 
          include: [
            { model: RpmMassiveActionRecurrenceException, as: 'exceptions', required: false }
          ]
        }
      ],
    });

    console.log(`Found ${events.length} base events`);

    // Process each event into flat structure with recurrenceDates
    const processedEvents = events.map(event => {
      const ev = event.toJSON() as any;

      // Recurring events: build recurrenceDates based on pattern & exceptions
      if (ev.recurrencePattern && ev.recurrencePattern.length > 0) {
        const dates: string[] = [];
        let cursor = new Date(start);
        while (cursor <= end) {
          const iso = format(cursor, 'yyyy-MM-dd');
          const dayName = format(cursor, 'EEEE');
          const hasPattern = ev.recurrencePattern.some((p: any) => p.dayOfWeek === dayName);
          const isExcept = ev.recurrencePattern.some((p: any) =>
            p.exceptions?.some((ex: any) => format(new Date(ex.exceptionDate), 'yyyy-MM-dd') === iso)
          );
          if (hasPattern && !isExcept) {
            dates.push(iso);
          }
          cursor = addDays(cursor, 1);
        }
        return { ...ev, recurrenceDates: dates, isRecurring: dates.length > 0 };
      }
      // Non-recurring date-range events: fill every date in range
      if ((!ev.recurrencePattern || ev.recurrencePattern.length === 0) && ev.startDate && ev.endDate) {
        const dates: string[] = [];
        const from = new Date(ev.startDate) > start ? new Date(ev.startDate) : start;
        const to   = new Date(ev.endDate)   < end   ? new Date(ev.endDate)   : end;
        let cursor = startOfDay(from);
        const endOfRange = endOfDay(to);
        while (cursor <= endOfRange) {
          dates.push(format(cursor, 'yyyy-MM-dd'));
          cursor = addDays(cursor, 1);
        }
        return { ...ev, recurrenceDates: dates, isRecurring: false };
      }
      // Single-day events
      return ev;
    });

    console.log(`Processed ${processedEvents.length} events`);

    // Build week structure for frontend
    const weekStart = format(start, 'yyyy-MM-dd');
    const days = [];
    for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
      const dateKey = format(cursor, 'yyyy-MM-dd');
      const label = format(cursor, 'EEE');
      const eventsOnDate = processedEvents.filter((ev: any) =>
        Array.isArray(ev.recurrenceDates) && ev.recurrenceDates.includes(dateKey)
      );

      // allDay events (no hour)
      const allDay = eventsOnDate
        .filter((ev: any) => ev.hour == null)
        .map((ev: any) => ({ id: ev.id, title: ev.text, categoryId: ev.categoryId }));

      // hourly slots
      const hourslots = [];
      for (let h = 0; h < 24; h++) {
        const slotEvents = eventsOnDate
          .filter((ev: any) => ev.hour != null && Number(ev.hour) === h)
          .map((ev: any) => {
            const start = `${String(h).padStart(2, '0')}:00`;
            const end = (ev.durationUnit || '').startsWith('hour')
              ? `${String(h + ev.durationAmount).padStart(2, '0')}:00`
              : '';
            return { id: ev.id, title: ev.text, start, end, categoryId: ev.categoryId };
          });
        if (slotEvents.length > 0) {
          hourslots.push({ hour: h, events: slotEvents });
        }
      }

      days.push({ date: dateKey, label, allDay, hourslots });
    }

    return res.json({ weekStart, days });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

export const addRecurrenceException = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    const { exceptionDate, reason, actionRecurrenceId } = req.body;

    // Validate input
    if (!actionId || !exceptionDate || !actionRecurrenceId) {
      return res.status(400).json({ error: 'Action ID, exception date, and action recurrence ID are required' });
    }

    // Check if the action exists
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if the recurrence pattern exists
    const recurrencePattern = await RpmMassiveActionRecurrence.findOne({
      where: { 
        id: actionRecurrenceId,
        actionId 
      }
    });

    if (!recurrencePattern) {
      return res.status(404).json({ error: 'Recurrence pattern not found' });
    }

    // Check if the exception already exists
    const existingException = await RpmMassiveActionRecurrenceException.findOne({
      where: {
        actionId,
        actionRecurrenceId,
        exceptionDate: new Date(exceptionDate)
      }
    });

    if (existingException) {
      return res.status(400).json({ error: 'Exception for this date already exists' });
    }

    // Create the exception
    const exception = await RpmMassiveActionRecurrenceException.create({
      actionId,
      actionRecurrenceId,
      exceptionDate: new Date(exceptionDate),
      reason: reason || 'Cancelled by user'
    });

    res.status(201).json(exception);
  } catch (error) {
    console.error('Error adding recurrence exception:', error);
    res.status(500).json({ error: 'Failed to add recurrence exception' });
  }
};

export const deleteRecurrenceException = async (req: Request, res: Response) => {
  try {
    const { actionId, exceptionId } = req.params;

    // Validate input
    if (!actionId || !exceptionId) {
      return res.status(400).json({ error: 'Action ID and exception ID are required' });
    }

    // Check if the action exists
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if the exception exists
    const exception = await RpmMassiveActionRecurrenceException.findOne({
      where: {
        id: exceptionId,
        actionId
      }
    });

    if (!exception) {
      return res.status(404).json({ error: 'Exception not found' });
    }

    // Delete the exception
    await exception.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recurrence exception:', error);
    res.status(500).json({ error: 'Failed to delete recurrence exception' });
  }
};


export const addNote = async (req: Request, res: Response) => {
  const { actionId } = req.params;
  const { text, type } = req.body;

  try {
    // Check if the action exists
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Create the note
    const note = await RpmBlockMassiveActionNote.create({
      actionId: actionId, 
      text,
      type: type || 'note'
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const { text, type } = req.body;

  try {
    // Find the note
    const note = await RpmBlockMassiveActionNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note
    await note.update({
      text,
      type: type || note.type
    });

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const { noteId } = req.params;

  try {
    // Find the note
    const note = await RpmBlockMassiveActionNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete the note
    await note.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};