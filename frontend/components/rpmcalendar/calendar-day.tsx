import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MassiveAction, CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarDayProps {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  dateKey: string;
  isCurrentDay: boolean;
  isCurrentMonth?: boolean;
  onActionClick: (action: MassiveAction) => void;
  onDrop: (item: MassiveAction, dateKey: string) => void;
  onActionRemove: (actionId: string, dateKey: string) => void;
  viewMode?: 'day' | 'week' | 'month';
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  month,
  year,
  events,
  dateKey,
  isCurrentDay,
  isCurrentMonth = true,
  onActionClick,
  onDrop,
  onActionRemove,
  viewMode = 'month'
}) => {
  const date = new Date(year, month, day);
  const isPastDay = date < new Date(new Date().setHours(0, 0, 0, 0));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionToRemove, setActionToRemove] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'action',
    canDrop: () => !isPastDay,
    drop: (item: MassiveAction) => {
      const itemWithDefaults = {
        ...item,
        hour: item.hour !== undefined ? item.hour : 8
      };
      onDrop(itemWithDefaults, dateKey);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    console.log(`Getting events for day ${dateStr}:`, events);

    return events.filter(event => {
      if (!event.date) return false;
      
      return event.massiveActions.some(action => {
        if (action.isDateRange && action.startDate && action.endDate) {
          const start = new Date(action.startDate);
          const end = new Date(action.endDate);
          const current = new Date(date);
          
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          current.setHours(0, 0, 0, 0);
          
          return current >= start && current <= end;
        }
        
        if (!action.startDate) return false;
        
        const eventDate = new Date(action.startDate);
        const currentDate = new Date(date);
        
        eventDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        return eventDate.getTime() === currentDate.getTime();
      });
    });
  };

  const dayEvents = getEventsForDay(date);

  const confirmRemoveAction = (actionId: string) => {
    setActionToRemove(actionId);
    setIsDialogOpen(true);
  };

  const handleRemoveAction = () => {
    if (actionToRemove) {
      onActionRemove(actionToRemove, dateKey);
      setActionToRemove(null);
      setIsDialogOpen(false);
    }
  };

  const renderCompactView = () => {
    return (
      <div
        ref={drop}
        className={cn(
          "h-32 border rounded-md p-1 overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow",
          isCurrentDay && "ring-2 ring-primary",
          isOver && !isPastDay && "bg-primary/10",
          isPastDay && "opacity-50",
          !isCurrentMonth && "opacity-40"
        )}
      >
        <div className={cn(
          "font-bold mb-1 text-sm",
          isCurrentDay && "text-primary"
        )}>
          {day}
        </div>
        <ScrollArea className="h-24">
          <TooltipProvider>
            {dayEvents.map((event) => (
              event.massiveActions.map((action) => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 relative group"
                      style={{
                        backgroundColor: action.color || '#e0e0e0',
                        color: action.textColor || '#000000'
                      }}
                      onClick={() => onActionClick(action)}
                    >
                      <p className="text-xs font-medium line-clamp-2 pr-6">{action.text}</p>
                      <span className="text-xs opacity-75 absolute bottom-0 right-1">
                        {`${action.hour !== undefined ? (action.hour < 10 ? `0${action.hour}` : action.hour) : '??'}:00`}
                      </span>
                      <button
                        className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmRemoveAction(action.id);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-bold">{action.text}</p>
                      <p className="text-sm">
                        {action.durationAmount} {action.durationUnit} - {action.leverage}
                      </p>
                      <p className="text-sm mt-1">
                        Tijd: {action.hour !== undefined ? `${action.hour < 10 ? `0${action.hour}` : action.hour}:00` : 'Niet gespecificeerd'}
                      </p>
                      {action.notes && action.notes.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Notities:</p>
                          {action.notes.map((note, index) => (
                            <p key={note.id} className="text-sm mt-1">
                              {index + 1}. {note.text}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            ))}
          </TooltipProvider>
        </ScrollArea>
      </div>
    );
  };

  return renderCompactView();
};

export default CalendarDay;