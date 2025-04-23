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
import CalendarPopup from './calendar-popup';

import { Category, RpmBlock, MassiveAction, CalendarEvent, CalendarEventDay, Note } from '@/types';

import MiniCalendar from './mini-calendar';

interface Purpose {
  purpose: string;
}

interface RpmCalendarProps {
  isDropDisabled: boolean;
}

type ViewMode = "day" | "week" | "month";

interface DbCalendarEvent {
  id: string;
  text: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isDateRange?: boolean;
  hour?: number;
  missedDate?: Date;
  description?: string;
  location?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RpmCalendar: FC<RpmCalendarProps> = ({ isDropDisabled }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rpmBlocks, setRpmBlocks] = useState<RpmBlock[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDay[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedAction, setSelectedAction] = useState<CalendarEvent | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchRpmBlocks();
  }, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, viewMode]);

  const fetchCategories = async () => {
    try { 
      // Check if API URL is defined
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('API URL is not defined. Please check your environment variables.');
        // Set some default categories as fallback
       
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set some default categories as fallback
      setCategories([
        { 
          id: '1', 
          name: 'NEEDS to be defined Professional', 
          type: 'professional', 
          description: 'Work related tasks',
          vision: '',
          purpose: '',
          roles: [],
          threeToThrive: [],
          resources: '',
          results: [],
          actionPlans: [],
          imageBlob: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          id: '2', 
          name: 'NEEDS to be defined Personal', 
          type: 'personal', 
          description: 'Personal tasks',
          vision: '',
          purpose: '',
          roles: [],
          threeToThrive: [],
          resources: '',
          results: [],
          actionPlans: [],
          imageBlob: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  };

  const fetchRpmBlocks = async () => {
    try {
      console.log('Fetching RPM blocks from API...');
      
      // Check if API URL is defined
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('API URL is not defined. Please check your environment variables.');
        // Set some default RPM blocks as fallback
       
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rpmblocks`);
      console.log('RPM blocks API response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRpmBlocks(data);
    } catch (error) {
      console.error('Error fetching RPM blocks:', error);
      // Set some default RPM blocks as fallback
      setRpmBlocks([
        {
          id: '1',
          result: 'Complete project documentation',
          purposes: ['Improve project clarity', 'Enable better onboarding'],
          massiveActions: [],
          categoryId: '1',
          type: 'professional',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          result: 'Weekly exercise routine',
          purposes: ['Improve health', 'Increase energy levels'],
          massiveActions: [],
          categoryId: '3',
          type: 'personal',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
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

      // Check if API URL is defined
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('API URL is not defined. Please check your environment variables.');
        setCalendarEvents([]);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received calendar events from API:`, data);
      
      // Convert API days into CalendarEventDay format
      const convertedEventsByDay: CalendarEventDay[] = data.map((day: any) => ({
        date: day.date,
        events: day.events.map((evt: any) => ({
          date: evt.date,
          id: evt.id,
          text: evt.text,
          durationAmount: evt.durationAmount ?? 0,
          durationUnit: evt.durationUnit ?? 'minutes',
          priority: evt.priority ?? 0,
          color: evt.color ?? '',
          textColor: evt.textColor ?? '',
          startDate: day.date,
          endDate: day.date,
          status: evt.status ?? 'planned',
          leverage: evt.leverage,
          location: evt.location,
          notes: evt.notes ?? [],
          key: evt.key,
          hour: evt.hour != null ? parseInt(evt.hour, 10) : undefined,
          isDateRange: evt.isDateRange,
          selectedDays: evt.selectedDays,
          missedDate: evt.missedDate,
          categoryId: evt.categoryId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      }));
      
      console.log(`Converted ${convertedEventsByDay.length} days with events:`, convertedEventsByDay);
      setCalendarEvents(convertedEventsByDay);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setCalendarEvents([]);
    }
  };

  // Utility function to convert MassiveAction to CalendarEvent
  const massiveActionToCalendarEvent = (action: MassiveAction, date: string): CalendarEvent => {
    return {
      ...action,
      date: date,
    } as CalendarEvent;
  };

  // Utility function to convert CalendarEvent to MassiveAction (if needed)
  const calendarEventToMassiveAction = (event: CalendarEvent): MassiveAction => {
    // Create a new object without the 'date' property
    const { date, ...massiveActionProps } = event;
    return massiveActionProps as MassiveAction;
  };

  const handleActionClick = async (action: CalendarEvent, dateKey: string) => {
    try {
      // Fetch the complete action data including notes
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${action.id}`);
      console.log('Response:', response);
      console.log('Action:', action);
      console.log('Date key:', dateKey);
      console.log('Action url:', `${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${action.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch action details');
      }
      
      const actionWithNotes = await response.json();
      
      // Update the action with the fetched notes
      const updatedAction = {
        ...action,
        notes: actionWithNotes.notes || []
      };
      
      setSelectedAction(updatedAction);
      setSelectedDateKey(dateKey);
      setIsPopupOpen(true);
    } catch (error) {
      console.error('Error fetching action details:', error);
      // Fallback to the original action if fetch fails
      setSelectedAction(action);
      setSelectedDateKey(dateKey);
      setIsPopupOpen(true);
    }
  };

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

      // Update the action via the massive-actions API
      if (updatedAction.startDate) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/massive-actions/${updatedAction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: updatedAction.text || 'Nieuwe actie',
            description: updatedAction.leverage || '',
            startDate: updatedAction.startDate,
            endDate: updatedAction.endDate,
            isDateRange: updatedAction.isDateRange,
            hour: updatedAction.hour,
            categoryId: updatedAction.categoryId,
            notes: updatedAction.notes || [],
            status: updatedAction.status,
            location: updatedAction.location,
            leverage: updatedAction.leverage,
            durationAmount: updatedAction.durationAmount,
            durationUnit: updatedAction.durationUnit,
            color: updatedAction.color,
            textColor: updatedAction.textColor,
            priority: updatedAction.priority
          }),
        });

        // Refresh the calendar events
        await fetchCalendarEvents();
      }

      // Refresh the RPM blocks to get the latest data
      await fetchRpmBlocks();
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const handleDrop = async (item: MassiveAction, dateKey: string) => {
    try {
      // Set the action status to 'planned' when dropped into the calendar
      const updatedItem = {
        ...item,
        status: 'planned' as const,
        startDate: dateKey,
        endDate: dateKey
      };

      // Convert to CalendarEvent for type safety (with date field)
      const calendarEvent = massiveActionToCalendarEvent(updatedItem, dateKey);
      
      let updatedActionWithNotes;

      // Update via the massive-actions API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/massive-actions/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: updatedItem.text || 'Nieuwe actie',
          description: updatedItem.leverage || '',
          startDate: updatedItem.startDate,
          endDate: updatedItem.endDate,
          isDateRange: updatedItem.isDateRange,
          hour: updatedItem.hour,
          categoryId: updatedItem.categoryId,
          notes: updatedItem.notes || [],
          status: updatedItem.status,
          location: updatedItem.location,
          leverage: updatedItem.leverage,
          durationAmount: updatedItem.durationAmount,
          durationUnit: updatedItem.durationUnit,
          color: updatedItem.color,
          textColor: updatedItem.textColor,
          priority: updatedItem.priority
        }),
      });

      if (!response.ok) {
        // Fall back to the calendar-events API if the massive-actions API fails
        console.log('Falling back to calendar-events API');
        const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: updatedItem.text || 'Nieuwe actie',
            description: updatedItem.leverage || '',
            startDate: updatedItem.startDate,
            endDate: updatedItem.endDate,
            isDateRange: updatedItem.isDateRange,
            hour: updatedItem.hour,
            categoryId: updatedItem.categoryId,
            notes: updatedItem.notes || [],
            status: updatedItem.status
          }),
        });
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to update action via both APIs');
        }
        
        updatedActionWithNotes = await fallbackResponse.json();
        console.log('Action updated via fallback API:', updatedActionWithNotes);
      } else {
        updatedActionWithNotes = await response.json();
        console.log('Action updated via massive-actions API:', updatedActionWithNotes);
      }

      // Update local calendar events state
      setCalendarEvents((prevEvents) => {
        const newEvents = [...prevEvents];
        const eventIndex = newEvents.findIndex(event => event.date === dateKey);
        
        if (eventIndex >= 0) {
          // Update existing event
          newEvents[eventIndex] = {
            ...newEvents[eventIndex],
            events: newEvents[eventIndex].events.map(action =>
              action.id === updatedItem.id ? updatedActionWithNotes : action
            )
          };
        } else {
          // Create new event
          newEvents.push({
            date: dateKey,
            events: [updatedActionWithNotes]
          });
        }
        
        return newEvents;
      });

      // Update RPM blocks if the action exists there
      setRpmBlocks((prevBlocks) =>
        prevBlocks.map((block) => {
          if (block.massiveActions?.some(action => action.id === updatedItem.id)) {
            return {
              ...block,
              massiveActions: block.massiveActions.map(action =>
                action.id === updatedItem.id ? updatedActionWithNotes : action
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

  const handleActionRemove = async (actionId: string, dateKey: string) => {
    try {
      console.log(`Removing action: actionId=${actionId}, dateKey=${dateKey}`);
      
      // Find the action to check if it has a recurrence pattern
      const actionToRemove = calendarEvents
        .flatMap(event => event.events)
        .find(action => action.id === actionId);

      if (!actionToRemove) {
        console.error('Action not found:', actionId);
        return;
      }

      // Use the DELETE endpoint to remove the event from the calendar
      // Make sure both actionId and dateKey are properly passed
      const deleteUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${actionId}/${dateKey}`;
      console.log(`Sending DELETE request to: ${deleteUrl}`);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(`Failed to remove action: ${response.status}`);
      }
      
      console.log(`Action successfully removed from the server`);
      
      // Update the local state to remove the action from the calendar view
      setCalendarEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.date === dateKey) {
            return {
              ...event,
              events: event.events.filter((action) => action.id !== actionId)
            };
          }
          return event;
        })
      );
      
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

      // Filter events for this day
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

      // Filter events for this day
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
    const eventsForDay = calendarEvents.filter((eventDay) => {
      if (!eventDay.date) return false;

      return eventDay.events.some(action => {
        if (action.isDateRange && action.startDate && action.endDate) {
          const start = new Date(action.startDate);
          const end = new Date(action.endDate);
          const current = new Date(dateKey);
          
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          current.setHours(0, 0, 0, 0);
          
          return current >= start && current <= end;
        }
        
        return eventDay.date === dateKey;
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
            {eventsForDay.map((eventDay) => 
              eventDay.events
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
    let isInCalendar = false;  
    
    if (hasStartEndDate) {
      isInCalendar = true;  
    }
    if (!hasStartEndDate) {
      isInCalendar = true;  
    }
    // Check if the action has a recurrence pattern
         
    // An action is considered planned if it's in the calendar or has a recurrence pattern
    return isInCalendar;
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'planned':
        return 'default';
      case 'new':
        return 'secondary';
      case 'in_progress':
        return 'destructive';
      case 'leveraged':
        return 'destructive';
      case 'moved':
        return 'destructive';
      case 'not_needed':
        return 'destructive';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Gepland';
      case 'new':
        return 'Nieuw';
      case 'in_progress':
        return 'In uitvoering';
      case 'leveraged':
        return 'Geleverd';
      case 'moved':
        return 'Verplaatst';
      case 'not_needed':
        return 'Niet meer nodig';
      case 'cancelled':
        return 'Geannuleerd';
      case 'completed':
        return 'Voltooid';
      default:
        return status;
    }
  };

  const EventItem = ({ action, isPlanned, onClick }: { action: MassiveAction; isPlanned: boolean; onClick: () => void }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'action',
      item: action,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const [showPopup, setShowPopup] = useState(false);
    const [popupAction, setPopupAction] = useState<MassiveAction>(action);

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

        // Update the action via the massive-actions API
        if (updatedAction.startDate) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/massive-actions/${updatedAction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: updatedAction.text || 'Nieuwe actie',
              description: updatedAction.leverage || '',
              startDate: updatedAction.startDate,
              endDate: updatedAction.endDate,
              isDateRange: updatedAction.isDateRange,
              hour: updatedAction.hour,
              categoryId: updatedAction.categoryId,
              notes: updatedAction.notes || [],
              status: updatedAction.status,
              location: updatedAction.location,
              leverage: updatedAction.leverage,
              durationAmount: updatedAction.durationAmount,
              durationUnit: updatedAction.durationUnit,
              color: updatedAction.color,
              textColor: updatedAction.textColor,
              priority: updatedAction.priority
            }),
          });

          // Refresh the calendar events
          await fetchCalendarEvents();
        }

        // Refresh the RPM blocks to get the latest data
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
            {
              'bg-green-100': action.status === 'planned',
              'bg-blue-100': action.status === 'new',
              'bg-yellow-100': action.status === 'in_progress',
              'bg-purple-100': action.status === 'leveraged',
              'bg-gray-100': action.status === 'moved' || action.status === 'not_needed',
              'bg-red-100': action.status === 'cancelled',
              'bg-emerald-100': action.status === 'completed',
            },
            isDragging ? "opacity-50" : ""
          )}
          onClick={async () => {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/massive-actions/${action.id}`);
              if (!response.ok) throw new Error('Failed to fetch action details');
              const data = await response.json();
              setPopupAction({ ...action, notes: data.notes || [] });
            } catch (error) {
              console.error('Error fetching action details:', error);
              setPopupAction(action);
            }
            setShowPopup(true);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant={getBadgeVariant(action.status)}
              className="capitalize"
            >
              {getStatusLabel(action.status)}
            </Badge>
            <span className="text-xs">{action.durationAmount} {action.durationUnit}</span>
          </div>
          <p className="text-sm font-medium mb-1">{action.text}</p>
          
          {action.startDate && (
            <div className="text-xs text-gray-600 mt-1">
              {new Date(action.startDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
          
          {action.missedDate && (
            <div className="text-xs text-red-500 mt-1">
              Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
        </div>

        {showPopup && (
          <CalendarPopup
            action={massiveActionToCalendarEvent(popupAction, popupAction.startDate || format(new Date(), "yyyy-MM-dd"))}
            dateKey={action.startDate || format(new Date(), "yyyy-MM-dd")}
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            onUpdate={(updatedCalendarEvent, dateKey) => {
              // Convert CalendarEvent back to MassiveAction
              const massiveAction = calendarEventToMassiveAction(updatedCalendarEvent);
              handleActionUpdate(massiveAction, dateKey);
            }}
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
                          <EventItem
                            key={`${block.id}-${action.id}`}
                            action={action}
                            isPlanned={isActionPlanned(action.id, action)}
                            onClick={() => {
                              // Convert MassiveAction to CalendarEvent before setting
                              const calendarEvent = massiveActionToCalendarEvent(
                                action, 
                                action.startDate || format(new Date(), "yyyy-MM-dd")
                              );
                              setSelectedAction(calendarEvent);
                              setSelectedDateKey(action.startDate || format(new Date(), "yyyy-MM-dd"));
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
        {selectedAction && isPopupOpen && selectedDateKey && (
          <CalendarPopup
            action={selectedAction}
            dateKey={selectedDateKey}
            isOpen={isPopupOpen}
            onClose={() => {
              setIsPopupOpen(false);
              setSelectedAction(null);
              setSelectedDateKey(null);
            }}
            onUpdate={(updatedAction: CalendarEvent, dateKey: string) => {
              handleActionUpdate(calendarEventToMassiveAction(updatedAction), dateKey);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default RpmCalendar;