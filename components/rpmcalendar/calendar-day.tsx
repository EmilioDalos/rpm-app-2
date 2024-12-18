import React from 'react'
import { useDrop } from 'react-dnd'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MassiveAction } from './rpm-calendar'
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  day: number
  month: number
  year: number
  actions: MassiveAction[]
  dateKey: string
  isCurrentDay: boolean
  onActionClick: (action: MassiveAction) => void
  onDrop: (item: MassiveAction, dateKey: string) => void
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  month,
  year,
  actions, 
  dateKey, 
  isCurrentDay, 
  onActionClick,
  onDrop
}) => {
  const isPastDay = new Date(year, month, day) < new Date(new Date().setHours(0, 0, 0, 0));

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
        {actions.map((action) => (
          <div
            key={action.id}
            className={`mb-1 p-1 border border-primary/20 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 ${action.color}`}
            onClick={() => onActionClick(action)}
          >
            <div className="flex items-center justify-between">
              <Badge variant={action.key === '✔' ? 'default' : 'secondary'} className="text-xs">
                {action.key}
              </Badge>
              <span className="text-xs font-medium">{action.durationAmount} {action.durationUnit}</span>
            </div>
            <p className="text-xs font-medium mt-1 line-clamp-2">{action.text}</p>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

