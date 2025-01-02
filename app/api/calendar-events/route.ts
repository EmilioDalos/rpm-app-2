import { NextResponse } from 'next/server';
   import { promises as fs } from 'fs';
   import path from 'path';

   const dataFilePath = path.join(process.cwd(), 'data', 'calendar-events.json');

   // GET: Fetch all calendar events
   export async function GET() {
     try {
       const fileContents = await fs.readFile(dataFilePath, 'utf8');
       const events = JSON.parse(fileContents);
       return NextResponse.json(events);
     } catch (error) {
       console.error('Failed to read calendar events:', error);
       return NextResponse.json({ error: 'Failed to load calendar events' }, { status: 500 });
     }
   }

   export async function POST(request: Request) {
    try {
      const { dateKey, action } = await request.json();
      const fileContents = await fs.readFile(dataFilePath, 'utf8');
      const events = JSON.parse(fileContents);
  
      const eventIndex = events.findIndex((event: any) => event.date === dateKey);
  
      if (eventIndex === -1) {
        // Event voor deze datum bestaat niet, voeg nieuw event toe
        events.push({
          id: `${dateKey}-${action.id}`,
          date: dateKey,
          massiveActions: [action], // Consistent gebruik van massiveActions
        });
      } else {
        // Event bestaat, voeg actie toe
        if (!events[eventIndex].massiveActions) {
          events[eventIndex].massiveActions = []; // Zorg dat massiveActions bestaat
        }
  
        // Controleer of actie al bestaat
        const actionExists = events[eventIndex].massiveActions.some(
          (existingAction: any) => existingAction.id === action.id
        );
  
        if (!actionExists) {
          events[eventIndex].massiveActions.push(action);
        }
      }
  
      // Schrijf bijgewerkte evenementen terug naar het bestand
      await fs.writeFile(dataFilePath, JSON.stringify(events, null, 2));
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error saving calendar event:', error);
      return NextResponse.json({ error: 'Failed to save the action' }, { status: 500 });
    }
  }

   // PUT: Update an existing calendar event by ID
   export async function PUT(request: Request) {
     try {
       const updatedEvent = await request.json();
       const { id } = updatedEvent;

       if (!id) {
         return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
       }

       const fileContents = await fs.readFile(dataFilePath, 'utf8');
       const events = JSON.parse(fileContents);

       const eventIndex = events.findIndex((event: { id: string }) => event.id === id);

       if (eventIndex === -1) {
         return NextResponse.json({ error: 'Event not found' }, { status: 404 });
       }

       events[eventIndex] = { ...events[eventIndex], ...updatedEvent };

       await fs.writeFile(dataFilePath, JSON.stringify(events, null, 2));
       return NextResponse.json(events[eventIndex]);
     } catch (error) {
       console.error('Failed to update calendar event:', error);
       return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
     }
   }

   // DELETE: Remove a calendar event by ID
   export async function DELETE(request: Request) {
     try {
       const { searchParams } = new URL(request.url);
       const id = searchParams.get('id');

       if (!id) {
         return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
       }

       const fileContents = await fs.readFile(dataFilePath, 'utf8');
       const events = JSON.parse(fileContents);

       const filteredEvents = events.filter((event: { id: string }) => event.id !== id);

       if (events.length === filteredEvents.length) {
         return NextResponse.json({ error: 'Event not found' }, { status: 404 });
       }

       await fs.writeFile(dataFilePath, JSON.stringify(filteredEvents, null, 2));
       return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
     } catch (error) {
       console.error('Failed to delete calendar event:', error);
       return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
     }
   }