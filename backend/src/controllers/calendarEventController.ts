import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionOccurrence from '../models/RpmMassiveActionOccurrence';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import RpmBlockMassiveActionNote from '../models/RpmBlockMassiveActionNote';

interface Occurrence {
  id: string;
  date: string;
  hour?: number;
  location?: string;
  leverage?: string;
  durationAmount?: number;
  durationUnit?: string;
  notes?: Note[];
}

interface Note {
  id: string;
  text: string;
  type?: 'progress' | 'remark';
}




// export const getAllCalendarEvents = async (req: Request, res: Response) => {
//   try {
//     // Get all events and filter in memory to avoid type issues
//     const allEvents = await RpmBlockMassiveAction.findAll({
//       include: [
//         { 
//           association: 'category',
//           attributes: ['id', 'name', 'type', 'color']
//         }
//       ],
//       order: [['startDate', 'ASC']]
//     });
    
//     // Filter events with startDate not null
//     const events = allEvents.filter(event => event.startDate !== null);

//     const sanitizedEvents = events.map(event => sanitizeSequelizeModel(event));
//     res.json(sanitizedEvents);
//   } catch (error) {
//     console.error('Error fetching calendar events:', error);
//     res.status(500).json({ error: 'Failed to fetch calendar events' });
//   }
// };
export const getCalendarEventsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    console.log(`Fetching calendar events from ${start.toISOString()} to ${end.toISOString()}`);

    // Find all occurrences within the date range
    const occurrences = await RpmMassiveActionOccurrence.findAll({
      where: {
        date: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: RpmBlockMassiveAction,
          as: 'action',
          include: [
            {
              association: 'category',
              attributes: ['id', 'name', 'type', 'color']
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['hour', 'ASC']]
    });

    console.log(`Found ${occurrences.length} occurrences total`);

    // Group occurrences by date
    const eventsByDate: Record<string, any> = {};
    
    // Track which action IDs we've already seen for each date to prevent duplicates
    const processedActionsByDate: Record<string, Set<string>> = {};
    
    occurrences.forEach(occurrence => {
      const dateKey = format(new Date(occurrence.date), 'yyyy-MM-dd');
      const actionId = occurrence.actionId;
      
      // Initialize tracking set for this date if it doesn't exist
      if (!processedActionsByDate[dateKey]) {
        processedActionsByDate[dateKey] = new Set<string>();
      }
      
      // Skip if we've already processed this action for this date
      if (processedActionsByDate[dateKey].has(actionId)) {
        console.log(`Skipping duplicate actionId ${actionId} for date ${dateKey}`);
        return;
      }
      
      // Mark this action as processed for this date
      processedActionsByDate[dateKey].add(actionId);
      
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = {
          date: dateKey,
          events: [] as any[]
        };
      }
      
      // Create an event object from the occurrence
      const event = {
        id: occurrence.id,
        actionId: occurrence.actionId,
        text: occurrence.action?.text,
        color: occurrence.action?.color,
        textColor: occurrence.action?.textColor,
        hour: occurrence.hour,
        leverage: occurrence.leverage,
        durationAmount: occurrence.durationAmount,
        durationUnit: occurrence.durationUnit,
        location: occurrence.location,
        status: occurrence.action?.status || 'new',
        categoryId: occurrence.action?.categoryId,
        isDateRange: occurrence.action?.isDateRange || false,
      };
      
      eventsByDate[dateKey].events.push({
        date: dateKey,
        ...event
      });
    });
    
    // Convert to array and sort by date
    const events = Object.values(eventsByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Log how many unique events we're returning per date
    events.forEach(day => {
      console.log(`${day.date}: ${day.events.length} unique events`);
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events by date range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events by date range' });
  }
};




export const getCalendarEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`[getCalendarEventById] Request received for ID: ${id}`);

    // First try to fetch the action directly
    console.log(`[getCalendarEventById] Fetching action with ID: ${id}`);
    let action = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { association: 'category', attributes: ['id', 'name', 'type', 'color'] },
        { 
          association: 'notes',    
          attributes: [
            'id', 
            'text', 
            'type', 
            ['created_at', 'created_at'], 
            ['updated_at', 'updated_at'] 
          ] 
        }
      ]
    });
    
    // If action not found, check if this is an occurrence ID
    if (!action) {
      console.log(`[getCalendarEventById] Action not found, checking if it's an occurrence ID: ${id}`);
      const occurrence = await RpmMassiveActionOccurrence.findByPk(id, {
        include: [
          { 
            model: RpmBlockMassiveAction,
            as: 'action',
            include: [
              { association: 'category', attributes: ['id', 'name', 'type', 'color'] },
              { 
                association: 'notes',    
                attributes: [
                  'id', 
                  'text', 
                  'type', 
                  ['created_at', 'created_at'], 
                  ['updated_at', 'updated_at']
                ] 
              }
            ]
          }
        ]
      });
      
      if (occurrence && occurrence.action) {
        console.log(`[getCalendarEventById] Found occurrence, using parent action: ${occurrence.actionId}`);
        action = occurrence.action;
      }
    }
    
    if (!action) {
      console.error(`[getCalendarEventById] Calendar event not found for ID: ${id}`);
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    
    console.log(`[getCalendarEventById] Action found: ${action.id}`);

    // Build a single event object
    const evtDate = action.startDate
      ? format(new Date(action.startDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');

    const eventObj = {
      id: action.id,
      actionId: action.id,
      date: evtDate,
      text: action.text,
      color: action.color,
      textColor: action.textColor,
      hour: action.hour,
      leverage: action.leverage,
      durationAmount: action.durationAmount,
      durationUnit: action.durationUnit,
      location: action.location,
      status: action.status || 'new',
      categoryId: action.categoryId,
      isDateRange: action.isDateRange,
      notes: action.notes?.map(n => ({
        id: n.id,
        text: n.text,
        type: n.type
      })) ?? [],
      startDate: action.startDate?.toISOString() ?? evtDate,
      endDate:   action.endDate  ?.toISOString() ?? evtDate,
      createdAt: action.createdAt.toISOString(),
      updatedAt: action.updatedAt.toISOString()
    };

    // Wrap in CalendarEventDay
    const response = {
      date: evtDate,
      events: [eventObj]
    };

    console.log(`[getCalendarEventById] Returning data for ID ${id}, date: ${evtDate}`);
    res.json(response);
  } catch (error) {
    console.error(`[getCalendarEventById] Error fetching calendar event:`, error);
    res.status(500).json({ error: 'Failed to fetch calendar event', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rpmBlockId = id;
  try {
    const {
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId,
      location,
      leverage,
      durationAmount,
      durationUnit
    } = req.body;

    // Create the massive action
    const action = await RpmBlockMassiveAction.create({
      id: uuidv4(),
      rpmBlockId,
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId
    });

    // If this is a single event (not a date range), create an occurrence
    if (!isDateRange && startDate) {
      await RpmMassiveActionOccurrence.create({
        id: uuidv4(),
        actionId: action.id,
        date: startDate,
        hour,
        location,
        leverage,
        durationAmount,
        durationUnit
      });
    }

    res.status(201).json(action);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId,
      location,
      leverage,
      durationAmount,
      durationUnit,
      notes,
      status
    } = req.body;

    console.log(`Updating calendar event with id=${id}, status=${status}`);

    // Find the action
    const action = await RpmBlockMassiveAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    // Update the action with the status parameter
    await action.update({
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      hour,
      categoryId,
      status
    });

    // Log the updated action status
    console.log(`Calendar event ${id} status updated to: ${action.status}`);

    // If this is a single event (not a date range), update or create an occurrence
    if (!isDateRange && startDate) {
      // Find existing occurrence for this date
      const existingOccurrence = await RpmMassiveActionOccurrence.findOne({
        where: {
          actionId: id,
          date: startDate
        }
      });

      if (existingOccurrence) {
        // Update existing occurrence
        await existingOccurrence.update({
          hour,
          location,
          leverage,
          durationAmount,
          durationUnit
        });

        // Handle notes if provided
        if (notes && Array.isArray(notes)) {
          // Delete existing notes
          await RpmBlockMassiveActionNote.destroy({
            where: {
              occurrenceId: existingOccurrence.id
            }
          });

          // Create new notes
          for (const note of notes) {
            await RpmBlockMassiveActionNote.create({
              occurrenceId: existingOccurrence.id,
              actionId: id,
              text: note.text,
              type: note.type
            });
          }
        }
      } else {
        // Create new occurrence
        const occurrence = await RpmMassiveActionOccurrence.create({
          id: uuidv4(),
          actionId: id,
          date: startDate,
          hour,
          location,
          leverage,
          durationAmount,
          durationUnit
        });

        // Create notes if provided
        if (notes && Array.isArray(notes)) {
          for (const note of notes) {
            await RpmBlockMassiveActionNote.create({
              occurrenceId: occurrence.id,
              actionId: id,
              text: note.text,
              type: note.type
            });
          }
        }
      }
    }

    // Fetch the updated action with all associations
    const updatedAction = await RpmBlockMassiveAction.findByPk(id, {
      include: [
        { 
          association: 'category',
          attributes: ['id', 'name', 'type', 'color']
        },
        {
          association: 'notes',
          attributes: ['id', 'text', 'type', 'created_at', 'updated_at']
        }
      ]
    });

    res.json(sanitizeSequelizeModel(updatedAction));
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the action
    const action = await RpmBlockMassiveAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    // Delete the action (this will cascade delete occurrences and notes)
    await action.destroy();

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

    if (!id || !date) {
      console.error('Missing parameters:', { id, date });
      return res.status(400).json({ error: 'Both id and date are required' });
    }

    console.log(`Deleting occurrence for action ${id} on date ${date}`);

    // Parse the date string, ensuring it's treated as UTC
    const [year, month, day] = date.split('-').map(Number);
    
    if (!year || !month || !day) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    }
    
    // Create a date object (month is 0-indexed)
    const inputDate = new Date(Date.UTC(year, month - 1, day));
    console.log('Parsed date:', inputDate.toISOString());
    
    // You could also set the time to the beginning of the day
    inputDate.setUTCHours(0, 0, 0, 0);
    
    console.log('Searching for occurrence with:', {
      actionId: id,
      date: inputDate.toISOString()
    });

    // Find any occurrence for this date
    const occurrence = await RpmMassiveActionOccurrence.findOne({
      where: {
        id: id,
        date: inputDate
      },
      logging: (sql) => console.log('Sequelize SQL:', sql)
    });

    if (!occurrence) {
      console.log(`No occurrence found for action ${id} on date ${date}`);
      // Try a more flexible date query if exact match fails
      console.log('Trying to find occurrences for the day regardless of time...');
      
      const startOfDay = new Date(Date.UTC(year, month - 1, day));
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(Date.UTC(year, month - 1, day));
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      const occurrenceWithinDay = await RpmMassiveActionOccurrence.findOne({
        where: {
          actionId: id,
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        logging: (sql) => console.log('Flexible date search SQL:', sql)
      });
      
      if (!occurrenceWithinDay) {
        console.log(`No occurrence found within day range for action ${id} on date ${date}`);
        return res.status(404).json({ 
          error: 'Occurrence not found for this date',
          details: {
            requestedDate: date,
            parsedDate: inputDate.toISOString(),
            dayRange: [startOfDay.toISOString(), endOfDay.toISOString()]
          }
        });
      }
      
      // We found an occurrence within the day range
      console.log(`Found occurrence with ID ${occurrenceWithinDay.id} within day range, deleting...`);
      await occurrenceWithinDay.destroy();
      return res.status(204).send();
    }

    console.log(`Found occurrence with ID ${occurrence.id}, deleting...`);

    // Delete the occurrence (this will cascade delete notes)
    await occurrence.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event by date:', error);
    // Include error details in response for better debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: 'Failed to delete calendar event by date',
      message: errorMessage
    });
  }
};

// export const getCalendarEventsByDateRange = async (req: Request, res: Response) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({ error: 'Start date and end date are required' });
//     }

//     const start = new Date(startDate as string);
//     const end = new Date(endDate as string);

//     // Find all occurrences within the date range
//     const occurrences = await RpmMassiveActionOccurrence.findAll({
//       where: {
//         date: {
//           [Op.between]: [start, end]
//         }
//       },
//       include: [
//         {
//           model: RpmBlockMassiveAction,
//           as: 'action',
//           include: [
//             {
//               association: 'category',
//               attributes: ['id', 'name', 'type', 'color']
//             }
//           ]
//         // },
//         // {
//         //   model: RpmBlockMassiveActionNote,
//         //   as: 'notes',
//         //   attributes: ['id', 'text', 'type', 'createdAt', 'updatedAt']
//         }
//       ],
//       order: [['date', 'ASC'], ['hour', 'ASC']]
//     });

//     // Group occurrences by date
//     const eventsByDate: Record<string, any> = {};
    
//     occurrences.forEach(occurrence => {
//       const dateKey = format(new Date(occurrence.date), 'yyyy-MM-dd');
      
//       if (!eventsByDate[dateKey]) {
//         eventsByDate[dateKey] = {
//           date: dateKey,
//           massiveActions: []
//         };
//       }
      
//       // Create a massive action object from the occurrence
//       const massiveAction = {
//         id: occurrence.actionId,
//         text: occurrence.action?.text,
//         color: occurrence.action?.color,
//         textColor: occurrence.action?.textColor,
//         hour: occurrence.hour,
//         leverage: occurrence.leverage,
//         durationAmount: occurrence.durationAmount,
//         durationUnit: occurrence.durationUnit,
//         location: occurrence.location,
   
//       };
      
//       eventsByDate[dateKey].massiveActions.push(massiveAction);
//     });
    
//     // Convert to array and sort by date
//     const events = Object.values(eventsByDate).sort((a, b) => 
//       new Date(a.date).getTime() - new Date(b.date).getTime()
//     );
    
//     res.json(events);
//   } catch (error) {
//     console.error('Error fetching calendar events by date range:', error);
//     res.status(500).json({ error: 'Failed to fetch calendar events by date range' });
//   }
// };

export const addNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, type } = req.body;

    console.log(`[addNote] Adding note to event with id: ${id}`);
    
    // First try to find an occurrence with this id
    const occurrence = await RpmMassiveActionOccurrence.findByPk(id, {
      include: [{
        model: RpmBlockMassiveAction,
        as: 'action'
      }]
    });
    
    // If we found an occurrence, add note to it
    if (occurrence) {
      console.log(`[addNote] Found occurrence, adding note to it and parent action: ${occurrence.actionId}`);
      const note = await RpmBlockMassiveActionNote.create({
        text,
        type,
        actionId: occurrence.actionId,
        occurrenceId: occurrence.id
      });

      return res.status(201).json({ note });
    }
    
    // If not an occurrence, try to find the action directly
    const action = await RpmBlockMassiveAction.findByPk(id);
    
    if (action) {
      console.log(`[addNote] Found action directly, looking for an occurrence to attach note to`);
      
      // Find the latest occurrence for this action, if any
      const latestOccurrence = await RpmMassiveActionOccurrence.findOne({
        where: { actionId: action.id },
        order: [['date', 'DESC']]
      });
      
      if (latestOccurrence) {
        console.log(`[addNote] Found latest occurrence ${latestOccurrence.id} for action ${action.id}`);
        const note = await RpmBlockMassiveActionNote.create({
          text,
          type,
          actionId: action.id,
          occurrenceId: latestOccurrence.id
        });
        
        return res.status(201).json({ note });
      } else {
        console.log(`[addNote] No occurrences found for action ${action.id}, creating one`);
        // Create a new occurrence for today if none exists
        const newOccurrence = await RpmMassiveActionOccurrence.create({
          id: uuidv4(),
          actionId: action.id,
          date: new Date()
        });
        
        const note = await RpmBlockMassiveActionNote.create({
          text,
          type,
          actionId: action.id,
          occurrenceId: newOccurrence.id
        });
        
        return res.status(201).json({ note });
      }
    }
    
    console.log(`[addNote] No action or occurrence found with id: ${id}`);
    return res.status(404).json({ error: 'Calendar event not found' });
  } catch (error) {
    console.error(`[addNote] Error adding note:`, error);
    return res.status(500).json({ error: 'Failed to add note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { text, type } = req.body;

    // Find the note
    const note = await RpmBlockMassiveActionNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note
    await note.update({
      text,
      type
    });

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;

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