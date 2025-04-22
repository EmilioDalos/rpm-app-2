import React from 'react'
import { useDrag } from 'react-dnd'
import { Badge } from "@/components/ui/badge"
import { MassiveAction } from '@/types'

interface ActionItemProps {
  action: MassiveAction
  onClick: () => void
  isPlanned: boolean
}

const ActionItem: React.FC<ActionItemProps> = ({ action, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'action',
    item: action,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`mb-2 p-2 rounded-md shadow-sm cursor-move ${action.color} ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <Badge variant={action.key === '✔' ? 'default' : 'secondary'}>
          {action.key}
        </Badge>
        <span className="text-xs">{action.durationAmount} {action.durationUnit}</span>
      </div>
      <p className="text-sm font-medium mt-1">{action.text}</p>
      <div className="flex gap-2 mt-1">
       
        {action.actionStatus && (
          <Badge 
            variant={action.actionStatus === 'completed' ? 'default' : 'secondary'}
          >
            {action.actionStatus === 'completed' ? 'Voltooid' : 
             action.actionStatus === 'in_progress' ? 'In uitvoering' : 
             action.actionStatus === 'cancelled' ? 'Geannuleerd' : 'Nieuw'}
          </Badge>
        )}
      </div>
      {action.missedDate && (
        <div className="text-xs text-red-500 mt-1">
          Niet opgepakt op: {new Date(action.missedDate).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export default ActionItem

