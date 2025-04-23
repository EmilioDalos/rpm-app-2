'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MassiveAction, CalendarEvent, Note, DayOfWeek } from '@/types'
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
  action: CalendarEvent
  dateKey: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: CalendarEvent, dateKey: string) => void
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
  const [isDateRange, setIsDateRange] = useState<boolean>(!!action?.endDate && action.startDate !== action.endDate);
  const [startDate, setStartDate] = useState<string>(action?.startDate ? format(new Date(action.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(action?.endDate ? format(new Date(action.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState<string>(action?.text || '');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    (action.recurrencePattern || []).map(pattern => pattern.dayOfWeek as DayOfWeek)
  )
  const [selectedHour, setSelectedHour] = useState<string>(
    action.hour !== undefined 
      ? `${Math.floor(action.hour)}-${Math.round((action.hour % 1) * 60)}` 
      : '8-0'
  )
  const tiptapRef = useRef<{ editor: Editor | null }>(null)
  const [isRecurring, setIsRecurring] = useState(action.recurrDays && action.recurrDays.length > 0);
  const [isPlanned, setIsPlanned] = useState(action.status === 'planned');
  const [recurrDays, setRecurrDays] = useState<DayOfWeek[]>(action?.recurrDays || []);
  const [selectedStatus, setSelectedStatus] = useState<'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved'>(
    (action?.status as 'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved') || 'new'
  );
  useEffect(() => {
    // Initialize notes from the action prop
    setNotes(action.notes || []);
    setIsCompleted(action.key === '✔');
    setIsDateRange(!!action?.endDate && action.startDate !== action.endDate);
    setStartDate(action?.startDate ? format(new Date(action.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setEndDate(action?.endDate ? format(new Date(action.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setTitle(action.text);
    setSelectedDays((action.recurrencePattern || []).map(pattern => pattern.dayOfWeek as DayOfWeek));
    if (action.hour !== undefined) {
      const hour = Math.floor(action.hour);
      const minutes = Math.round((action.hour % 1) * 60);
      setSelectedHour(`${hour}-${minutes}`);
    }
    setIsRecurring(action.recurrDays && action.recurrDays.length > 0);
    setIsPlanned(action.status === 'planned');
    setRecurrDays(action?.recurrDays || []);
    setSelectedStatus((action.status as 'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved') || 'new');
    
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
        // Get the correct ID - try actionId first (the underlying action ID),
        // then fall back to id (which is probably the occurrence ID)
        const idToUse = action.actionId || action.id;
        
        console.log(`Adding note to event:`, {
          eventId: action.id,
          actionId: action.actionId,
          idToUse,
          calendarEvent: action
        });
        
        // Call the API to add a note
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/${idToUse}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newNote.trim(),
            type: 'note'
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server response error:', errorData);
          throw new Error(`Failed to add note: ${errorData}`);
        }

        const data = await response.json();
        console.log('Note added successfully:', data);
        
        // The API returns { note } so we need to extract the note object
        const newNoteObj = data.note || data;
        
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
  }, [newNote, action]);


  const deleteNote = useCallback(async (id: string) => {
    try {
      console.log(`Deleting note with ID: ${id}`);
      
      // Call the API to delete the note
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar-events/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is successful (204 No Content or 200 OK)
      if (response.status !== 204 && response.status !== 200) {
        const errorData = await response.text();
        console.error('Server response error:', errorData);
        throw new Error(`Failed to delete note: ${errorData}`);
      }
      
      console.log(`Note ${id} deleted successfully`);
      
      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, []);

  const handleDayChange = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

   const updateNote = useCallback(async (id: string, newText: string) => {
    try {
      console.log(`Updating note with ID: ${id}`, { newText });
      
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
        const errorData = await response.text();
        console.error('Server response error:', errorData);
        throw new Error(`Failed to update note: ${errorData}`);
      }

      const updatedNote = await response.json();
      console.log('Note updated successfully:', updatedNote);
      
      // Update local state
      setNotes(prevNotes => prevNotes.map(note =>
        note.id === id ? updatedNote : note
      ));
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, []);

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

  const handleSave = useCallback(() => {
    const updatedAction: CalendarEvent = {
      ...action,
      text: title,
      notes,
      key: isCompleted ? '✔' : '✘',
      isDateRange,
      startDate: startDate || dateKey,
      endDate: endDate || dateKey,
      hour: selectedHour ? parseFloat(selectedHour.split('-')[0]) + parseFloat(selectedHour.split('-')[1]) / 60 : undefined,
      recurrencePattern: isRecurring ? selectedDays.map(day => ({
        id: '',
        actionId: action.id,
        dayOfWeek: day
      })) : undefined,
      status: selectedStatus
    };
    onUpdate(updatedAction, dateKey);
    onClose();
  }, [action, title, notes, isCompleted, isDateRange, startDate, endDate, selectedHour, isRecurring, selectedDays, selectedStatus, dateKey, onUpdate, onClose]);

  const timeOptions = generateTimeOptions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Actie Bewerken</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-130px)]">
          <div className="grid gap-4 py-4 px-1">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Voer een titel in"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved') => setSelectedStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nieuw</SelectItem>
                  <SelectItem value="in_progress">In uitvoering</SelectItem>
                  <SelectItem value="completed">Voltooid</SelectItem>
                  <SelectItem value="cancelled">Geannuleerd</SelectItem>
                  <SelectItem value="planned">Gepland</SelectItem>
                  <SelectItem value="leveraged">Geleverd</SelectItem>
                  <SelectItem value="not_needed">Niet nodig</SelectItem>
                  <SelectItem value="moved">Verplaatst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>{action.key}</Badge>
              <span className="text-sm">{action.durationAmount} {action.durationUnit} - {action.leverage}</span>
            </div>

            {/* Planning section */}
            <div className="mt-4 border-t pt-4">
              <h3 className="mb-3 text-sm font-medium">Planning</h3>
              
              {/* Multi-day toggle */}
              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="date-range"
                  checked={isDateRange}
                  onCheckedChange={setIsDateRange}
                />
                <Label htmlFor="date-range">
                  Actie over meerdere dagen
                </Label>
              </div>
              
              {/* Date selection */}
              {isDateRange ? (
                <div className="grid grid-cols-2 gap-4 mb-3">
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
              ) : (
                <div className="grid gap-2 mb-3">
                  <Label htmlFor="single-date">Datum</Label>
                  <Input
                    id="single-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setIsPlanned(true);
                    }}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Recurring days */}
              {isDateRange && (
                <>
                  <div className="flex items-center space-x-2 mb-3">
                    <Switch
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="recurring">
                      Herhaling op specifieke dagen
                    </Label>
                  </div>
                  
                  {isRecurring && (
                    <div className="mb-3">
                      <Label className="mb-2 block">Selecteer dagen</Label>
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
                    </div>
                  )}
                </>
              )}
              
              {/* Time selection */}
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
            </div>
           
            {/* Notes section */}
            <div className="mt-4 border-t pt-4">
              <h3 className="mb-3 text-sm font-medium">Notities</h3>
              
              {/* Note editor */}
              <div className="mb-4">
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
              
              {/* Notes list */}
              <div className="h-[200px] w-full rounded-md border bg-gray-100 p-4 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-500">Geen notities</span>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="mb-4 last:mb-0 bg-white p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                        {note.createdAt ? format(new Date(note.createdAt), 'dd MMMM yyyy HH:mm', { locale: nl }) : 'Onbekende datum'}
                        </span>
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
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarPopup
