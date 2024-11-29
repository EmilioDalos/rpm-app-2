import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MassiveAction } from './rpm-calendar'
import { Checkbox } from "@/components/ui/checkbox"

interface ActionPopupProps {
  action: MassiveAction
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction) => void
}

export const ActionPopup: React.FC<ActionPopupProps> = ({ action, isOpen, onClose, onUpdate }) => {
  const [notes, setNotes] = React.useState(action.notes || '')
  const [isCompleted, setIsCompleted] = React.useState(action.key === '✔')

  const handleUpdate = () => {
    onUpdate({
      ...action,
      notes,
      key: isCompleted ? '✔' : action.key
    })
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
          {action.missedDate && (
            <div className="text-sm text-red-500">
              Niet opgepakt op: {action.missedDate.toLocaleDateString()}
            </div>
          )}
          <Textarea
            placeholder="Voeg notities toe..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpdate}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

