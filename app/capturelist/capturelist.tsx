'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Group,
  Edit2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ActionPlanPanel from './action-plan-panel';

type Action = {
  id: number;
  text: string;
  checked: boolean;
  isEditing?: boolean;
};

type Group = {
  id: number;
  title: string;
  actions: Action[];
  isEditing: boolean;
};

export default function Capturelist() {
  const [actions, setActions] = useState<Action[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newAction, setNewAction] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [selectedGroupForPlan, setSelectedGroupForPlan] = useState<Group | null>(null);
  const [viewingGroup, setViewingGroup] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);

  // Load actions and groups from localStorage on mount
  useEffect(() => {
    const savedActions = localStorage.getItem('actions');
    const savedGroups = localStorage.getItem('groups');
    if (savedActions) setActions(JSON.parse(savedActions));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  }, []);

  // Save actions and groups to localStorage on state change
  useEffect(() => {
    localStorage.setItem('actions', JSON.stringify(actions));
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [actions, groups]);

  const addAction = () => {
    if (newAction.trim()) {
      setActions([...actions, { id: Date.now(), text: newAction, checked: false }]);
      setNewAction('');
    }
  };

  const removeAction = (id: number) => {
    setActions(actions.filter((action) => action.id !== id));
  };

  const toggleAction = (id: number) => {
    setActions(
      actions.map((action) =>
        action.id === id ? { ...action, checked: !action.checked } : action
      )
    );
  };

  const createGroup = () => {
    if (groupTitle.trim()) {
      const checkedActions = actions.filter((action) => action.checked);
      const newGroup = {
        id: Date.now(),
        title: groupTitle,
        actions: checkedActions,
        isEditing: false,
      };
      setGroups([...groups, newGroup]);

      // Remove checked actions from the Capturelist
      setActions(actions.filter((action) => !action.checked));
      setGroupTitle(''); // Reset group title input
    }
  };

  const addToGroup = () => {
    if (selectedGroup) {
      const groupId = parseInt(selectedGroup);
      const checkedActions = actions.filter((action) => action.checked);
      setGroups(
        groups.map((group) =>
          group.id === groupId
            ? { ...group, actions: [...group.actions, ...checkedActions] }
            : group
        )
      );
      setActions(actions.filter((action) => !action.checked));
      setSelectedGroup(null);
    }
  };

  const toggleGroupEditing = (groupId: number) => {
    setEditingGroupId((prevId) => (prevId === groupId ? null : groupId));
  };

  const updateGroupTitle = (groupId: number, newTitle: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, title: newTitle } : group
      )
    );
  };

  const openActionPlan = (group: Group) => {
    setSelectedGroupForPlan(group);
    setShowActionPlan(true);
  };

  const toggleGroupView = (groupId: number) => {
    setViewingGroup((prevViewingGroup) =>
      prevViewingGroup === groupId ? null : groupId
    );
  };

  const deleteGroup = (groupId: number) => {
    setGroups(groups.filter((group) => group.id !== groupId));
    if (viewingGroup === groupId) setViewingGroup(null);
  };

  const handleActionPlanClose = (deletedGroupId?: number) => {
    if (deletedGroupId) {
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== deletedGroupId)
      );
    }
    setShowActionPlan(false);
    setSelectedGroupForPlan(null);
  };

  return (
    <div className="flex">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Capturelist</h1>

        {/* Add Action Input */}
        <div className="flex mb-4">
          <Input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Nieuwe actie"
            className="mr-2"
          />
          <Button onClick={addAction}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions List */}
        <ul className="space-y-2 mb-4">
          {actions.map((action) => (
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

        {/* Add to Group */}
        <div className="flex mb-4">
          <Select value={selectedGroup || ''} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full mr-2">
              <SelectValue placeholder="Selecteer een groep" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addToGroup}
            disabled={!selectedGroup || !actions.some((a) => a.checked)}
          >
            Toevoegen aan groep
          </Button>
        </div>

        {/* Create Group */}
        <div className="flex mb-4">
          <Input
            type="text"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="Nieuwe groep"
            className="mr-2"
          />
          <Button onClick={createGroup}>
            <Group className="h-4 w-4" />
          </Button>
        </div>

        {/* Groups List */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Groepen</h2>
          {groups.map((group) => (
            <div key={group.id} className="mb-4 p-2 bg-gray-100 rounded">
              <div className="flex justify-between items-center mb-2">
                <div
                  className="flex items-center cursor-pointer hover:text-blue-600 flex-grow"
                  onClick={() => toggleGroupView(group.id)}
                >
                  {viewingGroup === group.id ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  {editingGroupId === group.id ? (
                    <Input
                      type="text"
                      value={group.title}
                      onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                      onBlur={() => toggleGroupEditing(group.id)}
                      className="ml-2"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-medium">{group.title}</h3>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupEditing(group.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openActionPlan(group)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {viewingGroup === group.id && (
                <ul className="ml-6 mt-2 space-y-1">
                  {group.actions.length > 0 ? (
                    group.actions.map((action) => (
                      <li
                        key={action.id}
                        className="flex items-center justify-between py-1 px-2 hover:bg-gray-200 rounded"
                      >
                        <span>{action.text}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">
                      Geen acties in deze groep
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan Panel */}
      {showActionPlan && selectedGroupForPlan && (
        <ActionPlanPanel
          group={selectedGroupForPlan}
          onClose={handleActionPlanClose}
        />
      )}
    </div>
  );
}