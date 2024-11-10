'use client'

import { useState } from 'react'
import { Header } from "@/components/layout/header";

import { Plus, Trash2, Group, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Action = {
  id: number
  text: string
  checked: boolean
}

type Group = {
  id: number
  title: string
  actions: Action[]
  isEditing: boolean
}

export default function Capturelist() {
  const [actions, setActions] = useState<Action[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [newAction, setNewAction] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const addAction = () => {
    if (newAction.trim()) {
      setActions([...actions, { id: Date.now(), text: newAction, checked: false }])
      setNewAction('')
    }
  }

  const removeAction = (id: number) => {
    setActions(actions.filter(action => action.id !== id))
  }

  const toggleAction = (id: number) => {
    setActions(actions.map(action => 
      action.id === id ? { ...action, checked: !action.checked } : action
    ))
  }

  const createGroup = () => {
    if (groupTitle.trim()) {
      const newGroup = { id: Date.now(), title: groupTitle, actions: [], isEditing: false }
      setGroups([...groups, newGroup])
      setGroupTitle('')
    }
  }

  const addToGroup = () => {
    if (selectedGroup) {
      const groupId = parseInt(selectedGroup)
      const checkedActions = actions.filter(action => action.checked)
      setGroups(groups.map(group => 
        group.id === groupId
          ? { ...group, actions: [...group.actions, ...checkedActions] }
          : group
      ))
      setActions(actions.filter(action => !action.checked))
      setSelectedGroup(null)
    }
  }

  const moveActionToCapturelist = (groupId: number, actionId: number) => {
    const group = groups.find(g => g.id === groupId)
    if (group) {
      const action = group.actions.find(a => a.id === actionId)
      if (action) {
        setActions([...actions, { ...action, checked: false }])
        setGroups(groups.map(g => 
          g.id === groupId 
            ? { ...g, actions: g.actions.filter(a => a.id !== actionId) }
            : g
        ))
      }
    }
  }

  const toggleGroupEditing = (groupId: number) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isEditing: !g.isEditing } : g
    ))
  }

  const updateGroupTitle = (groupId: number, newTitle: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, title: newTitle, isEditing: false } : g
    ))
  }


  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Capturelist</h1>
      
      <div className="flex mb-4">
        <Input
          type="text"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          placeholder="Nieuwe actie"
          className="mr-2"
        />
        <Button onClick={addAction}><Plus className="h-4 w-4" /></Button>
      </div>

      <ul className="space-y-2 mb-4">
        {actions.map(action => (
          <li key={action.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                checked={action.checked}
                onCheckedChange={() => toggleAction(action.id)}
                className="mr-2"
              />
              <span>{action.text}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeAction(action.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex mb-4">
        <Input
          type="text"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          placeholder="Nieuwe groep"
          className="mr-2"
        />
        <Button onClick={createGroup}><Group className="h-4 w-4" /></Button>
      </div>

      <div className="flex mb-4">
        <Select value={selectedGroup || ''} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full mr-2">
            <SelectValue placeholder="Selecteer een groep" />
          </SelectTrigger>
          <SelectContent>
            {groups.map(group => (
              <SelectItem key={group.id} value={group.id.toString()}>{group.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addToGroup} disabled={!selectedGroup || !actions.some(a => a.checked)}>
          Toevoegen aan groep
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Groepen</h2>
        {groups.map(group => (
          <div key={group.id} className="mb-4 p-2 bg-gray-100 rounded">
            {group.isEditing ? (
              <div className="flex mb-2">
                <Input
                  type="text"
                  value={group.title}
                  onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                  className="mr-2"
                />
                <Button onClick={() => toggleGroupEditing(group.id)}>Opslaan</Button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{group.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => toggleGroupEditing(group.id)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <ul className="ml-4">
              {group.actions.map(action => (
                <li 
                  key={action.id} 
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => moveActionToCapturelist(group.id, action.id)}
                >
                  {action.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
      </div>
    </main>
  );

  
}
