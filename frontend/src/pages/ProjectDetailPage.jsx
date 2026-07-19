import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, ChevronDown, Users, CalendarDays, Flag, Trash2, UserCircle } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { useOrgStore } from '../store/orgStore'
import { useAuthStore } from '../store/authStore'
import { inviteService } from '../services/inviteService'
import toast from 'react-hot-toast'

const PRIORITY_MAP = {
    P1: { label: 'High', color: '#f87171', bg: '#2d0a0a' },
    P2: { label: 'Medium', color: '#fbbf24', bg: '#1c1200' },
    P3: { label: 'Low', color: '#34d399', bg: '#052e16' },
}

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done']
const STATUS_MAP = {
    'Todo': { color: '#737373', bg: '#242424' },
    'In Progress': { color: '#38bdf8', bg: '#0c1a2e' },
    'Done': { color: '#22c55e', bg: '#052e16' },
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const isOverdue = (d, status) => d && status !== 'Done' && new Date(d) < new Date()

// Mini invite modal
const InviteModal = ({ orgId, onClose }) => {
    const [emails, setEmails] = useState('')
    const [sending, setSending] = useState(false)

    const handleInvite = async (e) => {
        e.preventDefault()
        const list = emails.split(',').map(e => e.trim()).filter(Boolean)
        if (!list.length) return toast.error('Enter at least one email')
        setSending(true)
        try {
            await inviteService.sendInvites(orgId, list)
            toast.success(`Invited ${list.length} member${list.length > 1 ? 's' : ''}`)
            onClose()
        } catch (err) {
            toast.error('Failed to send invites')
        } finally {
            setSending(false)
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold" style={{ color: '#ededed' }}>Invite People</h3>
                    <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#737373' }} /></button>
                </div>
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Email addresses (comma-separated)</label>
                        <textarea
                            autoFocus
                            value={emails}
                            onChange={e => setEmails(e.target.value)}
                            placeholder="john@co.com, sarah@co.com"
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                            style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                            onFocus={e => e.target.style.borderColor = '#10b981'}
                            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                        />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-lg font-semibold text-sm" style={{ background: '#10b981', color: '#fff' }}>
                        Send Invites
                    </button>
                </form>
            </div>
        </div>
    )
}

// Add Task Modal
const AddTaskModal = ({ projectId, members, onClose, onAdded }) => {
    const { addTaskToProject } = useOrgStore()
    const [form, setForm] = useState({ title: '', description: '', priority: 'P2', status: 'Todo', assignee: '', dueDate: '' })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) return toast.error('Task title required')
        setSaving(true)
        try {
            await addTaskToProject(projectId, form)
            toast.success('Task added')
            onAdded()
            onClose()
        } catch (err) {
            toast.error('Failed to add task')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold" style={{ color: '#ededed' }}>Add Task</h3>
                    <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#737373' }} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Title *</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Task title" className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                            style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Optional details..." rows={2}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                            style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Priority</label>
                            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}>
                                <option value="P1">High</option>
                                <option value="P2">Medium</option>
                                <option value="P3">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Assignee</label>
                            <select value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}>
                                <option value="">Unassigned</option>
                                {(members || []).map(m => (
                                    <option key={m.id || m.email} value={m.name || m.email}>{m.name || m.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#a3a3a3' }}>Due Date</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                                style={{
                                    background: '#242424', borderColor: '#2a2a2a', color: '#ededed',
                                    colorScheme: 'dark'
                                }} />
                        </div>
                    </div>
                    <button type="submit" disabled={saving}
                        className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                        style={{ background: '#10b981', color: '#fff' }}>
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Task'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// Inline status dropdown for a task row
const StatusDropdown = ({ task, projectId }) => {
    const { updateTaskInProject } = useOrgStore()
    const [open, setOpen] = useState(false)
    const s = STATUS_MAP[task.status] || STATUS_MAP['Todo']

    const handleChange = (newStatus) => {
        updateTaskInProject(projectId, { ...task, status: newStatus })
        setOpen(false)
    }

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{ background: s.bg, color: s.color }}
            >
                {task.status}
                <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 rounded-xl border overflow-hidden z-20 shadow-xl min-w-[130px]"
                    style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                    {STATUS_OPTIONS.map(st => {
                        const sm = STATUS_MAP[st]
                        return (
                            <button key={st} onClick={() => handleChange(st)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-white/5 transition-colors"
                                style={{ color: sm.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: sm.color }} />
                                {st}
                                {task.status === st && <span className="ml-auto" style={{ color: '#10b981' }}>✓</span>}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export const ProjectDetailPage = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { orgs, currentOrg, projects, tasks, currentProject, setCurrentProject, deleteTaskFromProject } = useOrgStore()
    const [showInvite, setShowInvite] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterPriority, setFilterPriority] = useState('All')

    // On unlinked visit, setCurrentProject to trigger fetchTasks
    React.useEffect(() => {
        if (!currentProject || currentProject._id !== projectId) {
            const p = projects.find(pr => (pr._id || pr.id) === projectId)
            if (p) setCurrentProject(p)
        }
    }, [projectId, projects, currentProject, setCurrentProject])

    // Resolve project from store
    const project = projects.find(p => (p._id || p.id) === projectId) || currentProject

    const total = tasks.length
    const done = tasks.filter(t => t.status === 'Done').length
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0

    const filteredTasks = tasks.filter(t => {
        const matchStatus = filterStatus === 'All' || t.status === filterStatus
        const matchPriority = filterPriority === 'All' || t.priority === filterPriority
        return matchStatus && matchPriority
    })

    const handleDelete = async (taskId) => {
        if (confirm('Delete this task?')) {
            try {
                await deleteTaskFromProject(projectId, taskId)
                toast.success('Task deleted')
            } catch (err) {
                toast.error('Failed to delete task')
            }
        }
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
                <div className="text-center">
                    <p className="mb-3" style={{ color: '#737373' }}>Project not found</p>
                    <button onClick={() => navigate('/project-select')} className="text-sm px-4 py-2 rounded-lg" style={{ background: '#10b981', color: '#fff' }}>
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            <Sidebar />
            <Navbar title={project.name} />

            <main className="ml-[240px] pt-14 p-8">
                {/* Project Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg transition-colors" style={{ color: '#737373' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ededed'} onMouseLeave={e => e.currentTarget.style.color = '#737373'}>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                    style={{ background: (project.color || '#10b981') + '22', color: project.color || '#10b981' }}>
                                    {project.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold leading-none" style={{ color: '#ededed' }}>{project.name}</h2>
                                    {project.description && <p className="text-sm mt-1" style={{ color: '#737373' }}>{project.description}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Member avatars */}
                            <div className="flex -space-x-2">
                                {(project.members || []).slice(0, 4).map((m, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                                        style={{ background: '#242424', color: '#a3a3a3', borderColor: '#0a0a0a' }}>
                                        {(m.name || m.email || '?')[0].toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowInvite(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all"
                                style={{ borderColor: '#2a2a2a', color: '#a3a3a3', background: '#1c1c1c' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#a3a3a3' }}
                            >
                                <Users className="w-3.5 h-3.5" /> Invite
                            </button>
                            <button
                                onClick={() => setShowAddTask(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{ background: '#10b981', color: '#fff' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Task
                            </button>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-6 flex items-center gap-4 flex-wrap">
                        {[
                            { label: 'Total', value: total, color: '#a3a3a3' },
                            { label: 'Todo', value: tasks.filter(t => t.status === 'Todo').length, color: '#737373' },
                            { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#38bdf8' },
                            { label: 'Done', value: done, color: '#22c55e' },
                        ].map(s => (
                            <div key={s.label} className="px-4 py-2 rounded-lg border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                <span className="text-xs" style={{ color: '#737373' }}>{s.label}: </span>
                                <span className="font-semibold text-sm" style={{ color: s.color }}>{s.value}</span>
                            </div>
                        ))}
                        {/* Progress */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: project.color || '#10b981' }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: project.color || '#10b981' }}>{progressPct}%</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1 rounded-lg border p-1" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        {['All', ...STATUS_OPTIONS].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                                style={{
                                    background: filterStatus === s ? '#10b981' : 'transparent',
                                    color: filterStatus === s ? '#fff' : '#737373'
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border p-1" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        {['All', 'P1', 'P2', 'P3'].map(p => (
                            <button key={p} onClick={() => setFilterPriority(p)}
                                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                                style={{
                                    background: filterPriority === p ? (PRIORITY_MAP[p]?.bg || '#10b981') : 'transparent',
                                    color: filterPriority === p ? (PRIORITY_MAP[p]?.color || '#fff') : '#737373'
                                }}>
                                {p === 'All' ? 'All Priority' : PRIORITY_MAP[p].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="rounded-xl border overflow-hidden" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                    {/* Header */}
                    <div className="grid px-5 py-3 border-b text-xs font-medium uppercase tracking-wider"
                        style={{ borderColor: '#2a2a2a', color: '#525252', gridTemplateColumns: '1fr 140px 110px 110px 110px 36px' }}>
                        <span>Task</span>
                        <span>Assignee</span>
                        <span>Due Date</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm" style={{ color: '#525252' }}>No tasks found</p>
                            <button onClick={() => setShowAddTask(true)}
                                className="mt-3 text-xs px-4 py-2 rounded-lg font-medium"
                                style={{ background: '#10b981', color: '#fff' }}>
                                Add Task
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: '#1f1f1f' }}>
                            {filteredTasks.map(task => {
                                const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.P2
                                const od = isOverdue(task.dueDate, task.status)
                                return (
                                    <div key={task.id}
                                        className="grid px-5 py-3.5 items-center hover:bg-white/[0.018] transition-colors group"
                                        style={{ gridTemplateColumns: '1fr 140px 110px 110px 110px 36px' }}>
                                        {/* Title + desc */}
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-medium truncate" style={{ color: '#ededed' }}>{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs mt-0.5 truncate" style={{ color: '#525252' }}>{task.description}</p>
                                            )}
                                        </div>
                                        {/* Assignee */}
                                        <div className="flex items-center gap-2">
                                            {task.assignee ? (
                                                <>
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                        style={{ background: '#242424', color: '#a3a3a3' }}>
                                                        {task.assignee[0].toUpperCase()}
                                                    </div>
                                                    <span className="text-xs truncate" style={{ color: '#a3a3a3' }}>{task.assignee}</span>
                                                </>
                                            ) : (
                                                <span className="text-xs" style={{ color: '#525252' }}>—</span>
                                            )}
                                        </div>
                                        {/* Due Date */}
                                        <div>
                                            <span className="text-xs" style={{ color: od ? '#ef4444' : '#737373' }}>
                                                {od ? '⚠ ' : ''}{formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                        {/* Priority */}
                                        <div>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ color: p.color, background: p.bg }}>
                                                {p.label}
                                            </span>
                                        </div>
                                        {/* Status dropdown */}
                                        <div>
                                            <StatusDropdown task={task} projectId={projectId} />
                                        </div>
                                        {/* Delete */}
                                        <div>
                                            <button
                                                onClick={() => handleDelete(task._id || task.id)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                style={{ color: '#737373' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#737373'}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {showInvite && <InviteModal orgId={currentOrg?.id} onClose={() => setShowInvite(false)} />}
            {showAddTask && (
                <AddTaskModal
                    projectId={projectId}
                    members={project?.members || []}
                    onClose={() => setShowAddTask(false)}
                    onAdded={() => { }}
                />
            )}
        </div>
    )
}
