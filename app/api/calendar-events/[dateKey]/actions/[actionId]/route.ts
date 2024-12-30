import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { CalendarEvent, MassiveAction } from '@/types';


const filePath = path.join(process.cwd(), 'data', 'calendar-events.json');



async function readCalendarEvents(): Promise<CalendarEvent[]> {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeCalendarEvents(events: CalendarEvent[]) {
  await fs.writeFile(filePath, JSON.stringify(events, null, 2));
}

function isValidMassiveAction(action: any): action is MassiveAction {
  return (
    typeof action.id === 'string' &&
    typeof action.text === 'string' &&
    (typeof action.color === 'string' || action.color === undefined) &&
    typeof action.leverage === 'string' &&
    typeof action.durationAmount === 'number' &&
    typeof action.durationUnit === 'string' &&
    typeof action.priority === 'number' &&
    Array.isArray(action.notes) &&
    typeof action.key === 'string' &&
    (typeof action.startDate === 'string' || action.startDate === undefined) &&
    (typeof action.endDate === 'string' || action.endDate === undefined) &&
    (typeof action.isDateRange === 'boolean' || action.isDateRange === undefined)
  );
}



export async function PUT(
  req: Request,
  { params }: { params: { dateKey: string; actionId: string } }
) {
  const { dateKey, actionId } = params;
  const actionIdNumber = parseInt(actionId, 10);

  try {
    const calendarEvents = await readCalendarEvents();

    // Vind het event op basis van dateKey
    const eventIndex = calendarEvents.findIndex((event: any) => event.date === dateKey);
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Zoek de actie binnen het event
    const actionIndex = calendarEvents[eventIndex].actions.findIndex(
      (action: any) => action.id === actionIdNumber
    );
    if (actionIndex === -1) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Lees de nieuwe data van de request body
    const { action: updatedAction } = await req.json();

    // Update de actie
    calendarEvents[eventIndex].actions[actionIndex] = {
      ...calendarEvents[eventIndex].actions[actionIndex],
      ...updatedAction,
      updatedAt: new Date().toISOString(),
    };

    // Update het event's updatedAt
    calendarEvents[eventIndex].updatedAt = new Date().toISOString();

    // Schrijf de data terug naar het bestand
    await fs.writeFile(filePath, JSON.stringify(calendarEvents, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update action:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { dateKey: string; actionId: string } }
) {
  const { dateKey, actionId } = params;

  try {
    const calendarEvents = await readCalendarEvents();

    // Vind het event op basis van dateKey
    const eventIndex = calendarEvents.findIndex((event: any) => event.date === dateKey);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = calendarEvents[eventIndex];
    // Verwijder de actie met het gegeven actionId
    event.actions = event.actions.filter((action: any) => action.id !== parseInt(actionId, 10));

    // Als er geen acties meer over zijn, verwijder het hele event
    if (event.actions.length === 0) {
      calendarEvents.splice(eventIndex, 1);
    }

    await writeCalendarEvents(calendarEvents);

    return NextResponse.json({ message: 'Action successfully removed' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting action:', error);
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { dateKey: string; actionId: string } }
) {
  const { dateKey, actionId } = params;

  try {
    const calendarEvents = await readCalendarEvents();

    // Vind het event op basis van dateKey
    const event = calendarEvents.find((event: any) => event.date === dateKey);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Zoek de actie binnen het event
    const action = event.actions.find((action: any) => action.id === parseInt(actionId, 10));

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json(action, { status: 200 });
  } catch (error) {
    console.error('Error retrieving action:', error);
    return NextResponse.json({ error: 'Failed to retrieve action' }, { status: 500 });
  }
}

