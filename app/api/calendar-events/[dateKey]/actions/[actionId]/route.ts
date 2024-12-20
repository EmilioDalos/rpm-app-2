import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'calendar-events.json');

async function readCalendarEvents() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeCalendarEvents(events: any[]) {
  await fs.writeFile(filePath, JSON.stringify(events, null, 2));
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