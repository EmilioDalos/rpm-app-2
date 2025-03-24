'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MassiveAction, Note } from '@/types'
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

const Tiptap = dynamic(() => import('./tiptap-editor'), { ssr: false });

interface CalendarPopupProps {
  action: MassiveAction
  dateKey: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction, dateKey: string) => void
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ action, dateKey, isOpen, onClose, onUpdate }) => {
  const [notes, setNotes] = useState<Note[]>(action.notes || [])
  const [newNote, setNewNote] = useState('')
  const [isCompleted, setIsCompleted] = useState(action.key === '✔')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [isDateRange, setIsDateRange] = useState(action.isDateRange || false)
  const [startDate, setStartDate] = useState(action.startDate || dateKey)
  const [endDate, setEndDate] = useState(action.endDate || dateKey)
  const [recurringDays, setRecurringDays] = useState<string[]>(action.selectedDays || [])
  const [actionHour, setActionHour] = useState(action.hour || 8)
  const tiptapRef = useRef<{ editor: Editor | null }>(null)

  useEffect(() => {
    setNotes(action.notes || [])
    setIsCompleted(action.key === '✔')
    setIsDateRange(action.isDateRange || false)
    setStartDate(action.startDate || dateKey)
    setEndDate(action.endDate || dateKey)
    setRecurringDays(action.selectedDays || [])
    setActionHour(action.hour || 8)
  }, [action])

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

  const handleRecurringDayChange = (day: string) => {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleUpdate = () => {
    const updatedAction: MassiveAction = {
      ...action,
      key: isCompleted ? '✔' : action.key,
      notes,
      isDateRange,
      startDate,
      endDate,
      selectedDays: recurringDays,
      hour: actionHour,
      updatedAt: new Date().toISOString()
    }
    onUpdate(updatedAction, dateKey)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{action.text}</DialogTitle>
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
          {action.missedDate && (
            <div className="text-sm text-red-500">
              Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={(checked: CheckedState) => 
                setIsCompleted(checked === true)
              }
            />
            <label
              htmlFor="completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Actie voltooid
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="date-range"
              checked={isDateRange}
              onCheckedChange={setIsDateRange}
            />
            <Label htmlFor="date-range">Actie over meerdere dagen</Label>
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
            <div className="mt-4">
              <Label>Recurring Days</Label>
              <div className="flex space-x-2 mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Button
                    key={day}
                    variant={recurringDays.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRecurringDayChange(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="action-hour">Tijdstip</Label>
            <Select value={actionHour.toString()} onValueChange={(value) => setActionHour(parseInt(value))}>
              <SelectTrigger id="action-hour">
                <SelectValue placeholder="Selecteer een tijdstip" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i < 10 ? `0${i}` : i}:00
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

