'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import CalendarDay from './calendar-day';
import HourSlot from './hour-slot';
import ActionItem from './action-item';
import CategoryBar from './category-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { nl as nlLocale } from "date-fns/locale";
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Category, RpmBlock, MassiveAction, CalendarEvent, Note } from '@/types';

import MiniCalendar from './mini-calendar';

const ActionPopup = dynamic(() => import('./action-popup'), { ssr: false });
const CalendarPopup = dynamic(() => import('./calendar-popup'), { ssr: false });

interface Purpose {
  purpose: string;
}

interface RpmCalendarProps {
  isDropDisabled: boolean;
}

type ViewMode = "day" | "week" | "month";

const RpmCalendar: React.FC<RpmCalendarProps> = ({ isDropDisabled }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rpmBlocks, setRpmBlocks] = useState<RpmBlock[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedAction, setSelectedAction] = useState<MassiveAction | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isCalendarPopupOpen, setIsCalendarPopupOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRpmBlocks();
    fetchCalendarEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      console.log('Categories API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRpmBlocks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rpmblocks`);
      const data = await response.json();
      setRpmBlocks(data);
    } catch (error) {
      console.error('Error fetching RPM blocks:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events`);
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
    setIsCalendarPopupOpen(true);
  };

  const handleActionUpdate = async (updatedAction: MassiveAction, dateKey: string) => {
    try {
      await updateCalendarEvent(dateKey, updatedAction);

      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.date === dateKey) {
            return {
              ...event,
              massiveActions: event.massiveActions.map((action) =>
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${dateKey}/actions/${action.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action,
        title: action.text || 'Nieuwe actie',
        description: action.leverage || ''
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update calendar event');
    }
  };

  const handleDrop = async (item: MassiveAction, dateKey: string) => {
    const category = categories.find(c => c.id === item.categoryId);
    const newAction: MassiveAction = {
      ...item,
      leverage: item.leverage || '',
      durationAmount: item.durationAmount || 0,
      durationUnit: item.durationUnit || 'min',
      priority: item.priority || 1,
      key: '📅',
      notes: item.notes || [],
      isDateRange: item.isDateRange || false,
      selectedDays: item.selectedDays || [],
      color: category?.color || '#e0e0e0',
      categoryId: item.categoryId,
      hour: item.hour !== undefined ? item.hour : 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCalendarEvents((prevEvents) => {
      const updatedEvents = [...prevEvents];
      const existingEventIndex = updatedEvents.findIndex((event) => event.date === dateKey);

      if (existingEventIndex >= 0) {
        // Zorg ervoor dat massiveActions bestaat en een array is
        if (!updatedEvents[existingEventIndex].massiveActions) {
          updatedEvents[existingEventIndex].massiveActions = [];
        }
      
        if (!updatedEvents[existingEventIndex].massiveActions.some((action) => action.id === newAction.id)) {
          updatedEvents[existingEventIndex].massiveActions.push(newAction);
          updatedEvents[existingEventIndex].updatedAt = new Date().toISOString();
        }
      } else {
        updatedEvents.push({
          id: `${dateKey}-${newAction.id}`,
          date: dateKey,
          massiveActions: [newAction], // Zorg ervoor dat massiveActions wordt geïnitialiseerd als een array
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      return updatedEvents;
    });

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateKey, 
          action: newAction,
          title: newAction.text || 'Nieuwe actie',
          description: newAction.leverage || '',
          startDate: new Date(dateKey).toISOString(),
          endDate: new Date(dateKey).toISOString(),
          categoryId: newAction.categoryId
        }),
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
            massiveActions: event.massiveActions.filter((action) => action.id !== actionId),
            updatedAt: new Date().toISOString()
          };
        }
        return event;
      })
    );
  
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${dateKey}/actions/${actionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  const handleNavigatePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else if (viewMode === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addDays(prev, -1));
    }
  };

  const handleNavigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else if (viewMode === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addDays(prev, 1));
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const renderMonthCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    // Voor maandweergave, inclusief dagen uit vorige/volgende maand
    const startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

    let currentDay = startDate;

    while (currentDay <= endDate) {
      const dateKey = format(currentDay, "yyyy-MM-dd");
      const isCurrentDay = isSameDay(currentDay, todayDate);
      const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();

      const eventsForDay = calendarEvents.filter((event) => event.date === dateKey);

      calendarDays.push(
        <CalendarDay
          key={dateKey}
          day={currentDay.getDate()}
          month={currentDay.getMonth()}
          year={currentDay.getFullYear()}
          events={eventsForDay}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          isCurrentMonth={isCurrentMonth}
          onActionClick={(action) => handleActionClick(action, dateKey)}
          onDrop={handleDrop}
          onActionRemove={handleActionRemove}
        />
      );

      currentDay = addDays(currentDay, 1);
    }

    return <div className="grid grid-cols-7 gap-1">{calendarDays}</div>;
  };

  const renderWeekCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const dateKey = format(currentDay, "yyyy-MM-dd");
      const isCurrentDay = isSameDay(currentDay, todayDate);

      const eventsForDay = calendarEvents.filter((event) => event.date === dateKey);

      calendarDays.push(
        <CalendarDay
          key={dateKey}
          day={currentDay.getDate()}
          month={currentDay.getMonth()}
          year={currentDay.getFullYear()}
          events={eventsForDay}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          onActionClick={(action) => handleActionClick(action, dateKey)}
          onDrop={handleDrop}
          onActionRemove={handleActionRemove}
        />
      );
    }

    return <div className="grid grid-cols-7 gap-1">{calendarDays}</div>;
  };

  const renderDayCalendar = () => {
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const isCurrentDay = isSameDay(currentDate, todayDate);

    const eventsForDay = calendarEvents.filter((event) => event.date === dateKey);

    // Genereer 24 tijdslots voor de dag
    const hourSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      hourSlots.push(
        <div key={`${dateKey}-${hour}`} className="flex items-center">
          <div className="w-16 text-right pr-2 text-sm text-muted-foreground">
            {hour}:00
          </div>
          <div className="flex-1">
            <HourSlot
              dateKey={dateKey}
              hour={hour}
              events={eventsForDay}
              isToday={isCurrentDay}
              onActionClick={(action) => handleActionClick(action, dateKey)}
              onDrop={(item) => handleDrop(item, dateKey)}
              onActionRemove={(actionId) => handleActionRemove(actionId, dateKey)}
            />
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold mb-2">{format(currentDate, "EEEE dd MMMM yyyy", { locale: nlLocale })}</div>
          <div className="flex flex-col gap-0.5">
            {hourSlots}
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderCalendar = () => {
    if (viewMode === "month") {
      return renderMonthCalendar();
    } else if (viewMode === "week") {
      return renderWeekCalendar();
    } else {
      return renderDayCalendar();
    }
  };

  const isActionPlanned = (actionId: string) => {
    return calendarEvents?.some((event) => 
      event.massiveActions?.some((action) => action.id === actionId)
    );
  };

  const filteredRpmBlocks = activeCategory
    ? rpmBlocks.filter(block => block.categoryId === activeCategory)
    : rpmBlocks;

  const getCalendarTitle = () => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "dd MMM", { locale: nlLocale })} - ${format(weekEnd, "dd MMM yyyy", { locale: nlLocale })}`;
    } else if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy", { locale: nlLocale });
    } else {
      return format(currentDate, "EEEE dd MMMM yyyy", { locale: nlLocale });
    }
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
          <div className="mb-6">
            <MiniCalendar selectedDate={currentDate} onDateSelect={handleDateSelect} />
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <h2 className="text-2xl font-bold mb-4">
              {activeCategory 
                ? `RPM Plannen - ${categories.find(c => c.id === activeCategory)?.name}` 
                : 'Alle RPM Plannen'}
            </h2>
            {filteredRpmBlocks?.map((block) => (
              <Card key={block.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="flex flex-col">
                    {block.categoryId ? (
                      <span className="uppercase font-bold text-lg">
                        {categories.find(c => c.id === block.categoryId)?.name || ""}
                      </span>
                    ) : (
                      <span className="uppercase font-bold text-lg">{block.type}</span>
                    )}
                    <span className="text-sm text-gray-500">
                      {block.type}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 font-medium">{block.result}</p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="purposes">
                      <AccordionTrigger>Purposes</AccordionTrigger>
                      <AccordionContent>
                        <ul>
                          {block.purposes?.map((purpose: string | Purpose, index) => (
                            <li key={`${block.id}-purpose-${index}`}>
                              {typeof purpose === 'string' ? purpose : purpose.purpose}
                            </li>
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
          <div className="flex justify-between items-center mb-4">
            <Button onClick={handleNavigatePrevious}>
              <ChevronLeft />
            </Button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl">{getCalendarTitle()}</h2>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="mt-2">
                <TabsList>
                  <TabsTrigger value="day">Dag</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Maand</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={handleNavigateNext}>
              <ChevronRight />
            </Button>
          </div>

          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                <div key={day} className="text-center font-semibold">
                  {day}
                </div>
              ))}
            </div>
          )}

          {renderCalendar()}
        </div>
        {selectedAction && isPopupOpen && (
          <ActionPopup
            action={selectedAction}
            dateKey={selectedDateKey || ""}
            isOpen={isPopupOpen}
            onClose={() => {
              setIsPopupOpen(false);
              setSelectedAction(null);
              setSelectedDateKey(null);
            }}
            onUpdate={handleActionUpdate}
          />
        )}
        {selectedAction && isCalendarPopupOpen && selectedDateKey && (
          <CalendarPopup
            action={selectedAction}
            dateKey={selectedDateKey}
            isOpen={isCalendarPopupOpen}
            onClose={() => {
              setIsCalendarPopupOpen(false);
              setSelectedAction(null);
              setSelectedDateKey(null);
            }}
            onUpdate={handleActionUpdate}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default RpmCalendar;

