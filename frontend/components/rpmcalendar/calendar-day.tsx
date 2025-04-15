import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MassiveAction, CalendarEvent, DayOfWeek, Note } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format, startOfDay, isWithinInterval, isSameDay } from 'date-fns';

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
  onDayClick?: (date: Date) => void;
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
  viewMode = 'month',
  onDayClick
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

  const handleDayClick = (e: React.MouseEvent) => {
    // Alleen navigeren als er direct op de dag wordt geklikt (niet op een actie)
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('day-header')) {
      onDayClick?.(date);
    }
  };

  const getEventsForDay = (date: Date): MassiveAction[] => {
    console.log('Processing date:', format(date, 'yyyy-MM-dd'));
    console.log('Events:', events);

    // Convert input date to local midnight for comparison
    const localDate = startOfDay(date);
    
    return events.flatMap((event: CalendarEvent) => {
      // For each event, check if the date matches
      const eventDate = startOfDay(new Date(event.date));
      
      console.log('Event date:', {
        event: format(eventDate, 'yyyy-MM-dd'),
        current: format(localDate, 'yyyy-MM-dd')
      });

      if (isSameDay(localDate, eventDate)) {
        console.log('Found matching event:', event);
        return event.massiveActions;
      }
      return [];
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

  return (
    <div
      ref={drop}
      className={cn(
        "h-32 border rounded-md p-1 overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        isCurrentDay && "ring-2 ring-primary",
        isOver && !isPastDay && "bg-primary/10",
        isPastDay && "opacity-50",
        !isCurrentMonth && "opacity-40"
      )}
      onClick={handleDayClick}
    >
      <div className={cn(
        "font-bold mb-1 text-sm day-header",
        isCurrentDay && "text-primary"
      )}>
        {day}
      </div>
      <ScrollArea className="h-24">
        <TooltipProvider>
          {dayEvents.map((action: MassiveAction) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <div
                  className="mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 relative group"
                  style={{
                    backgroundColor: action.color || '#e0e0e0',
                    color: action.textColor || '#000000'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Voorkom navigatie naar dagweergave
                    onActionClick(action);
                  }}
                >
                  <p className="text-xs font-medium line-clamp-2 pr-6">{action.text}</p>
                  <span className="text-xs opacity-75 absolute bottom-0 right-1">
                    {`${action.hour !== undefined ? (action.hour < 10 ? `0${action.hour}` : action.hour) : '??'}:00`}
                  </span>
                  <button
                    className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation(); // Voorkom navigatie naar dagweergave
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
                  {action.notes?.map((note: Note, index: number) => (
                    <p key={note.id} className="text-sm mt-1">
                      {index + 1}. {note.text}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Actie verwijderen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Weet je zeker dat je deze actie wilt verwijderen uit de kalender?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleRemoveAction}>
              Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarDay;