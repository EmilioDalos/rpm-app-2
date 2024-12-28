'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import CalendarDay from './calendar-day';
const ActionPopup = dynamic(() => import('./action-popup'), { ssr: false })
import ActionItem from './action-item';
import CategoryBar from './category-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import dynamic from 'next/dynamic';

import { Category, RpmBlock, MassiveAction, CalendarEvent } from '@/types';

interface RpmCalendarProps {
  isDropDisabled: boolean;
}

function convertToMassiveAction(action: { id: string; text: string; color?: string }): MassiveAction {
  return {
    ...action,
    color: action.color || '#000000',
    leverage: 'default leverage',
    durationAmount: 1,
    durationUnit: 'hour',
    priority: 0,
    notes: [], // Initialiseer als lege array van Note[]
    key: 'pending',
  };
}

const RpmCalendar: React.FC<RpmCalendarProps> = ({ isDropDisabled }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rpmBlocks, setRpmBlocks] = useState<RpmBlock[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  });
  const [actionAssignments, setActionAssignments] = useState<{ [key: string]: MassiveAction[] }>({});
  const [selectedAction, setSelectedAction] = useState<MassiveAction | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchRpmBlocks();
    fetchCalendarEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRpmBlocks = async () => {
    try {
      const response = await fetch('/api/rpmblocks');
      const data = await response.json();
      setRpmBlocks(data);
    } catch (error) {
      console.error('Error fetching RPM blocks:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    console.log('Fetching calendar events...');
    try {
      const response = await fetch('/api/calendar-events');
      const data = await response.json();
  
      console.log('Raw calendar events from API:', data);
  
      const expandedEvents: CalendarEvent[] = [];
  
      data.forEach((event: CalendarEvent) => {
        event.actions.forEach((action) => {
          const actionStartDate = action.startDate ? new Date(`${action.startDate}T00:00:00Z`) : null;
          const actionEndDate = action.endDate ? new Date(`${action.endDate}T00:00:00Z`) : null;
  
          // Verwerk acties over meerdere dagen
          if (actionStartDate && actionEndDate) {
            let currentDate = new Date(actionStartDate);
            while (currentDate <= actionEndDate) {
              const dateKey = currentDate.toISOString().split('T')[0];
              const existingEvent = expandedEvents.find((e) => e.date === dateKey);
  
              if (existingEvent) {
                existingEvent.actions.push({ ...action });
              } else {
                expandedEvents.push({
                  id: `${dateKey}-${action.id}`,
                  date: dateKey,
                  actions: [{ ...action }],
                });
              }
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          } else {
            // Verwerk acties met een enkele datum of zonder datum
            const dateKey = event.date || 'unknown';
            const existingEvent = expandedEvents.find((e) => e.date === dateKey);
  
            if (existingEvent) {
              existingEvent.actions.push({ ...action });
            } else {
              expandedEvents.push({
                id: `${event.date}-${action.id}`,
                date: event.date,
                actions: [{ ...action }],
              });
            }
          }
  
          // Verwerk notities
          if (action.notes && action.notes.length > 0) {
            action.notes.forEach((note) => {
              const noteDate = note.createdAt
                ? new Date(note.createdAt).toISOString().split('T')[0]
                : 'unknown';
              const existingEvent = expandedEvents.find((e) => e.date === noteDate);
  
              if (existingEvent) {
                const actionIndex = existingEvent.actions.findIndex((a) => a.id === action.id);
                if (actionIndex >= 0) {
                  // Voeg de notitie toe aan een bestaande actie
                  existingEvent.actions[actionIndex].notes = [
                    ...(existingEvent.actions[actionIndex].notes || []),
                    note,
                  ];
                } else {
                  // Voeg een nieuwe actie toe met de notitie
                  existingEvent.actions.push({
                    ...action,
                    notes: [note],
                  });
                }
              } else {
                // Maak een nieuwe dagentry voor de notitie
                expandedEvents.push({
                  id: `${noteDate}-note-${action.id}`,
                  date: noteDate,
                  actions: [
                    {
                      ...action,
                      notes: [note],
                    },
                  ],
                });
              }
            });
          }
        });
      });
  
      console.log('Expanded calendar events:', expandedEvents);
  
      // Genereer actionAssignments van expandedEvents
      const assignments = expandedEvents.reduce((acc: { [key: string]: MassiveAction[] }, event) => {
        acc[event.date] = event.actions.map((action) => ({
          id: action.id,
          text: action.text,
          color: action.color || '#000000',
          leverage: action.leverage || '',
          durationAmount: action.durationAmount || 0,
          durationUnit: action.durationUnit || 'min',
          priority: action.priority || 0,
          notes: action.notes || [],
          key: action.key || 'pending',
          startDate: action.startDate ? new Date(`${action.startDate}T00:00:00Z`) : undefined,
          endDate: action.endDate ? new Date(`${action.endDate}T00:00:00Z`) : undefined,
          isDateRange: action.startDate && action.endDate ? true : false,
        }));
        return acc;
      }, {});
  
      // Update de states
      setCalendarEvents(expandedEvents);
      setActionAssignments(assignments);
  
      console.log('Action assignments:', assignments);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setCalendarEvents([]);
    }
  };
  
  const handleActionClick = (action: { id: string; text: string; color?: string }) => {
    const massiveAction = convertToMassiveAction(action);
    setSelectedAction(massiveAction);
    setIsPopupOpen(true);
  };

  const handleActionUpdate = async (updatedAction: MassiveAction) => {
    try {
      if (updatedAction.startDate && updatedAction.endDate) {
        // Verwerk actie over meerdere dagen
        let currentDate = new Date(updatedAction.startDate);
        const endDate = new Date(updatedAction.endDate);
  
        while (currentDate <= endDate) {
          const dateKey = currentDate.toISOString().split('T')[0];
  
          const actionPayload = {
            ...updatedAction,
            startDate: undefined, // Startdatum niet opnieuw doorgeven per dag
            endDate: undefined,   // Einddatum niet opnieuw doorgeven per dag
          };
  
          // Controleer of de actie al bestaat om te bepalen of het een PUT of POST moet zijn
          const response = await fetch(`/api/calendar-events/${dateKey}/actions/${updatedAction.id}`);
          if (response.ok) {
            // Gebruik PUT als de actie al bestaat
            await fetch(`/api/calendar-events/${dateKey}/actions/${updatedAction.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(actionPayload),
            });
            console.log(`Action updated for date ${dateKey}:`, actionPayload);
          } else {
            // Gebruik POST als de actie nieuw is
            await fetch('/api/calendar-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dateKey,
                action: actionPayload,
              }),
            });
            console.log(`New action created for date ${dateKey}:`, actionPayload);
          }
  
          currentDate.setDate(currentDate.getDate() + 1); // Ga naar de volgende dag
        }
      } else {
        // Verwerk een enkelvoudige datumactie
        const dateKey = updatedAction.startDate
          ? updatedAction.startDate.toISOString().split('T')[0]
          : 'unknown';
  
        const actionPayload = {
          ...updatedAction,
          startDate: updatedAction.startDate?.toISOString(),
          endDate: updatedAction.endDate?.toISOString(),
        };
  
        // Controleer of de actie al bestaat om te bepalen of het een PUT of POST moet zijn
        const response = await fetch(`/api/calendar-events/${dateKey}/actions/${updatedAction.id}`);
        if (response.ok) {
          // Gebruik PUT als de actie al bestaat
          await fetch(`/api/calendar-events/${dateKey}/actions/${updatedAction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionPayload),
          });
          console.log(`Action updated for date ${dateKey}:`, actionPayload);
        } else {
          // Gebruik POST als de actie nieuw is
          await fetch('/api/calendar-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dateKey,
              action: actionPayload,
            }),
          });
          console.log(`New action created for date ${dateKey}:`, actionPayload);
        }
      }
  
      // Vernieuw de kalender na het bijwerken
      await fetchCalendarEvents();
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };
  
  const handleDrop = (item: MassiveAction, dateKey: string) => {
    setActionAssignments((prev) => {
      const updatedAssignments = { ...prev };
  
      if (item.isDateRange && item.startDate && item.endDate) {
        let currentDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        while (currentDate <= endDate) {
          const currentDateKey = currentDate.toISOString().split('T')[0];
          if (!updatedAssignments[currentDateKey]) {
            updatedAssignments[currentDateKey] = [];
          }
          if (!updatedAssignments[currentDateKey].some((action) => action.id === item.id)) {
            updatedAssignments[currentDateKey].push(item);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
      if (!updatedAssignments[dateKey]) {
        updatedAssignments[dateKey] = [];
      }
      if (!updatedAssignments[dateKey].some((action) => action.id === item.id)) {
        updatedAssignments[dateKey].push(item);
        }
      }
  
      return updatedAssignments;
    });
  
    setCalendarEvents((prevEvents) => {
      const updatedEvents = [...prevEvents];
      
      if (item.isDateRange && item.startDate && item.endDate) {
        let currentDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        while (currentDate <= endDate) {
          const currentDateKey = currentDate.toISOString().split('T')[0];
          const existingEventIndex = updatedEvents.findIndex((event) => event.date === currentDateKey);
  
          if (existingEventIndex >= 0) {
            const existingEvent = updatedEvents[existingEventIndex];
            if (!existingEvent.actions.some((action) => action.id === item.id)) {
              existingEvent.actions.push({
                id: item.id,
                text: item.text,
                color: item.color,
                isDateRange: item.isDateRange,
                startDate: item.startDate,
                endDate: item.endDate,
              });
            }
          } else {
            updatedEvents.push({
              id: `${currentDateKey}-${item.id}`,
              date: currentDateKey,
              actions: [{
                id: item.id,
                text: item.text,
                color: item.color,
                isDateRange: item.isDateRange,
                startDate: item.startDate,
                endDate: item.endDate,
              }],
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
      const existingEventIndex = updatedEvents.findIndex((event) => event.date === dateKey);
  
      if (existingEventIndex >= 0) {
        const existingEvent = updatedEvents[existingEventIndex];
        if (!existingEvent.actions.some((action) => action.id === item.id)) {
          existingEvent.actions.push({
            id: item.id,
            text: item.text,
            color: item.color,
          });
        }
      } else {
        updatedEvents.push({
          id: `${dateKey}-${item.id}`,
          date: dateKey,
          actions: [{ id: item.id, text: item.text, color: item.color }],
        });
        }
      }
  
      return updatedEvents;
    });

    fetch('/api/calendar-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateKey, action: item }),
    }).catch((error) => console.error('Error saving action:', error));
  };

  const handleActionRemove = (actionId: string, dateKey: string) => {
    setActionAssignments((prev) => {
      const updatedAssignments = { ...prev };
      if (updatedAssignments[dateKey]) {
        updatedAssignments[dateKey] = updatedAssignments[dateKey].filter((action) => action.id !== actionId);
      }
      return updatedAssignments;
    });
  
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.date === dateKey
          ? {
              ...event,
              actions: event.actions.filter((action) => action.id !== actionId),
            }
          : event
      )
    );
  
    fetch(`/api/calendar-events/${dateKey}/actions/${actionId}`, {
      method: 'DELETE',
    }).catch((error) => console.error('Error deleting action:', error));
  };

  const renderCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().toISOString().split('T')[0]); // Forceer UTC voor vandaag
  
    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setUTCDate(currentWeekStart.getUTCDate() + i); // Gebruik UTC voor het berekenen van de dagen
      const dateKey = currentDate.toISOString().split('T')[0]; // Forceer UTC
      const isCurrentDay = todayDate.toISOString().split('T')[0] === dateKey; // Controleer in UTC
  
      const eventsForDay = calendarEvents.filter((event) => event.date === dateKey);
  
      calendarDays.push(
        <CalendarDay
          key={dateKey}
          day={currentDate.getUTCDate()} // Gebruik UTC voor dagweergave
          month={currentDate.getUTCMonth()}
          year={currentDate.getUTCFullYear()}
          events={eventsForDay}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          onActionClick={handleActionClick}
          onDrop={handleDrop}
          onActionRemove={handleActionRemove}
        />
      );
    }
  
    return calendarDays;
  };

  

  const isActionPlanned = (actionId: string) => {
    console.log("actionId"+actionId)
    
    return Object.values(actionAssignments).some((actions) =>
      actions.some((action) => action.id === actionId)
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={setActiveCategory}
        />
        <div className="w-1/4 p-4 border-r">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            <h2 className="text-2xl font-bold mb-4">RPM Plannen</h2>
            {rpmBlocks.map((block) => (
              <Card key={block.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{block.result}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="purposes">
                      <AccordionTrigger>Doelen</AccordionTrigger>
                      <AccordionContent>
                        <ul>
                          {block.purposes?.map((purpose, index) => (
                            <li key={`${block.id}-purpose-${index}`}>{purpose}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="actions">
                      <AccordionTrigger>Acties</AccordionTrigger>
                      <AccordionContent>
                        {block.massiveActions?.map((action) => (
                          <ActionItem
                            key={`${block.id}-${action.id}`}
                            action={action}
                            isPlanned={isActionPlanned(action.id)}
                            onClick={() => {
                              setSelectedAction(action);
                              setIsPopupOpen(true);
                            }}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
        <div className="w-3/4 p-4">
          <div className="flex justify-between mb-4">
            <Button onClick={() => setCurrentWeekStart((prev) => new Date(prev.setDate(prev.getDate() - 7)))}>
              <ChevronLeft />
            </Button>
            <h2 className="text-2xl">{`${format(currentWeekStart, 'dd-MM-yyyy', { locale: enGB })}`}</h2>
            <Button onClick={() => setCurrentWeekStart((prev) => new Date(prev.setDate(prev.getDate() + 7)))}>
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      </div>
      {selectedAction && isPopupOpen && (
        <ActionPopup
          action={selectedAction}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onUpdate={handleActionUpdate}
        />
      )}
    </DndProvider>
  );
};

export default RpmCalendar;

