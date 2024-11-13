'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ActionPlan = {
  id: number
  text: string
  leverage: string
  durationAmount: number
  durationUnit: string
  priority: number
  key: string
}

type ActionPlanPanelProps = {
  group: {
    id: number
    title: string
    actions: { id: number; text: string; checked: boolean }[]
  }
  onClose: () => void
}

export default function ActionPlanPanel({ group, onClose }: ActionPlanPanelProps) {
  
  const [massiveActions, setMassiveActions] = useState<ActionPlan[]>([])
  const [purposes, setPurposes] = useState<string[]>([])
  const [result, setResult] = useState('')
  const [activeColumn, setActiveColumn] = useState('massiveActions')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Add the group's actions to the massiveActions list when the panel opens
  useEffect(() => {
    if (group?.actions?.length) {
      const newActions = group.actions.map((action) => ({
        id: Date.now() + Math.random(), // Ensure unique ID
        text: action.text,
        leverage: '',
        durationAmount: 0,
        durationUnit: 'min',
        priority: massiveActions.length + 1,
        key: '✘',
      }))
      setMassiveActions([...massiveActions, ...newActions])
      setResult(group.title);
    }
  }, [group])

  const addMassiveAction = () => {
    const newAction: ActionPlan = {
      id: Date.now(),
      text: '',
      leverage: '',
      durationAmount: 0,
      durationUnit: 'min',
      priority: massiveActions.length + 1,
      key: '✘'
    }
    setMassiveActions([...massiveActions, newAction])
  }

  const handleResultChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResult(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const updateMassiveAction = (index: number, updatedAction: Partial<ActionPlan>) => {
    const updatedActions = massiveActions.map((action, i) => 
      i === index ? { ...action, ...updatedAction } : action
    )
    setMassiveActions(updatedActions)
  }

  const removeMassiveAction = (index: number) => {
    setMassiveActions(massiveActions.filter((_, i) => i !== index))
  }

  const addPurpose = () => setPurposes([...purposes, ''])
  const removePurpose = (index: number) => setPurposes(purposes.filter((_, i) => i !== index))

  const toggleColumn = (column: string) => {
    setActiveColumn(activeColumn === column ? '' : column)
  }

  return (
    <div className="fixed inset-0 bg-gray-1000 bg-opacity-75 flex">
      {/* Capturelist Return Bar */}
      <div
        className="bg-gray-900 text-white w-16 flex items-center justify-center cursor-pointer"
        onClick={onClose}
        title="Terug naar Capturelist"
      >
        <span className="transform -rotate-90 text-xs font-bold tracking-widest">CAPTURELIST</span>
      </div>
      
      {/* Action Plan Panel */}
      <div className="flex-grow bg-white shadow-lg overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-grow p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">{group.title} - Massive Action Plan</h2>

          {/* Column Layout */}
          <div className="flex justify-between gap-4">
            {/* Massive Action Plan Column */}
            <div className={`flex-[2] p-4 rounded-lg w-full bg-gray-100 ${isCollapsed && activeColumn !== 'massiveActions' ? 'hidden' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">MASSIVE ACTION PLAN</h3>
              
              {massiveActions.map((action, index) => (
                <div key={action.id} className="flex items-center my-2 rounded  w-full">
                  <Input
                    placeholder="LB"
                    value={action.leverage}
                    onChange={(e) => updateMassiveAction(index, { leverage: e.target.value })}
                    className="w-10 text-xs p-1"
                  />
                  <Input
                    placeholder="1"
                    type="number"
                    value={action.durationAmount}
                    onChange={(e) => updateMassiveAction(index, { durationAmount: parseInt(e.target.value) })}
                    className="w-10 text-xs p-1"
                  />
                  <Select
                    value={action.durationUnit}
                    onValueChange={(value) => updateMassiveAction(index, { durationUnit: value })}
                  >
                    <SelectTrigger className="w-16 text-xs p-1"><SelectValue placeholder="Unit" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="min">min</SelectItem>
                      <SelectItem value="hr">hr</SelectItem>
                      <SelectItem value="d">d</SelectItem>
                      <SelectItem value="wk">wk</SelectItem>
                      <SelectItem value="mo">mo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="P"
                    type="number"
                    value={action.priority}
                    onChange={(e) => updateMassiveAction(index, { priority: parseInt(e.target.value) })}
                    className="w-10 text-xs p-1"
                  />
                  <Select
                    value={action.key}
                    onValueChange={(value) => updateMassiveAction(index, { key: value })}
                  >
                    <SelectTrigger className="w-10 text-xs p-1"><SelectValue placeholder="Key" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="✘">✘</SelectItem>
                      <SelectItem value="✔">✔</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                      <SelectItem value="➜">➜</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    value={action.text} 
                    placeholder="Test Action" 
                    onChange={(e) => updateMassiveAction(index, { text: e.target.value })}
                    className="flex-grow text-xs p-1"
                  />
                  <Button onClick={() => removeMassiveAction(index)} variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}

              <Button onClick={addMassiveAction} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Action</Button>
            </div>

            {/* Result and Purpose Columns remain unchanged */}
            <div className={`flex-1 p-4 rounded-lg text-center bg-gray-200 ${isCollapsed && activeColumn !== 'result' ? 'hidden' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">RESULT</h3>
              <Textarea
                placeholder="What do I want?"
                value={result}
                onChange={handleResultChange}
                className="w-full mt-2 text-xs p-1 bg-white min-h-[100px] resize-none overflow-hidden"
              />
            </div>
            <div className={`flex-1 p-4 rounded-lg bg-gray-300 ${isCollapsed && activeColumn !== 'purpose' ? 'hidden' : ''}`}>
              <h3 className="text-lg font-semibold mb-2">PURPOSE</h3>
              {purposes.map((purpose, index) => (
                <div key={index} className="flex items-center my-2">
                  <Input
                    placeholder="Purpose"
                    value={purpose}
                    onChange={(e) => {
                      const newPurposes = [...purposes]
                      newPurposes[index] = e.target.value
                      setPurposes(newPurposes)
                    }}
                    className="flex-grow text-xs p-1 bg-white"
                  />
                  <Button onClick={() => removePurpose(index)} variant="ghost" size="sm" className="ml-1">
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
              <Button onClick={addPurpose} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Purpose</Button>
            </div>
          </div>

          <Button onClick={onClose} className="mt-6">Close</Button>
        </div>

        {/* Right Sidebar */}
        {isCollapsed && (
          <div className="w-16 bg-gray-900 flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="sm"
              className={`mb-4 w-full h-16 ${activeColumn === 'massiveActions' ? 'bg-gray-800' : ''}`}
              onClick={() => toggleColumn('massiveActions')}
            >
              <span className="transform rotate-90 text-xs font-bold tracking-widest text-white">
                ACTIONS
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`mb-4 w-full h-16 ${activeColumn === 'result' ? 'bg-gray-800' : ''}`}
              onClick={() => toggleColumn('result')}
            >
              <span className="transform rotate-90 text-xs font-bold tracking-widest text-white">
                RESULT
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`mb-4 w-full h-16 ${activeColumn === 'purpose' ? 'bg-gray-800' : ''}`}
              onClick={() => toggleColumn('purpose')}
            >
              <span className="transform rotate-90 text-xs font-bold tracking-widest text-white">
                PURPOSE
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
