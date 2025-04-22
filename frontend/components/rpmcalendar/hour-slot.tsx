"use client"

import React from "react"
import { useDrop } from "react-dnd"
import type { MassiveAction, CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface HourSlotProps {
  dateKey: string
  hour: number
  events: CalendarEvent[]
  isToday: boolean
  onActionClick: (action: MassiveAction) => void
  onDrop: (item: MassiveAction) => void
  onActionRemove: (actionId: string) => void
}

const HourSlot: React.FC<HourSlotProps> = ({
  dateKey,
  hour,
  events,
  isToday,
  onActionClick,
  onDrop,
  onActionRemove,
}) => {
  const now = new Date()
  const isCurrentHour = isToday && now.getHours() === hour
  const isPastHour = isToday ? now.getHours() > hour : new Date(dateKey) < new Date(new Date().setHours(0, 0, 0, 0))

  // Filter actions that should be displayed in this hour slot
  const actionsForThisHour = events.flatMap(event => 
    event.massiveActions.filter(action => {
      const startHour = action.hour !== undefined ? action.hour : 8;
      
      // If the action has no duration in hours or if the current hour matches the start hour
      if (action.durationUnit !== 'hr' || startHour === hour) {
        return (startHour === hour) || (action.hour === undefined && hour === 8);
      }
      
      // Check if the current hour is within the range of the action
      return hour >= startHour && hour < startHour + (action.durationAmount || 1);
    })
  )

  // Calculate if an action is the first hour of its range
  const isFirstHourOfAction = (action: MassiveAction) => {
    const startHour = action.hour !== undefined ? action.hour : 8;
    return hour === startHour;
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "action",
    canDrop: () => !isPastHour,
    drop: (item: MassiveAction) => {
      const itemWithHour = { 
        ...item, 
        hour: hour,
        leverage: item.leverage || '',
        durationAmount: item.durationAmount || 0,
        durationUnit: item.durationUnit || 'min',
        priority: item.priority || 1,
        key: item.key || '✘',
        notes: item.notes || [],
        isDateRange: item.isDateRange || false,
        selectedDays: item.selectedDays || [],
      };
      onDrop(itemWithHour);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (!event.date) return false;
      
      // Check if any of the massive actions in this event fall within the date range and match the hour
      return event.massiveActions.some(action => {
        // If the action has a date range
        if (action.isDateRange && action.startDate && action.endDate) {
          const start = new Date(action.startDate);
          const end = new Date(action.endDate);
          const current = new Date(event.date);
          
          // Set time to midnight for date comparison
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          current.setHours(0, 0, 0, 0);
          
          const isInRange = current >= start && current <= end;
          const matchesHour = action.hour === hour;
          
          console.log(`Checking hour slot for ${action.text}:`, {
            start: start.toISOString(),
            end: end.toISOString(),
            current: current.toISOString(),
            hour,
            actionHour: action.hour,
            isInRange,
            matchesHour
          });
          
          return isInRange && matchesHour;
        }
        
        // For single-day events, check if the date matches and the hour matches
        if (!action.startDate) return false;
        
        const eventDate = new Date(action.startDate);
        const isSameDay = eventDate.toISOString().split('T')[0] === event.date;
        const matchesHour = action.hour === hour;
        
        return isSameDay && matchesHour;
      });
    });
  };

  const hourEvents = getEventsForHour(hour);

  return (
    <div className={cn(
      "relative min-h-[60px] border-b border-gray-200",
      isOver ? "bg-blue-50" : "",
      isToday ? "bg-gray-50" : ""
    )}>
      <div className="absolute left-0 top-0 w-12 h-full flex items-center justify-center text-sm text-gray-500">
        {format(new Date().setHours(hour), 'HH:mm')}
      </div>
      
      <div className="ml-12 p-1">
        {hourEvents.map((event, index) => (
          <div
            key={`${event.date}-${index}`}
            className="text-xs p-1 bg-blue-100 rounded mb-1 truncate"
            title={event.massiveActions.map(action => action.text).join(', ')}
          >
            <div className="flex items-center gap-1">
              <span>{event.massiveActions.map(action => action.text).join(', ')}</span>
              {event.massiveActions.map(action => action.actionStatus && (
                <Badge 
                  key={action.id}
                  variant={action.actionStatus === 'completed' ? 'default' : 'secondary'}
                  className="text-[10px] px-1 py-0"
                >
                  {action.actionStatus === 'completed' ? '✓' : 
                   action.actionStatus === 'in_progress' ? '⟳' : 
                   action.actionStatus === 'cancelled' ? '✕' : '•'}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourSlot; 