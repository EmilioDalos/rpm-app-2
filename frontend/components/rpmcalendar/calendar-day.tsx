import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MassiveAction, CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
}) => {
  const date = new Date(year, month, day);
  const isPastDay = date < new Date(new Date().setHours(0, 0, 0, 0));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionToRemove, setActionToRemove] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'action',
    canDrop: () => !isPastDay,
    drop: (item: MassiveAction) => {
      // Als de actie wordt gesleept naar een dag in week/maand view,
      // en er is nog geen uur ingesteld, stel het standaard in op 8:00
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

  const isDateInRange = (action: MassiveAction, currentDate: string) => {
    if (!action.isDateRange || !action.startDate || !action.endDate) return false;
    
    const start = new Date(action.startDate);
    const end = new Date(action.endDate);
    const current = new Date(currentDate);
    
    // Set time to midnight for date comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    current.setHours(0, 0, 0, 0);
    
    const isInRange = current >= start && current <= end;
    console.log(`Date range check for ${action.text}: ${currentDate} is ${isInRange ? 'in' : 'not in'} range ${action.startDate} to ${action.endDate}`);

    return isInRange;
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`Getting events for day ${dateStr}:`, events);

    return events.filter(event => {
      if (!event.date) return false;
      
      // Check if any of the massive actions in this event fall within the date range
      return event.massiveActions.some(action => {
        // If the action has a date range
        if (action.isDateRange && action.startDate && action.endDate) {
          const start = new Date(action.startDate);
          const end = new Date(action.endDate);
          const current = new Date(date);
          
          // Set time to midnight for date comparison
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          current.setHours(0, 0, 0, 0);
          
          const isInRange = current >= start && current <= end;
          console.log(`Checking date range for ${action.text}:`, {
            start: start.toISOString(),
            end: end.toISOString(),
            current: current.toISOString(),
            isInRange
          });
          
          return isInRange;
        }
        
        // For single-day events, check if the date matches
        if (!action.startDate) return false;
        
        const eventDate = new Date(action.startDate);
        eventDate.setHours(0, 0, 0, 0);
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        
        const isSameDay = eventDate.getTime() === currentDate.getTime();
        console.log(`Checking single day event ${action.text}:`, {
          eventDate: eventDate.toISOString(),
          currentDate: currentDate.toISOString(),
          isSameDay
        });
        
        return isSameDay;
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

  return (
    <div
      ref={drop}
      className={cn(
        "h-32 border rounded-md p-1 overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow",
        isCurrentDay && "ring-2 ring-primary",
        isOver && !isPastDay && "bg-primary/10",
        isPastDay && "opacity-50",
        !isCurrentMonth && "opacity-40" // Als de dag niet in de huidige maand valt, toon hem lichter
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
                    className={`mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 relative group`}
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

      {/* Bevestigingsdialoog voor het verwijderen van een actie */}
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