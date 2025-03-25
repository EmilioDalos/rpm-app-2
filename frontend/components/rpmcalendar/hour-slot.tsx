"use client"

import type React from "react"
import { useDrop } from "react-dnd"
import type { MassiveAction, CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X } from "lucide-react"

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

  // Filter acties die in dit uurslot moeten worden weergegeven
  // Een actie wordt weergegeven in een uurslot als:
  // 1. Het uur overeenkomt met het beginuur van de actie, of
  // 2. Voor acties met duur in uren (durationUnit: "hr"), als het huidige uur binnen het bereik van de actie valt
  // 3. Voor acties zonder uurspecificatie, standaard op 8:00 als het uur 8 is
  const actionsForThisHour = events.flatMap(event => 
    event.massiveActions.filter(action => {
      const startHour = action.hour !== undefined ? action.hour : 8;
      
      // Als de actie geen duur in uren heeft of als het huidige uur overeenkomt met het beginuur
      if (action.durationUnit !== 'hr' || startHour === hour) {
        return (startHour === hour) || (action.hour === undefined && hour === 8);
      }
      
      // Controleer of het huidige uur binnen het bereik van de actie valt
      // (startHour <= hour < startHour + durationAmount)
      return hour >= startHour && hour < startHour + (action.durationAmount || 1);
    })
  )

  // Bereken of een actie het eerste uur van zijn bereik is (voor weergave-doeleinden)
  const isFirstHourOfAction = (action: MassiveAction) => {
    const startHour = action.hour !== undefined ? action.hour : 8;
    return hour === startHour;
  }

  // Bereken de resterende duur van een actie vanaf het huidige uur (voor hoogte-berekening)
  const getRemainingDuration = (action: MassiveAction) => {
    if (action.durationUnit !== 'hr') return 1;
    
    const startHour = action.hour !== undefined ? action.hour : 8;
    const durationHours = action.durationAmount || 1;
    
    // Als dit het eerste uur is, toon de hele duur
    if (hour === startHour) return durationHours;
    
    // Anders, toon alleen de resterende uren
    const remainingHours = (startHour + durationHours) - hour;
    return Math.max(1, remainingHours);
  }

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "action",
    canDrop: () => !isPastHour,
    drop: (item: MassiveAction) => {
      // Verzeker dat het uur expliciet is ingesteld op het huidige uur
      const itemWithHour = { 
        ...item, 
        hour: hour,
        // Voeg andere ontbrekende velden toe met standaardwaarden om te voorkomen
        // dat deze worden overschreven door de handleDrop functie
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

  return (
    <div
      ref={drop}
      className={cn(
        "border p-1 min-h-[60px] relative",
        isCurrentHour && "bg-primary/20",
        isToday && "bg-primary/5",
        isOver && !isPastHour && "bg-primary/10",
        isPastHour && "opacity-50",
      )}
    >
      <TooltipProvider>
        {actionsForThisHour.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <div
                className={`mb-1 p-1 rounded-md shadow-sm cursor-pointer hover:bg-primary/20 relative group`}
                style={{
                  backgroundColor: action.color || "#e0e0e0",
                  color: action.textColor || "#000000",
                  // Toon de volledige informatie alleen in het eerste uur
                  height: isFirstHourOfAction(action) && action.durationUnit === 'hr' && action.durationAmount > 1 
                    ? `${Math.min(50, action.durationAmount * 10)}px` 
                    : 'auto',
                  // Maak vervolguren kleiner/compacter
                  opacity: isFirstHourOfAction(action) ? 1 : 0.8,
                  borderLeft: isFirstHourOfAction(action) ? 'none' : '3px solid ' + (action.color || "#e0e0e0"),
                }}
                onClick={() => onActionClick(action)}
              >
                {/* Toon alleen volledige tekst in eerste uur */}
                {isFirstHourOfAction(action) ? (
                  <>
                    <p className="text-xs font-medium line-clamp-2 pr-6">{action.text}</p>
                    <span className="text-xs opacity-75 absolute bottom-0 right-1">
                      {`${action.hour !== undefined ? (action.hour < 10 ? `0${action.hour}` : action.hour) : '??'}:00`}
                      {action.durationUnit === 'hr' && action.durationAmount > 1 && 
                        ` - ${(action.hour || 0) + action.durationAmount < 10 ? 
                          `0${(action.hour || 0) + action.durationAmount}` : 
                          (action.hour || 0) + action.durationAmount}:00`
                      }
                    </span>
                    <button
                      className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onActionRemove(action.id)
                      }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium truncate">{action.text} (vervolg)</p>
                  </>
                )}
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
                  {action.durationUnit === 'hr' && action.durationAmount > 1 && 
                    ` - ${(action.hour || 0) + action.durationAmount < 10 ? 
                      `0${(action.hour || 0) + action.durationAmount}` : 
                      (action.hour || 0) + action.durationAmount}:00`
                  }
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
        ))}
      </TooltipProvider>
    </div>
  )
}

export default HourSlot 