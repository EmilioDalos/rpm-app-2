import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MassiveAction } from '@/types'
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Pencil, X } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import dynamic from 'next/dynamic'

const Tiptap = dynamic(() => import('./tiptap-editor'), { ssr: false })

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

interface ActionPopupProps {
  action: MassiveAction
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction) => void
}

const ActionPopup: React.FC<ActionPopupProps> = ({ action, isOpen, onClose, onUpdate }) => {
  const [notes, setNotes] = useState<Note[]>(Array.isArray(action.notes) ? action.notes : []);
  const [newNote, setNewNote] = useState('')
  const [isCompleted, setIsCompleted] = useState(action.key === '✔')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  useEffect(() => {
    setNotes(Array.isArray(action.notes) ? action.notes : []);
    setIsCompleted(action.key === '✔');
  }, [action]);
  
  const handleUpdate = () => {
    onUpdate({
      ...action,
      notes,
      key: isCompleted ? '✔' : action.key
    });
    onClose();
  };

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
      }
      setNotes(prevNotes => [...prevNotes, newNoteObj])
      setNewNote('')
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
          {action.missedDate && (
            <div className="text-sm text-red-500">
              Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={setIsCompleted}
            />
            <label
              htmlFor="completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Actie voltooid
            </label>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Notities</h3>
            <div className="h-[200px] w-full rounded-md border p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
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
                        onUpdate={(newContent) => updateNote(note.id, newContent)}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>
                          Annuleren
                        </Button>
                        <Button size="sm" onClick={() => setEditingNoteId(null)}>
                          Opslaan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm break-words" dangerouslySetInnerHTML={{ __html: note.text }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Tiptap
              content={newNote}
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

export default ActionPopup

