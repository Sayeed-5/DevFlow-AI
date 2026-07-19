import React from 'react'
import { Badge } from '../ui/Badge'

export const TaskCard = ({ task, onClick }) => {
    return (
        <div
            onClick={() => onClick(task)}
            className="bg-brand-1 shadow-sm border border-brand-2/40 rounded-lg p-3 cursor-pointer hover:border-brand-2/60 transition-colors"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
                {task.priority && <Badge variant={task.priority} className="shrink-0">{task.priority}</Badge>}
            </div>
            {task.category && (
                <span className="text-xs text-gray-600 block truncate">{task.category}</span>
            )}
        </div>
    )
}
