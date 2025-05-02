import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import RpmBlockMassiveAction from '../models/RpmBlockMassiveAction';
import sequelize from '../config/db';
import { Op, QueryTypes } from 'sequelize';
import { sanitizeSequelizeModel } from '../utils/sanitizeSequelizeModel';
import RpmMassiveActionOccurrence from '../models/RpmMassiveActionOccurrence';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import RpmBlockMassiveActionNote from '../models/RpmBlockMassiveActionNote';
import RpmBlock from '../models/RpmBlock';
import RpmMassiveActionRecurrence from '../models/RpmMassiveActionRecurrence';
import Category from '../models/Category';

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

// Extend the RpmMassiveActionOccurrence interface
interface ExtendedRpmMassiveActionOccurrence extends RpmMassiveActionOccurrence {
  leverage?: string;
  durationAmount?: number;
  durationUnit?: string;
  location?: string;
}

// Extend the RpmBlockMassiveAction interface
interface ExtendedRpmBlockMassiveAction extends RpmBlockMassiveAction {
  rpmBlock?: RpmBlock;
  occurrences?: RpmMassiveActionOccurrence[];
  notes?: RpmBlockMassiveActionNote[];
}

interface RpmBlockMassiveAction {
  id: string;
  text: string;
  color: string;
  textColor?: string;
  status: string;
  startDate: Date;
  endDate: Date;
  hour?: number;
  leverage?: string;
  isDateRange?: boolean;
  categoryId?: string;
  durationAmount?: number;
  durationUnit?: string;
  location?: string;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  rpmBlockId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RpmMassiveActionOccurrenceCreationAttributes {
  id: string;
  actionId: string;
  date: Date;
  hour?: number;
  location?: string;
  durationAmount?: number;
  durationUnit?: string;
  leverage?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  text?: string;
}

interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;

  // Daily options
  dailyOption?: 'everyX' | 'workdays';
  dailyInterval?: number;

  // Weekly options
  weeklyDays?: DayOfWeek[];
  weeklyInterval?: number;

  // Monthly options
  monthlyOption?: 'fixedDay' | 'relativeDay';
  monthlyDay?: number;
  monthlyOrdinal?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  monthlyDayType?: 'day' | 'workday' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  monthlyInterval?: number;

  // Yearly options
  yearlyOption?: 'fixedDate' | 'relativeDay';
  yearlyMonth?: number;
  yearlyDay?: number;
  yearlyOrdinal?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  yearlyDayType?: 'day' | 'workday' | 'weekend' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  yearlyRelativeMonth?: number;
  yearlyInterval?: number;
}

