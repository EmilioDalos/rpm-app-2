"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns"
import { nl as nlLocale } from "date-fns/locale"

interface MiniCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-medium">{format(currentMonth, "MMMM yyyy", { locale: nlLocale })}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const dateFormat = "EEEEE"

    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 })

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-medium">
          {format(addDays(startDate, i), dateFormat, { locale: nlLocale })}
        </div>,
      )
    }

    return <div className="grid grid-cols-7 gap-1 mb-1">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day)
        days.push(
          <div
            key={day.toString()}
            className={`text-center p-1 text-xs cursor-pointer hover:bg-primary/10 rounded-sm ${
              !isSameMonth(day, monthStart) ? "text-muted-foreground" : ""
            } ${isSameDay(day, selectedDate) ? "bg-primary text-primary-foreground hover:bg-primary" : ""}`}
            onClick={() => onDateSelect(cloneDay)}
          >
            {format(day, "d")}
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      )
      days = []
    }

    return <div className="mb-2">{rows}</div>
  }

  return (
    <div className="p-2 border rounded-md">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}

export default MiniCalendar 