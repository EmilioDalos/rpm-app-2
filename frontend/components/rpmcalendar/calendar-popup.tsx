'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MassiveAction, Note, DayOfWeek } from '@/types'
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Pencil, X } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from 'next/dynamic'
import { Editor } from '@tiptap/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckedState } from '@radix-ui/react-checkbox'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const Tiptap = dynamic(() => import('./tiptap-editor'), { ssr: false });

interface CalendarPopupProps {
  action: MassiveAction
  dateKey: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction, dateKey: string) => void
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const CalendarPopup: React.FC<CalendarPopupProps> = ({ action, dateKey, isOpen, onClose, onUpdate }) => {
  const [notes, setNotes] = useState<Note[]>(action.notes || [])
  const [newNote, setNewNote] = useState('')
  const [isCompleted, setIsCompleted] = useState(action.key === '✔')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [isDateRange, setIsDateRange] = useState(action.isDateRange || false)
  const [startDate, setStartDate] = useState(
    action.startDate 
      ? format(new Date(action.startDate), 'MM-dd-yyyy') 
      : format(new Date(dateKey), 'MM-dd-yyyy')
  )
  const [endDate, setEndDate] = useState(
    action.endDate 
      ? format(new Date(action.endDate), 'MM-dd-yyyy') 
      : format(new Date(dateKey), 'MM-dd-yyyy')
  )
  const [title, setTitle] = useState(action.text)
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (action.recurrencePattern || []).map(pattern => pattern.dayOfWeek as DayOfWeek)
  )
  const [selectedHour, setSelectedHour] = useState<string>(
    action.hour !== undefined 
      ? `${Math.floor(action.hour)}-${Math.round((action.hour % 1) * 60)}` 
      : '8-0'
  )
  const tiptapRef = useRef<{ editor: Editor | null }>(null)
  const [isRecurring, setIsRecurring] = useState(action.recurrencePattern && action.recurrencePattern.length > 0)
  const [isPlanned, setIsPlanned] = useState(
    action.startDate != null || action.endDate != null
  )
  useEffect(() => {
    setNotes(action.notes || [])
    setIsCompleted(action.key === '✔')
    setIsDateRange(action.isDateRange || false)
    setStartDate(
      action.startDate 
        ? format(new Date(action.startDate), 'yyyy-MM-dd') 
        : format(new Date(dateKey), 'yyyy-MM-dd')
    )
    setEndDate(
      action.endDate 
        ? format(new Date(action.endDate), 'yyyy-MM-dd') 
        : format(new Date(dateKey), 'yyyy-MM-dd')
    )
    setTitle(action.text)
    setSelectedDays((action.recurrencePattern || []).map(pattern => pattern.dayOfWeek as DayOfWeek))
    if (action.hour !== undefined) {
      const hour = Math.floor(action.hour);
      const minutes = Math.round((action.hour % 1) * 60);
      setSelectedHour(`${hour}-${minutes}`);
    }
    setIsRecurring(action.recurrencePattern && action.recurrencePattern.length > 0)
    setIsPlanned(!!action.startDate || !!action.endDate)
  }, [action, dateKey])

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
      }
      setNotes(prevNotes => [...prevNotes, newNoteObj])
      setNewNote('')
      if (tiptapRef.current && tiptapRef.current.editor) {
        tiptapRef.current.editor.commands.setContent('')
      }
    }
  }, [newNote])

  const updateNote = useCallback((id: string, newText: string) => {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === id ? { ...note, text: newText } : note
    ))
    setEditingNoteId(null)
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
  }, [])

  const handleDayChange = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = `${hour}-${minute}`;
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: timeValue, label: displayTime });
      }
    }
    return options;
  };

  const handleUpdate = async () => {
    const [hourStr, minuteStr] = selectedHour.split('-');
    const hour = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    const decimalHour = hour + (minutes / 60);

    const updatedAction: MassiveAction = {
      ...action,
      text: title,
      key: isCompleted ? '✔' : action.key,
      notes,
      isDateRange,
      startDate,
      endDate,
      selectedDays: isRecurring ? selectedDays : [],
      hour: decimalHour,
      updatedAt: new Date().toISOString()
    }

    try {
      // Create the recurrence pattern if isDateRange is true and days are selected
      const recurrencePattern = (isDateRange && selectedDays.length > 0) ? selectedDays.map(day => ({
        dayOfWeek: day
      })) : [];

      // Update the action with recurrence pattern
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedAction,
          recurrencePattern
        }),
      });

      onUpdate(updatedAction, dateKey);
      onClose();
    } catch (error) {
      console.error('Error updating action:', error);
    }
  }

  const timeOptions = generateTimeOptions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Actie bewerken</DialogTitle>
          </VisuallyHidden>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none focus-visible:ring-0 px-0"
          />
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>{action.key}</Badge>
            <span className="text-sm">{action.durationAmount} {action.durationUnit} - {action.leverage}</span>
          </div>
          {action.notes && action.notes.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold">Notities:</h4>
              <ul className="list-disc list-inside">
                {action.notes.map((note, index) => (
                  <li key={index} className="text-sm">{note.text}</li>
                ))}
              </ul>
            </div>
          )}
          geplaned : {isPlanned}
          {(isPlanned || isRecurring) && (
            <div className="text-sm text-semibold">
              Gepland op {startDate}
            </div>
          )}
          
          {(!isPlanned || isRecurring) && (            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="date-range"
                  checked={isDateRange}
                  onCheckedChange={setIsDateRange}
                />
                <Label htmlFor="date-range">
                  Actie over meerdere dagen
                </Label>
              </div>
              {isDateRange && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="start-date">Startdatum</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="end-date">Einddatum</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {isDateRange && (
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day}
                      variant={selectedDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDayChange(day)}
                    >
                      {DAY_LABELS[day]}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="grid gap-2">
            <Label htmlFor="time">Tijdstip</Label>
            <Select
              value={selectedHour}
              onValueChange={setSelectedHour}
            >
              <SelectTrigger>
                <SelectValue>
                  {timeOptions.find(opt => opt.value === selectedHour)?.label || 'Selecteer tijd'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
         
          <div>
            <h3 className="mb-2 text-sm font-medium">Notities</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {notes.map((note) => (
                <div key={note.id} className="mb-4 last:mb-0 bg-gray-100 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {format(new Date(note.createdAt), 'dd MMMM yyyy HH:mm', { locale: nl })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingNoteId(note.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Bewerken</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteNote(note.id)}>
                          <X className="mr-2 h-4 w-4" />
                          <span>Verwijderen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {editingNoteId === note.id ? (
                    <div className="mt-2">
                      <Tiptap
                        content={note.text}
                        onUpdate={(content) => updateNote(note.id, content)}
                        placeholder="Bewerk de notitie..."
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>Annuleren</Button>
                        <Button size="sm" onClick={() => setEditingNoteId(null)}>Opslaan</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm break-words" dangerouslySetInnerHTML={{ __html: note.text }} />
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
          <div>
            <Tiptap
              key={notes.length}
              ref={tiptapRef}
              content={''}
              onUpdate={setNewNote}
              placeholder="Voeg een nieuwe notitie toe..."
            />
            <Button onClick={addNote} className="mt-2">
              Notitie toevoegen
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpdate}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarPopup
