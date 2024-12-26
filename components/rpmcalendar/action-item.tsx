import React from 'react'
import { useDrag } from 'react-dnd'
import { Badge } from "@/components/ui/badge"
import { MassiveAction } from '@/types';

interface ActionItemProps {
  action: MassiveAction
  onClick: () => void
  isPlanned: boolean
}

const ActionItem: React.FC<ActionItemProps> = ({ action, onClick, isPlanned }) => {
  console.log("is planned"+isPlanned)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'action',
    item: action,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={!isPlanned ? drag : null} // Alleen ref toewijzen als de actie niet gepland is
      className={`mb-2 p-2 rounded-md shadow-sm ${
        isPlanned ? 'cursor-default' : 'cursor-move'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>
          {action.key}
        </Badge>
        <span className="text-xs">
          {action.durationAmount} {action.durationUnit}
        </span>
      </div>
      <p className="text-sm font-medium mt-1">{action.text}</p>
      {isPlanned && (
        <Badge variant="outline" className="mt-1">
          Gepland
        </Badge>
      )}
      {action.missedDate && (
        <div className="text-xs text-red-500 mt-1">
          Niet opgepakt op: {action.missedDate.toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export default ActionItem

