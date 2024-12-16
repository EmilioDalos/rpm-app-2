import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'calendar-events.json');

// Helper-functie om calendar-events te lezen
async function readCalendarEvents() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper-functie om calendar-events te schrijven
async function writeCalendarEvents(calendarEvents: any[]) {
  await fs.writeFile(filePath, JSON.stringify(calendarEvents, null, 2));
}

// PUT (update) een bestaand calendar-event op basis van ID
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const updatedEvent = await req.json();
  const calendarEvents = await readCalendarEvents();

  const index = calendarEvents.findIndex((event: { id: string }) => event.id === id);
  if (index !== -1) {
    calendarEvents[index] = { ...updatedEvent, id };
    await writeCalendarEvents(calendarEvents);
    return NextResponse.json(calendarEvents[index]);
  } else {
    return NextResponse.json({ error: 'Calendar Event not found' }, { status: 404 });
  }
}

// DELETE een calendar-event op basis van ID
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const calendarEvents = await readCalendarEvents();
  const updatedCalendarEvents = calendarEvents.filter((event: { id: string }) => event.id !== id);

  if (updatedCalendarEvents.length === calendarEvents.length) {
    return NextResponse.json({ error: 'Calendar Event not found' }, { status: 404 });
  }

  await writeCalendarEvents(updatedCalendarEvents);
  return NextResponse.json({ message: 'Calendar Event deleted' });
}