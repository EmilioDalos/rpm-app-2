import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MassiveAction } from '@/types'
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ActionPopupProps {
  action: MassiveAction
  dateKey: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAction: MassiveAction, dateKey: string) => void
}

const ActionPopup: React.FC<ActionPopupProps> = ({ action, dateKey, isOpen, onClose, onUpdate }) => {
  const [isCompleted, setIsCompleted] = useState(action.key === '✔')
  const [isDateRange, setIsDateRange] = useState(action.isDateRange || false)
  const [startDate, setStartDate] = useState(action.startDate || '')
  const [endDate, setEndDate] = useState(action.endDate || '')
  const [selectedDays, setSelectedDays] = useState<string[]>(action.selectedDays || []);
  const [hour, setHour] = useState<number | undefined>(action.hour !== undefined ? action.hour : 8);
  const [durationAmount, setDurationAmount] = useState<number>(action.durationAmount || 1);
  const [durationUnit, setDurationUnit] = useState<string>(action.durationUnit || 'min');
  const [title, setTitle] = useState<string>(action.text || '');

  useEffect(() => {
    setIsCompleted(action.key === '✔')
    setIsDateRange(action.isDateRange || false)
    setStartDate(action.startDate || '')
    setEndDate(action.endDate || '')
    setSelectedDays(action.selectedDays || [])
    setHour(action.hour !== undefined ? action.hour : 8)
    setDurationAmount(action.durationAmount || 1)
    setDurationUnit(action.durationUnit || 'min')
    setTitle(action.text || '')
  }, [action])

  const handleUpdate = () => {
    const updatedAction: MassiveAction = {
      ...action,
      text: title,
      key: isCompleted ? '✔' : action.key,
      isDateRange,
      startDate,
      endDate,
      selectedDays,
      hour,
      durationAmount,
      durationUnit,
      updatedAt: new Date().toISOString()
    }
    onUpdate(updatedAction, dateKey)
    onClose()
  }

  const handleDayChange = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Enter action title"
            />
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>{action.key}</Badge>
            <span className="text-sm">{durationAmount} {durationUnit} - {action.leverage}</span>
          </div>
          {action.missedDate && (
            <div className="text-sm text-red-500">
              Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString()}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="hour-select">Tijdstip (uur)</Label>
              <Select 
                value={hour?.toString() || "8"} 
                onValueChange={(value) => setHour(parseInt(value, 10))}
              >
                <SelectTrigger id="hour-select">
                  <SelectValue placeholder="Selecteer uur" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h < 10 ? `0${h}:00` : `${h}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="duration-amount">Duur</Label>
              <div className="flex gap-2">
                <Input
                  id="duration-amount"
                  type="number"
                  min={1}
                  value={durationAmount}
                  onChange={(e) => setDurationAmount(Number(e.target.value))}
                  className="w-20"
                />
                <Select 
                  value={durationUnit} 
                  onValueChange={setDurationUnit}
                >
                  <SelectTrigger id="duration-unit">
                    <SelectValue placeholder="Eenheid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">min</SelectItem>
                    <SelectItem value="hr">uur</SelectItem>
                    <SelectItem value="day">dag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked === true)}
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
              <Label>Dagen van de week</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          handleDayChange(day);
                        } else if (checked === false) {
                          handleDayChange(day);
                        }
                      }}
                    />
                    <Label htmlFor={`day-${day}`}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleUpdate}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ActionPopup