interface DayOfWeek {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}

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
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'type', 'color']
            }
          ]
        },
        {
          model: RpmBlockMassiveActionNote,
          as: 'notes',
          attributes: ['id', 'text', 'type', 'createdAt', 'updatedAt']
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
      if (!occurrence.action) {
        console.log(`Skipping occurrence ${occurrence.id} because action is missing`);
        return;
      }

      const action = occurrence.action;
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
        date: dateKey,
        text: occurrence.action?.text || '',
        color: occurrence.action?.color || '#000000',
        notes: occurrence.notes || [],
        leverage: action.leverage,
        durationAmount: occurrence.durationAmount,
        durationUnit: occurrence.durationUnit,
        location: occurrence.location,
        status: occurrence.action?.status || 'new',
        categoryId: occurrence.action?.categoryId,
        isDateRange: occurrence.action?.isDateRange || false,
        startDate: occurrence.action?.startDate ? format(new Date(occurrence.action.startDate), 'yyyy-MM-dd') : dateKey,
        endDate: occurrence.action?.endDate ? format(new Date(occurrence.action.endDate), 'yyyy-MM-dd') : dateKey,
        isRecurringDays: false
      };

      if (event.isDateRange) {
        event.isRecurringDays = !!occurrence.action?.recurrencePattern;
      }

      eventsByDate[dateKey].events.push(event);
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
    }) as ExtendedRpmBlockMassiveAction | null;
    
    // If action not found, check if this is an occurrence ID
    let occurrence = null;
    if (!action) {
      console.log(`[getCalendarEventById] Action not found, checking if it's an occurrence ID: ${id}`);
      occurrence = await RpmMassiveActionOccurrence.findByPk(id, {
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
      }) as ExtendedRpmMassiveActionOccurrence | null;
      
      if (occurrence && occurrence.action) {
        console.log(`[getCalendarEventById] Found occurrence, using parent action: ${occurrence.actionId}`);
        action = occurrence.action as ExtendedRpmBlockMassiveAction;
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
      durationAmount: occurrence ? occurrence.durationAmount : action.durationAmount,
      durationUnit: occurrence ? occurrence.durationUnit : action.durationUnit,
      location: occurrence ? occurrence.location : action.location,
      status: action.status || 'new',
      categoryId: action.categoryId,
      isDateRange: action.isDateRange,
      notes: action.notes?.map((n: any) => ({
        id: n.id,
        text: n.text,
        type: n.type
      })) ?? [],
      startDate: action.startDate ? action.startDate.toISOString() : null,
      endDate: action.endDate ? action.endDate.toISOString() : null,
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

// Utility function to generate dates for a recurrence pattern
function getRecurrenceDates(start: Date, end: Date, pattern: string, recurrenceEndDate?: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(start);
  const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : end;
  
  while (current <= endDate) {
    dates.push(new Date(current));
    
    switch (pattern.toLowerCase()) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        // If pattern is an array of days of week (legacy support)
        if (Array.isArray(pattern)) {
          const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
          if (pattern.some((p: any) => p.dayOfWeek === dayOfWeek)) {
            dates.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        } else {
          throw new Error('Invalid recurrence pattern');
        }
    }
  }

  return dates;
}

export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { actionId, date, hour, location, durationAmount, durationUnit, isRecurring, recurrencePattern, recurrenceEndDate } = req.body;

    if (!actionId || !date) {
      return res.status(400).json({ error: 'Action ID and date are required' });
    }

    // Create the first occurrence
    const occurrence = await RpmMassiveActionOccurrence.create({
      actionId,
      date: new Date(date),
      hour,
      location,
      durationAmount,
      durationUnit
    });

    // If it's a recurring event, create all future occurrences
    if (isRecurring && recurrencePattern) {
      const startDate = new Date(date);
      const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      
      const recurrenceDates = getRecurrenceDates(startDate, endDate, recurrencePattern, recurrenceEndDate);
      
      // Skip the first date since we already created it
      for (let i = 1; i < recurrenceDates.length; i++) {
        await RpmMassiveActionOccurrence.create({
          actionId,
          date: recurrenceDates[i],
          hour,
          location,
          durationAmount,
          durationUnit
        });
      }
    }

    res.status(201).json(occurrence);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

// ...

export const updateCalendarEventByActionId = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    const {
      text,
      description,
      startDate,
      endDate,
      isDateRange,
      recurrencePattern,
      hour,
      categoryId,
      location,
      leverage,
      durationAmount,
      durationUnit,
      notes,
      status
    } = req.body;

    console.log(`Updating calendar event with id=${actionId}, status=${status}`);

    // Find the action
    const action = await RpmBlockMassiveAction.findByPk(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    // Update the action with the status parameter
    await action.update({
      text,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isDateRange,
      hour,
      categoryId,
      status: status || action.status
    });

    // Log the updated action status
    console.log(`Calendar event ${actionId} status updated to: ${action.status}`);

    // Delete all existing occurrences for this action
    await RpmMassiveActionOccurrence.destroy({ where: { actionId } });

    // If this is a single event (not a date range), create a single occurrence
    if (!isDateRange && startDate) {
      console.log(`Creating single occurrence for non-date-range event ${actionId}`);
      await RpmMassiveActionOccurrence.create({
        actionId,
        date: new Date(startDate),
        hour,
        location,
        durationAmount,
        durationUnit
      });
    } 
    // If this is a date range with recurrence pattern, create occurrences for each matching day
    else if (isDateRange && startDate && endDate && recurrencePattern) {
      console.log(`Creating occurrences for date range with recurrence pattern from ${startDate} to ${endDate}`);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Generate dates based on recurrence pattern
      const dates = getRecurrenceDates(start, end, recurrencePattern);
      
      // Create an occurrence for each matching date
      for (const date of dates) {
        await RpmMassiveActionOccurrence.create({
          actionId,
          date,
          hour,
          location,
          durationAmount,
          durationUnit
        });
      }
      console.log(`Created ${dates.length} occurrences for recurrence pattern`);
    }
    // If this is a regular date range, create occurrences for each day
    else if (isDateRange && startDate && endDate) {
      console.log(`Creating occurrences for date range from ${startDate} to ${endDate}`);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = getDateRange(start, end);
      
      for (const date of dates) {
        await RpmMassiveActionOccurrence.create({
          actionId,
          date,
          hour,
          location,
          durationAmount,
          durationUnit
        });
      }
      console.log(`Created ${dates.length} occurrences for date range`);
    }

    // Fetch the updated action with all associations
    const updatedAction = await RpmBlockMassiveAction.findByPk(actionId, {
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

    const actionJson = sanitizeSequelizeModel(updatedAction);
    actionJson.isRecurringDays = !!recurrencePattern;
    res.json(actionJson);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { occurrenceId } = req.params;
    const { hour, location, durationAmount, durationUnit } = req.body;

    // Update the occurrence
    const occurrence = await RpmMassiveActionOccurrence.findByPk(occurrenceId);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    // Update the occurrence with basic fields
    await occurrence.update({
      hour,
      location,
      durationAmount,
      durationUnit
    });

    // Return the updated occurrence
    const updatedOccurrence = await RpmMassiveActionOccurrence.findByPk(occurrenceId);
    res.json(sanitizeSequelizeModel(updatedOccurrence));
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};