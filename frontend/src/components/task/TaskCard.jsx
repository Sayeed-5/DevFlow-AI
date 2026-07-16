import React from 'react'
import { Badge } from '../ui/Badge'

export const TaskCard = ({ task, onClick }) => {
    return (
        <div
            onClick={() => onClick(task)}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-colors"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="text-sm font-medium text-white leading-tight">{task.title}</h4>
                {task.priority && <Badge variant={task.priority} className="shrink-0">{task.priority}</Badge>}
            </div>
            {task.category && (
                <span className="text-xs text-neutral-500 block truncate">{task.category}</span>
            )}
        </div>
    )
}
