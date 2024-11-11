import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from 'lucide-react'

type ActionPlanPanelProps = {
  group: {
    id: number
    title: string
    actions: { id: number; text: string; checked: boolean }[]
  }
  onClose: () => void
}

export default function ActionPlanPanel({ group, onClose }: ActionPlanPanelProps) {
  const [massiveActions, setMassiveActions] = useState<string[]>([])
  const [purposes, setPurposes] = useState<string[]>([])
  const [result, setResult] = useState('')

  const addMassiveAction = () => setMassiveActions([...massiveActions, ''])
  const removeMassiveAction = (index: number) => setMassiveActions(massiveActions.filter((_, i) => i !== index))

  const addPurpose = () => setPurposes([...purposes, ''])
  const removePurpose = (index: number) => setPurposes(purposes.filter((_, i) => i !== index))

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex">
      {/* Capturelist Return Bar */}
      <div
        className="bg-gray-900 text-white w-12 flex items-center justify-center cursor-pointer"
        onClick={onClose}
        title="Terug naar Capturelist"
      >
        <span className="transform -rotate-90 text-xs font-bold tracking-widest">CAPTURELIST</span>
      </div>
      
      {/* Action Plan Panel */}
      <div className="w-3/4 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Massive Action Plan</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Massive Action Plan */}
          <div>
            <h3 className="text-lg font-semibold bg-white p-2">MASSIVE ACTION PLAN</h3>
            {massiveActions.map((action, index) => (
              <div key={index} className="flex items-center my-2">
                <Input value={action} onChange={(e) => {
                  const newActions = [...massiveActions]
                  newActions[index] = e.target.value
                  setMassiveActions(newActions)
                }} />
                <Button onClick={() => removeMassiveAction(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button onClick={addMassiveAction}><Plus className="h-4 w-4" /></Button>
          </div>

          {/* Result */}
          <div className="bg-gray-200 p-2 text-center">
            <h3 className="text-lg font-semibold">RESULT</h3>
            <Input
              placeholder="What do I want?"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Purpose */}
          <div>
            <h3 className="text-lg font-semibold bg-white p-2">PURPOSE</h3>
            {purposes.map((purpose, index) => (
              <div key={index} className="flex items-center my-2">
                <Input value={purpose} onChange={(e) => {
                  const newPurposes = [...purposes]
                  newPurposes[index] = e.target.value
                  setPurposes(newPurposes)
                }} />
                <Button onClick={() => removePurpose(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button onClick={addPurpose}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  )
}
