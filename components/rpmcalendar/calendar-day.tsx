import React from 'react'
import { useDrop } from 'react-dnd'
import { ScrollArea } from "@/components/ui/scroll-area"
import { MassiveAction, CalendarEvent } from '@/types'
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  day: number
  month: number
  year: number
  events: CalendarEvent[]
  dateKey: string
  isCurrentDay: boolean
  onActionClick: (action: { id: string; text: string; color?: string }) => void
  onDrop: (item: MassiveAction, dateKey: string) => void
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  month,
  year,
  events, 
  dateKey, 
  isCurrentDay, 
  onActionClick,
  onDrop
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
        {events.map((event) => (
          event.actions.map((action) => (
            <div
              key={action.id}
              className={`mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 ${action.color || ''}`}
              onClick={() => onActionClick({ id: action.id, text: action.text, color: action.color })}
            >
              <p className="text-xs font-medium line-clamp-2">{action.text}</p>
            </div>
          ))
        ))}
      </ScrollArea>
    </div>
  )
}

export default CalendarDay

