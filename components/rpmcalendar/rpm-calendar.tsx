'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import CalendarDay from './calendar-day';
import ActionPopup from './action-popup';
import ActionItem from './action-item';
import CategoryBar from './category-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';

import { Category, RpmBlock, MassiveAction, CalendarEvent } from '@/types';


interface RpmCalendarProps {
  isDropDisabled: boolean;
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
    try {
      const response = await fetch('/api/calendar-events');
      const data: CalendarEvent[] = await response.json();
      setCalendarEvents(data);
  
      // Map de data naar een object van het type { [key: string]: MassiveAction[] }
      const assignments = data.reduce((acc: { [key: string]: MassiveAction[] }, event) => {
        acc[event.date] = event.actions.map((action) => ({
          id: action.id,
          text: action.text,
          color: action.color || '#000000', // Standaardkleur indien niet opgegeven
          leverage: 'default leverage', // Voeg standaardwaarde toe
          durationAmount: 1, // Voeg standaardwaarde toe
          durationUnit: 'hour', // Voeg standaardwaarde toe
          priority: 0, // Voeg standaardwaarde toe
          category: 'default category', // Voeg standaardwaarde toe
          notes: '', // Voeg standaardwaarde toe
          key: 'pending', // Voeg standaardwaarde toe
        }));
        return acc;
      }, {});
  
      // Update de state
      setActionAssignments(assignments);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const handleActionUpdate = (updatedAction: MassiveAction) => {
    setActionAssignments((prev) => {
      const updatedAssignments = { ...prev };
      Object.keys(updatedAssignments).forEach((dateKey) => {
        updatedAssignments[dateKey] = updatedAssignments[dateKey].map((action) =>
          action.id === updatedAction.id ? updatedAction : action
        );
      });
      return updatedAssignments;
    });

    setRpmBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        massiveActions: block.massiveActions.map((action) =>
          action.id === updatedAction.id ? updatedAction : action
        ),
      }))
    );
  };

  const handleDrop = (item: MassiveAction, dateKey: string) => {
    setActionAssignments((prev) => {
      const updatedAssignments = { ...prev };

      if (!updatedAssignments[dateKey]) {
        updatedAssignments[dateKey] = [];
      }

      if (!updatedAssignments[dateKey].some((action) => action.id === item.id)) {
        updatedAssignments[dateKey].push(item);
      }

      return updatedAssignments;
    });

    setCalendarEvents((prevEvents) => {
      const updatedEvents = [...prevEvents];
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

      return updatedEvents;
    });

    setRpmBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        massiveActions: block.massiveActions?.filter((action) => action.id !== item.id),
      }))
    );

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
  
    // Optioneel: Verwijder de actie op de backend
    fetch(`/api/calendar-events/${dateKey}/actions/${actionId}`, {
      method: 'DELETE',
    }).catch((error) => console.error('Error deleting action:', error));
  };

  const renderCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      const isCurrentDay = currentDate.getTime() === todayDate.getTime();

      const eventsForDay = calendarEvents?.filter((event) => event.date === dateKey);

      calendarDays.push(
        <CalendarDay
          day={currentDate.getDate()}
          month={currentDate.getMonth()}
          year={currentDate.getFullYear()}
          events={eventsForDay}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          onActionClick={setSelectedAction}
          onDrop={handleDrop}
          onActionRemove={handleActionRemove}
        />
      );
    }

    return calendarDays;
  };

  const isActionPlanned = (actionId: string) => {
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
            {rpmBlocks?.map((block) => (
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
                          {(block.purposes || []).map((purpose, index) => (
                            <li key={`${block.id}-purpose-${index}`}>{purpose}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="actions">
                      <AccordionTrigger>Acties</AccordionTrigger>
                      <AccordionContent>
                        {(block.massiveActions || []).map((action) => (
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
      {selectedAction && (
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