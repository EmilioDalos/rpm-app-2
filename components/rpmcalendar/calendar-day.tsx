import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MassiveAction, CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


interface CalendarDayProps {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  dateKey: string;
  isCurrentDay: boolean;
  onActionClick: (action: { id: string; text: string; color?: string } ) => void;
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
  onActionClick,
  onDrop,
  onActionRemove,
}) => {
  const date = new Date(year, month, day);
  const isPastDay = date < new Date(new Date().setHours(0, 0, 0, 0));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionToRemove, setActionToRemove] = useState<{ id: string; dateKey: string } | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'action',
    canDrop: () => !isPastDay,
    drop: (item: MassiveAction) => onDrop(item, dateKey),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const confirmRemoveAction = (actionId: string, dateKey: string) => {
    setActionToRemove({ id: actionId, dateKey });
    setIsDialogOpen(true);
  };

  const handleRemoveAction = () => {
    if (actionToRemove) {
      onActionRemove(actionToRemove.id, actionToRemove.dateKey);
      setActionToRemove(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <div
      ref={drop}
      className={cn(
        'h-32 border rounded-md p-1 overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow',
        isCurrentDay && 'ring-2 ring-primary',
        isOver && !isPastDay && 'bg-primary/10',
        isPastDay && 'opacity-50'
      )}
    >
      <div className={cn('font-bold mb-1 text-sm', isCurrentDay && 'text-primary')}>{day}</div>
      <ScrollArea className="h-24">
        {events.map((event) =>
          event.actions.map((action, actionId) => (
            <div
              key={`${event.date}-${action.id}-${actionId}`}
              className={`mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 flex justify-between items-center ${action.color || ''}`}
              onClick={() => onActionClick({ id: action.id, text: action.text, color: action.color })}
              >
              <p
                className="text-xs font-medium line-clamp-2"
                onClick={() => onActionClick({ id: action.id, text: action.text, color: action.color })}
              >
                {action.text}
              </p>
              <button
                className="text-black text-xs ml-2 hover:text-gray-500 font-light"
                onClick={(event) => {
                  event.stopPropagation();
                  confirmRemoveAction(action.id, dateKey);
                }}
              >
                ✖
              </button>
            </div>
          ))
        )}
      </ScrollArea>
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weet je het zeker?</DialogTitle>
            </DialogHeader>
            <p className="text-sm">Wil je deze actie echt verwijderen?</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button variant="destructive" onClick={handleRemoveAction}>
                Verwijder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarDay;