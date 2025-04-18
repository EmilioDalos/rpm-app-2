'use client';

import React, { useState, useEffect, FC } from 'react';
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
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addDays, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { nl as nlLocale } from "date-fns/locale";
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDrag } from 'react-dnd';
import { Badge } from "@/components/ui/badge";

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

const RpmCalendar: FC<RpmCalendarProps> = ({ isDropDisabled }) => {
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
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, viewMode]);

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
      let startDate: Date;
      let endDate: Date;

      // Calculate date range based on view mode
      if (viewMode === "month") {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (viewMode === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        // Day view
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      }

      console.log(`Fetching calendar events for ${viewMode} view:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} calendar events from API:`, data);
      
      // The backend now handles the recurrence patterns correctly,
      // so we just need to group the events by date
      const groupedEvents = data.reduce((acc: { [key: string]: CalendarEvent }, action: MassiveAction) => {
        if (!action.startDate) return acc;
        
        const dateKey = format(new Date(action.startDate), "yyyy-MM-dd");
        
        if (acc[dateKey]) {
          // If we already have events for this date, merge the massiveActions
          acc[dateKey].massiveActions = [
            ...acc[dateKey].massiveActions,
            action
          ];
        } else {
          // Otherwise, add the event to the accumulator
          acc[dateKey] = {
            id: dateKey,
            date: dateKey,
            massiveActions: [action],
            createdAt: action.createdAt,
            updatedAt: action.updatedAt
          };
        }
        
        return acc;
      }, {});
      
      // Convert the grouped events back to an array
      const finalEvents = Object.values(groupedEvents) as CalendarEvent[];
      console.log(`Processed ${finalEvents.length} unique dates with events:`, finalEvents);
      
      setCalendarEvents(finalEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const handleActionClick = (action: MassiveAction, dateKey: string) => {
    setSelectedAction(action);
    setSelectedDateKey(dateKey);
    setIsCalendarPopupOpen(true);
  };

  const handleActionUpdate = async (updatedAction: MassiveAction, dateKey: string) => {
    try {
      console.log('Updating action:', updatedAction);
      
      // Update the calendar event via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${updatedAction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: updatedAction.text || 'Nieuwe actie',
          description: updatedAction.leverage || '',
          startDate: updatedAction.startDate,
          endDate: updatedAction.endDate,
          isDateRange: updatedAction.isDateRange,
          hour: updatedAction.hour,
          categoryId: updatedAction.categoryId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update calendar event');
      }

      // Update local calendar events state
      setCalendarEvents((prevEvents) => {
        const newEvents = [...prevEvents];
        const eventIndex = newEvents.findIndex(event => event.date === dateKey);
        
        if (eventIndex >= 0) {
          // Update existing event
          newEvents[eventIndex] = {
            ...newEvents[eventIndex],
            massiveActions: newEvents[eventIndex].massiveActions.map(action =>
              action.id === updatedAction.id ? updatedAction : action
            ),
            updatedAt: new Date().toISOString()
          };
        } else {
          // Create new event
          newEvents.push({
            id: `${dateKey}-${updatedAction.id}`,
            date: dateKey,
            massiveActions: [updatedAction],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        return newEvents;
      });

      // Update RPM blocks if the action exists there
      setRpmBlocks((prevBlocks) =>
        prevBlocks.map((block) => {
          if (block.massiveActions?.some(action => action.id === updatedAction.id)) {
            return {
              ...block,
              massiveActions: block.massiveActions.map(action =>
                action.id === updatedAction.id ? updatedAction : action
              ),
              updatedAt: new Date()
            };
          }
          return block;
        })
      );

      // Refresh data
      await Promise.all([
        fetchCalendarEvents(),
        fetchRpmBlocks()
      ]);

    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const handleDrop = async (item: MassiveAction, dateKey: string) => {
    const category = categories.find(c => c.id === item.categoryId);
    
    // Zoek het RPM block waar deze actie bij hoort
    const parentBlock = rpmBlocks.find(block => 
      block.massiveActions && block.massiveActions.some(action => action.id === item.id)
    );
    
    // Haal het rpmBlockId op
    const rpmBlockId = parentBlock?.id || item.id;
    
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
      
        // Als de event bestaat, update deze
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${newAction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: newAction,
            text: newAction.text || 'Nieuwe actie',
            description: newAction.leverage || '',
            startDate: new Date(dateKey).toISOString(),
            endDate: new Date(dateKey).toISOString(),
            categoryId: newAction.categoryId,
            rpmBlockId: rpmBlockId // Gebruik de rpmBlockId variabele
          }),
        });
        
        // Refresh calendar events after successful drop
        await fetchCalendarEvents();
      
    } catch (error) {
      console.error('Error saving/updating action:', error);
    }
  };

  const handleActionRemove = async (actionId: string, dateKey: string) => {
    // Update the local state to remove the action from the calendar view
    console.log('Removing action:', actionId, dateKey);
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
      // Find the action to check if it has a recurrence pattern
      const actionToRemove = calendarEvents
        .flatMap(event => event.massiveActions)
        .find(action => action.id === actionId);

      if (!actionToRemove) {
        console.error('Action not found:', actionId);
        return;
      }

      // Only clear dates if there's no recurrence pattern
      const updateData = actionToRemove?.recurrencePattern?.length 
        ? { hour: null }
        : { 
            startDate: null,
            endDate: null,
            isDateRange: false,
            hour: null,
            text: actionToRemove?.text // Preserve the title
          };

      console.log('Sending update data to backend:', updateData);

      // Update the action in the database using the actual UUID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(`Failed to update action: ${response.status}`);
      }
      
      // Refresh the RPM blocks to get the latest data
      await fetchRpmBlocks();
      
      // Refresh calendar events after removing an action
      await fetchCalendarEvents();
    } catch (error) {
      console.error('Error removing action from calendar:', error);
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

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const renderMonthCalendar = () => {
    const calendarDays = [];
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));

    const startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    console.log(`Rendering month calendar for ${currentDate.toISOString()}:`, )
    
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
          viewMode="month"
          onDayClick={handleDayClick}
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
      console.log(`Rendering week calendar for ${currentDate.toISOString()}:`, )  

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
          viewMode="week"
          onDayClick={handleDayClick}
        />
      );
    }

    return <div className="grid grid-cols-7 gap-1">{calendarDays}</div>;
  };

  const renderDayCalendar = () => {
    const todayDate = new Date(new Date().setHours(0, 0, 0, 0));
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const isCurrentDay = isSameDay(currentDate, todayDate);

    // Filter events for the current day, including date range events
    const eventsForDay = calendarEvents.filter((event) => {
      if (!event.date) return false;

      return event.massiveActions.some(action => {
        if (action.isDateRange && action.startDate && action.endDate) {
          const start = new Date(action.startDate);
          const end = new Date(action.endDate);
          const current = new Date(dateKey);
          
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          current.setHours(0, 0, 0, 0);
          
          return current >= start && current <= end;
        }
        
        return event.date === dateKey;
      });
    });

    console.log(`Events for day ${dateKey}:`, eventsForDay);
    
    // Genereer 24 tijdslots voor de dag, elk met 4 kwartieren
    const hourSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      hourSlots.push(
        <div key={`${dateKey}-${hour}`} className="flex items-start border-t border-gray-200">
          <div className="w-16 text-right pr-2 text-sm text-muted-foreground py-2">
            {hour.toString().padStart(2, '0')}:00
          </div>
          <div className="flex-1 relative min-h-[60px]">
            {/* Kwartierlijnen */}
            <div className="absolute w-full h-[15px] border-t border-gray-100" style={{ top: '15px' }} />
            <div className="absolute w-full h-[15px] border-t border-gray-100" style={{ top: '30px' }} />
            <div className="absolute w-full h-[15px] border-t border-gray-100" style={{ top: '45px' }} />
            
            {/* Events die in dit uur vallen */}
            {eventsForDay.map((event) => 
              event.massiveActions
                .filter(action => {
                  const actionHour = action.hour !== undefined ? Math.floor(action.hour) : 0;
                  return actionHour === hour;
                })
                .map((action) => {
                  const durationInMinutes = action.durationAmount * (action.durationUnit === 'hours' ? 60 : 1);
                  const heightInMinutes = Math.max(15, durationInMinutes); // Minimaal 15 minuten
                  const minuteOffset = action.hour !== undefined ? Math.round((action.hour % 1) * 60) : 0; // Bereken minuten offset
                  
                  return (
                    <div
                      key={action.id}
                      className="absolute left-0 right-2 rounded-md p-1 shadow-sm cursor-pointer hover:brightness-95 transition-all"
                      style={{
                        backgroundColor: action.color || '#e0e0e0',
                        color: action.textColor || '#000000',
                        height: `${heightInMinutes}px`,
                        minHeight: '15px',
                        top: `${minuteOffset}px`,
                        zIndex: 10
                      }}
                      onClick={() => handleActionClick(action, dateKey)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{action.text}</span>
                        <span className="text-xs opacity-75">
                          {durationInMinutes} min
                        </span>
                      </div>
                      {heightInMinutes >= 30 && action.leverage && (
                        <p className="text-xs mt-1 opacity-75">{action.leverage}</p>
                      )}
                      <button
                        className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionRemove(action.id, dateKey);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="flex flex-col">
          <div className="text-xl font-semibold mb-4">
            {format(currentDate, "EEEE dd MMMM yyyy", { locale: nlLocale })}
          </div>
          <div className="flex flex-col">
            {hourSlots}
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderCalendar = () => {
    switch (viewMode) {
      case "day":
        return renderDayCalendar();
      case "week":
        return renderWeekCalendar();
      case "month":
        return renderMonthCalendar();
      default:
        return null;
    }
  };

  const getCalendarTitle = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, d MMMM yyyy");
      case "week":
        return `Week ${format(currentDate, "w")} van ${format(currentDate, "MMMM yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return "Kalender";
    }
  };

  const isActionPlanned = (actionId: string, massiveAction: MassiveAction) => {


    const hasStartEndDate = !!massiveAction.startDate && !!massiveAction.endDate;
    const hasRecurrence = Array.isArray(massiveAction.recurrencePattern) && massiveAction.recurrencePattern.length > 0;
    let isInCalendar = false;  
    
    if (hasStartEndDate && !hasRecurrence) {
      isInCalendar = true;  
    }
    if (!hasStartEndDate && hasRecurrence) {
      isInCalendar = true;  
    }
    if (hasStartEndDate && hasRecurrence) { 
      isInCalendar = true;  
    }
    // Check if the action has a recurrence pattern
    const hasRecurrencePattern = (massiveAction.recurrencePattern?.length ?? 0) > 0;
         
    // An action is considered planned if it's in the calendar or has a recurrence pattern
    return isInCalendar || hasRecurrencePattern;
  };

  const ActionItem = ({ action, isPlanned, onClick }: { action: any; isPlanned: boolean; onClick: () => void }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'action',
      item: action,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const [showPopup, setShowPopup] = useState(false);

    const handleActionUpdate = async (updatedAction: MassiveAction, dateKey: string) => {
      try {
        // Update the action in the RPM blocks
        const updatedBlocks = rpmBlocks.map(block => {
          if (block.massiveActions?.some(a => a.id === updatedAction.id)) {
            return {
              ...block,
              massiveActions: block.massiveActions.map(a =>
                a.id === updatedAction.id ? updatedAction : a
              )
            };
          }
          return block;
        });
        setRpmBlocks(updatedBlocks);

        // Als de actie gepland is, update deze in de kalender via de API
        if (updatedAction.startDate) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${updatedAction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: updatedAction.text || 'Nieuwe actie',
              description: updatedAction.leverage || '',
              startDate: updatedAction.startDate,
              endDate: updatedAction.endDate,
              isDateRange: updatedAction.isDateRange,
              hour: updatedAction.hour,
              categoryId: updatedAction.categoryId
            }),
          });

          // Ververs de kalendergebeurtenissen
          await fetchCalendarEvents();
        }

        // Ververs de RPM blocks om de laatste data te krijgen
        await fetchRpmBlocks();
      } catch (error) {
        console.error('Error updating action:', error);
      }
    };

    return (
      <>
        <div 
          ref={drag}
          className={cn(
            "mb-2 p-2 rounded-md shadow-sm cursor-pointer",
            isPlanned ? "bg-green-100" : "bg-gray-100",
            isDragging ? "opacity-50" : ""
          )}
          onClick={() => setShowPopup(true)}
        >
          <div className="flex items-center justify-between">
            <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>
              {action.key}
            </Badge>
            <span className="text-xs">{action.durationAmount} {action.durationUnit}</span>
          </div>
          <p className="text-sm font-medium mt-1">{action.text}</p>
          {isPlanned && (
            <Badge variant="outline" className="mt-1">
              Gepland
            </Badge>
          )}
          {action.missedDate && (
            <div className="text-xs text-red-500 mt-1">
              Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {showPopup && (
          <CalendarPopup
            action={action}
            dateKey={action.startDate || format(new Date(), "yyyy-MM-dd")}
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            onUpdate={handleActionUpdate}
          />
        )}
      </>
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
          <div className="mb-6">
            <MiniCalendar selectedDate={currentDate} onDateSelect={handleDateSelect} />
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <h2 className="text-2xl font-bold mb-4">
              {activeCategory 
                ? `RPM Plannen - ${categories.find(c => c.id === activeCategory)?.name}` 
                : 'Alle RPM Plannen'}
            </h2>
            {Array.isArray(rpmBlocks) && rpmBlocks.map((block) => (
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
                            isPlanned={isActionPlanned(action.id, action)}
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