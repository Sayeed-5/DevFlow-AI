import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrgStore } from '../store/orgStore'
import { taskService } from '../services/taskService'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { ListChecks, CalendarDays } from 'lucide-react'

const PRIORITY_MAP = {
    P1: { label: 'High', color: '#f87171', bg: '#2d0a0a' },
    P2: { label: 'Medium', color: '#fbbf24', bg: '#1c1200' },
    P3: { label: 'Low', color: '#34d399', bg: '#052e16' },
}
const STATUS_MAP = {
    'Todo': { color: '#737373', bg: '#242424' },
    'In Progress': { color: '#38bdf8', bg: '#0c1a2e' },
    'Done': { color: '#22c55e', bg: '#052e16' },
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const isOverdue = (d, status) => d && status !== 'Done' && new Date(d) < new Date()

export const MyTasksPage = () => {
    const navigate = useNavigate()
    const { setCurrentProject } = useOrgStore()
    const [myTasks, setMyTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        taskService.getMyTasks()
            .then(tasks => setMyTasks(tasks))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const totalDone = myTasks.filter(t => t.status === 'Done').length
    const totalPending = myTasks.filter(t => t.status !== 'Done').length
    const totalOverdue = myTasks.filter(t => isOverdue(t.dueDate, t.status)).length

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            <Sidebar />
            <Navbar title="My Tasks" />

            <main className="ml-[240px] pt-14 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-0.5" style={{ color: '#ededed' }}>My Tasks</h2>
                    <p className="text-sm" style={{ color: '#737373' }}>All tasks assigned to you across all projects</p>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {[
                        { label: 'Total', value: myTasks.length, color: '#a3a3a3' },
                        { label: 'Pending', value: totalPending, color: '#38bdf8' },
                        { label: 'Done', value: totalDone, color: '#22c55e' },
                        { label: 'Overdue', value: totalOverdue, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} className="px-4 py-2 rounded-lg border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                            <span className="text-xs" style={{ color: '#737373' }}>{s.label}: </span>
                            <span className="font-semibold text-sm" style={{ color: s.color }}>{loading ? '-' : s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Tasks */}
                {loading ? (
                    <div className="py-20 text-center text-sm" style={{ color: '#737373' }}>Loading tasks...</div>
                ) : myTasks.length === 0 ? (
                    <div className="rounded-2xl border py-20 text-center" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#242424' }}>
                            <ListChecks className="w-6 h-6" style={{ color: '#525252' }} />
                        </div>
                        <p className="font-semibold mb-1" style={{ color: '#ededed' }}>No tasks assigned to you</p>
                        <p className="text-sm" style={{ color: '#737373' }}>Tasks assigned to your name will appear here.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border overflow-hidden" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        {/* Table header */}
                        <div className="grid px-5 py-3 border-b text-xs font-medium uppercase tracking-wider"
                            style={{ borderColor: '#2a2a2a', color: '#525252', gridTemplateColumns: '1fr 160px 130px 110px 110px' }}>
                            <span>Task</span>
                            <span>Project</span>
                            <span>Due Date</span>
                            <span>Priority</span>
                            <span>Status</span>
                        </div>
                        <div className="divide-y" style={{ borderColor: '#1f1f1f' }}>
                            {myTasks.map(task => {
                                const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.P2
                                const s = STATUS_MAP[task.status] || STATUS_MAP['Todo']
                                const od = isOverdue(task.dueDate, task.status)

                                return (
                                    <div key={task._id}
                                        onClick={() => { setCurrentProject(task.project); navigate(`/project/${task.project._id}`) }}
                                        className="grid px-5 py-3.5 items-center cursor-pointer hover:bg-white/[0.018] transition-colors"
                                        style={{ gridTemplateColumns: '1fr 160px 130px 110px 110px' }}>
                                        {/* Title */}
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-medium truncate" style={{ color: '#ededed' }}>{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs mt-0.5 truncate" style={{ color: '#525252' }}>{task.description}</p>
                                            )}
                                            {od && <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>⚠ Overdue</p>}
                                        </div>
                                        {/* Project */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: task.project?.color || '#10b981' }} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium truncate" style={{ color: '#a3a3a3' }}>{task.project?.name || 'Project'}</p>
                                                <p className="text-xs truncate" style={{ color: '#525252' }}>{task.organization?.name || 'Org'}</p>
                                            </div>
                                        </div>
                                        {/* Due Date */}
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: od ? '#ef4444' : '#525252' }} />
                                            <span className="text-xs" style={{ color: od ? '#ef4444' : '#737373' }}>{formatDate(task.dueDate)}</span>
                                        </div>
                                        {/* Priority */}
                                        <div>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ color: p.color, background: p.bg }}>{p.label}</span>
                                        </div>
                                        {/* Status */}
                                        <div>
                                            <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                                style={{ color: s.color, background: s.bg }}>{task.status}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
