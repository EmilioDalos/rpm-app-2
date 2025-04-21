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
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [isDateRange, setIsDateRange] = useState(action.isDateRange || false)
  const [startDate, setStartDate] = useState<string>(action.startDate ? format(new Date(action.startDate), 'yyyy-MM-dd') : '');
  const [endDate, setEndDate] = useState<string>(action.endDate ? format(new Date(action.endDate), 'yyyy-MM-dd') : '');
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
    // Initialize notes from the action prop
    setNotes(action.notes || []);
    setIsCompleted(action.key === '✔');
    setIsDateRange(action.isDateRange || false);
    setStartDate(
      action.startDate 
        ? format(new Date(action.startDate), 'yyyy-MM-dd') 
        : format(new Date(dateKey), 'yyyy-MM-dd')
    );
    setEndDate(
      action.endDate 
        ? format(new Date(action.endDate), 'yyyy-MM-dd') 
        : format(new Date(dateKey), 'yyyy-MM-dd')
    );
    setTitle(action.text);
    setSelectedDays((action.recurrencePattern || []).map(pattern => pattern.dayOfWeek as DayOfWeek));
    if (action.hour !== undefined) {
      const hour = Math.floor(action.hour);
      const minutes = Math.round((action.hour % 1) * 60);
      setSelectedHour(`${hour}-${minutes}`);
    }
    setIsRecurring(action.recurrencePattern && action.recurrencePattern.length > 0);
    setIsPlanned((!!action.startDate || !!action.endDate) && !isRecurring);
    
    // Log the notes for debugging
    console.log('Action notes loaded:', action.notes);
  }, [action, dateKey]);

  // Add a new useEffect to automatically set endDate when startDate changes
  useEffect(() => {
    if (startDate && !isDateRange) {
      // Set endDate to the same as startDate by default
      setEndDate(startDate);
    }
  }, [startDate, isDateRange]);

  const addNote = useCallback(async () => {
    if (newNote.trim()) {
      try {
        // Call the API to add a note
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${action.id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newNote.trim(),
            type: 'note'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add note');
        }

        const newNoteObj = await response.json();
        
        // Update local state
        setNotes(prevNotes => [...prevNotes, newNoteObj]);
        setNewNote('');
        
        // Clear the editor
        if (tiptapRef.current && tiptapRef.current.editor) {
          tiptapRef.current.editor.commands.setContent('');
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  }, [newNote, action.id]);

  const updateNote = useCallback(async (id: string, newText: string) => {
    try {
      // Call the API to update the note
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newText,
          type: 'note'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      
      // Update local state
      setNotes(prevNotes => prevNotes.map(note =>
        note.id === id ? updatedNote : note
      ));
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      // Call the API to delete the note
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is successful (204 No Content or 200 OK)
      if (response.status !== 204 && response.status !== 200) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }
      
      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      // You might want to show a toast or notification here
    }
  }, []);

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

    // Format dates to ensure they're in the correct format for the API
    const formattedStartDate = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : null;
    const formattedEndDate = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : null;

    // Determine if the action is planned based on having a start date
    const isActionPlanned = !!formattedStartDate;

    const updatedAction: MassiveAction = {
      ...action,
      text: title,
      key: isActionPlanned ? '📅' : (isCompleted ? '✔' : action.key),
      notes,
      isDateRange,
      startDate: formattedStartDate || undefined,
      endDate: formattedEndDate || undefined,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${action.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedAction,
          recurrencePattern
        }),
      });

      if (!response.ok) {
        const status = response.status;
        let responseText: string;
        try {
          responseText = await response.text();
        } catch {
          responseText = '<niet beschikbaar>';
        }
        console.error(`Server gaf status ${status}, body:`, responseText);
        return;
      }

      // Call onUpdate with the new dateKey if the date has changed
      const newDateKey = formattedStartDate || dateKey;
      onUpdate(updatedAction, newDateKey);
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
          
          {(isPlanned) && !isDateRange && (
             <div className="grid gap-2">
                <Label htmlFor="time">Gepland</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
          )}
          
          {(!isPlanned) && !isDateRange && (
            <div className="grid gap-2">
              <Label htmlFor="time">Datum</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setIsPlanned(true);
                  }}
                  className="w-full"
                />
              </div>
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
          <div>
            <h3 className="mb-2 text-sm font-medium">Notities</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border bg-gray-100 p-4">
              {notes.map((note) => (
                <div key={note.id} className="mb-4 last:mb-0 bg-white p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                    {note.createdAt ? format(new Date(note.createdAt), 'dd MMMM yyyy HH:mm', { locale: nl }) : 'Onbekende datum'}                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteText(note.text);
                        }}>
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
                        content={editingNoteText}
                        onUpdate={setEditingNoteText}
                        placeholder="Bewerk de notitie..."
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingNoteId(null);
                          setEditingNoteText('');
                        }}>Annuleren</Button>
                        <Button size="sm" onClick={() => {
                          updateNote(note.id, editingNoteText);
                        }}>Opslaan</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm break-words" dangerouslySetInnerHTML={{ __html: note.text }} />
                  )}
                </div>
              ))}
            </ScrollArea>
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
