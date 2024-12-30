import React from 'react'
import { useDrop } from 'react-dnd'
import { ScrollArea } from "@/components/ui/scroll-area"
import { MassiveAction, CalendarEvent } from '@/types'
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarDayProps {
  day: number
  month: number
  year: number
  events: CalendarEvent[]
  dateKey: string
  isCurrentDay: boolean
  onActionClick: (action: MassiveAction) => void
  onDrop: (item: MassiveAction, dateKey: string) => void
  onActionRemove: (actionId: string, dateKey: string) => void
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
  onActionRemove
}) => {
  const date = new Date(year, month, day);
  const isPastDay = date < new Date(new Date().setHours(0, 0, 0, 0));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'action',
    canDrop: () => !isPastDay,
    drop: (item: MassiveAction) => onDrop(item, dateKey),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const isDateInRange = (action: MassiveAction, currentDate: string) => {
    if (!action.isDateRange || !action.startDate || !action.endDate) return false;
    return currentDate >= action.startDate && currentDate <= action.endDate;
  }

  return (
    <div
      ref={drop}
      className={cn(
        "h-32 border rounded-md p-1 overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow",
        isCurrentDay && "ring-2 ring-primary",
        isOver && !isPastDay && "bg-primary/10",
        isPastDay && "opacity-50"
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
          {events.map((event) => (
            event.actions.map((action) => (
              (action.isDateRange && isDateInRange(action, dateKey)) || (!action.isDateRange && event.date === dateKey) ? (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 ${action.color || ''}`}
                      onClick={() => onActionClick(action)}
                    >
                      <p className="text-xs font-medium line-clamp-2">{action.text}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="font-bold">{action.text}</p>
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
              ) : null
            ))
          ))}
        </TooltipProvider>
      </ScrollArea>
    </div>
  )
}

export default CalendarDay

