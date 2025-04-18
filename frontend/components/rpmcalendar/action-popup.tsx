"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MassiveAction, Note } from "@/types"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Editor } from "@tiptap/react"
import dynamic from "next/dynamic"

const Tiptap = dynamic(() => import("./tiptap-editor"), { ssr: false })

interface ActionPopupProps {
  action: MassiveAction
  dateKey: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction, dateKey: string) => void
}

const ActionPopup: React.FC<ActionPopupProps> = ({ action, dateKey, isOpen, onClose, onUpdate }) => {
  const [title, setTitle] = useState(action.text)
  const [isRecurring, setIsRecurring] = useState(action.isDateRange || false)
  const [startDate, setStartDate] = useState(action.startDate || "")
  const [endDate, setEndDate] = useState(action.endDate || "")
  const [selectedDays, setSelectedDays] = useState<string[]>(action.selectedDays || [])
  const [selectedHour, setSelectedHour] = useState<string>(action.hour !== undefined ? `${action.hour}:00` : "00:00")
  const [notes, setNotes] = useState<Note[]>(action.notes || [])
  const [newNote, setNewNote] = useState("")
  const tiptapRef = useRef<{ editor: Editor | null }>(null)

  useEffect(() => {
    setTitle(action.text)
    setIsRecurring(action.isDateRange || false)
    setStartDate(action.startDate || "")
    setEndDate(action.endDate || "")
    setSelectedDays(action.selectedDays || [])
    setSelectedHour(action.hour !== undefined ? `${action.hour}:00` : "00:00")
    setNotes(action.notes || [])
  }, [action])

  const handleDayChange = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleUpdate = () => {
    const hour = Number.parseInt(selectedHour.split(":")[0], 10)

    const updatedAction: MassiveAction = {
      ...action,
      text: title,
      isDateRange: isRecurring,
      startDate,
      endDate,
      selectedDays,
      hour,
      notes: newNote.trim()
        ? [...notes, { id: Date.now().toString(), text: newNote, createdAt: new Date().toISOString() }]
        : notes,
      updatedAt: new Date().toISOString(),
    }
    onUpdate(updatedAction, dateKey)
    onClose()
  }

  const addNote = () => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
      }
      setNotes((prevNotes) => [...prevNotes, newNoteObj])
      setNewNote("")
      if (tiptapRef.current && tiptapRef.current.editor) {
        tiptapRef.current.editor.commands.setContent("")
      }
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`
    return `${hour}:00`
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none focus-visible:ring-0 px-0"
          />
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={action.key === "✔" ? "default" : "secondary"}>{action.key}</Badge>
            <span className="text-sm">
              {action.durationAmount} {action.durationUnit} - {action.leverage}
            </span>
          </div>

          {/* Date Range Section */}
          <div className="space-y-4">
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring" className="text-base font-medium">
                📆 Recurring Days
              </Label>
              ch<div className="flex items-center space-x-2">
                <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label htmlFor="recurring">Actie over meerdere dagen</Label>
              </div>
            </div>

            {isRecurring && (
              <>
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
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <Button
                      key={day}
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDayChange(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <Separator className="my-2" />
            <Label htmlFor="time-select" className="text-base font-medium">
              ⏰ Tijdstip
            </Label>
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger id="time-select">
                <SelectValue placeholder="Selecteer tijd" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <Separator className="my-2" />
            <Label className="text-base font-medium">📝 Notities</Label>

            {/* Existing Notes */}
            {notes.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {notes.map((note) => (
                  <div key={note.id} className="p-2 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: note.text }} />
                  </div>
                ))}
              </div>
            )}

            {/* New Note */}
            <div className="space-y-2">
              <Tiptap ref={tiptapRef} content="" onUpdate={setNewNote} placeholder="Voeg een nieuwe notitie toe..." />
              <div className="flex justify-end">
                <Button onClick={addNote} size="sm">
                  Notitie toevoegen
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button type="submit" onClick={handleUpdate}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ActionPopup

