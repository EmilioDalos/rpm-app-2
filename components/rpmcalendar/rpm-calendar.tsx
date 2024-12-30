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

import { Category, RpmBlock, MassiveAction, CalendarEvent, Note } from '@/types';

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
  const [selectedAction, setSelectedAction] = useState<MassiveAction | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

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
      const data = await response.json();
      setCalendarEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setCalendarEvents([]);
    }
  };

  const handleActionClick = (action: MassiveAction, dateKey: string) => {
    setSelectedAction(action);
    setSelectedDateKey(dateKey);
    setIsPopupOpen(true);
  };

  const handleActionUpdate = async (updatedAction: MassiveAction, dateKey: string) => {
    try {
      await updateCalendarEvent(dateKey, updatedAction);

      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.date === dateKey) {
            return {
              ...event,
              actions: event.actions.map((action) =>
                action.id === updatedAction.id ? updatedAction : action
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return event;
        })
      );

      await fetchCalendarEvents();
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const updateCalendarEvent = async (dateKey: string, action: MassiveAction) => {
    const response = await fetch(`/api/calendar-events/${dateKey}/actions/${action.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error('Failed to update calendar event');
    }
  };

  const handleDrop = async (item: MassiveAction, dateKey: string) => {
    const newAction: MassiveAction = {
      ...item,
      leverage: item.leverage || '',
      durationAmount: item.durationAmount || 0,
      durationUnit: item.durationUnit || 'min',
      priority: item.priority || 1,
      key: item.key || '✘',
      notes: item.notes || [],
      isDateRange: item.isDateRange || false,
      color: item.color || '#000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCalendarEvents((prevEvents) => {
      const updatedEvents = [...prevEvents];
      const existingEventIndex = updatedEvents.findIndex((event) => event.date === dateKey);

      if (existingEventIndex >= 0) {
        if (!updatedEvents[existingEventIndex].actions.some((action) => action.id === newAction.id)) {
          updatedEvents[existingEventIndex].actions.push(newAction);
          updatedEvents[existingEventIndex].updatedAt = new Date().toISOString();
        }
      } else {
        updatedEvents.push({
          id: `${dateKey}-${newAction.id}`,
          date: dateKey,
          actions: [newAction],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      return updatedEvents;
    });

    try {
      await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, action: newAction }),
      });
    } catch (error) {
      console.error('Error saving action:', error);
    }
  };

  const handleActionRemove = async (actionId: string, dateKey: string) => {
    setCalendarEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.date === dateKey) {
          return {
            ...event,
            actions: event.actions.filter((action) => action.id !== actionId),
            updatedAt: new Date().toISOString()
          };
        }
        return event;
      })
    );
  
    try {
      await fetch(`/api/calendar-events/${dateKey}/actions/${actionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  const renderCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      const isCurrentDay = currentDate.getTime() === todayDate.getTime();

      const eventsForDay = calendarEvents.filter((event) => event.date === dateKey);

      calendarDays.push(
        <CalendarDay
          key={dateKey}
          day={currentDate.getDate()}
          month={currentDate.getMonth()}
          year={currentDate.getFullYear()}
          events={eventsForDay}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          onActionClick={(action) => handleActionClick(action, dateKey)}
          onDrop={handleDrop}
          onActionRemove={handleActionRemove}
        />
      );
    }

    return calendarDays;
  };

  const isActionPlanned = (actionId: string) => {
    return calendarEvents.some((event) => 
      event.actions.some((action) => action.id === actionId)
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
      {selectedAction && isPopupOpen && selectedDateKey && (
        <ActionPopup
          action={selectedAction}
          dateKey={selectedDateKey}
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedDateKey(null);
          }}
          onUpdate={handleActionUpdate}
        />
      )}
    </DndProvider>
  );
};

export default RpmCalendar;

