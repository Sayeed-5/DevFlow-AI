import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useOrgStore } from '../store/orgStore'
import { taskService } from '../services/taskService'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { CalendarDays, CheckCircle2, Clock, FolderOpen, TrendingUp, Plus } from 'lucide-react'

const PRIORITY_MAP = {
    P1: { label: 'High', color: '#f87171', bg: '#2d0a0a' },
    P2: { label: 'Medium', color: '#fbbf24', bg: '#1c1200' },
    P3: { label: 'Low', color: '#34d399', bg: '#052e16' },
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null
const isOverdue = (d) => d && new Date(d) < new Date()

export const DashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { currentOrg, projects, setCurrentProject } = useOrgStore()
    const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, Todo: 0, 'In Progress': 0, Done: 0, overdue: 0 })
    const [recentTasks, setRecentTasks] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!currentOrg) return
        setLoading(true)
        const orgId = currentOrg._id || currentOrg.id
        Promise.all([
            taskService.getDashboardStats(orgId),
            taskService.getRecentTasks(orgId)
        ])
            .then(([s, rt]) => { setStats(s); setRecentTasks(rt) })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [currentOrg])

    const h = new Date().getHours()
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            <Sidebar />
            <Navbar title="Dashboard" />

            <main className="ml-[240px] pt-14 p-8">
                {/* Greeting */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-0.5" style={{ color: '#ededed' }}>
                        {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
                    </h2>
                    {currentOrg
                        ? <p className="text-sm" style={{ color: '#737373' }}>Here's what's happening in <span style={{ color: '#10b981' }}>{currentOrg.name}</span></p>
                        : <p className="text-sm" style={{ color: '#737373' }}>Create or select an organization from the sidebar to get started.</p>
                    }
                </div>

                {!currentOrg && (
                    <div className="rounded-2xl border p-10 text-center" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#052e16' }}>
                            <FolderOpen className="w-6 h-6" style={{ color: '#10b981' }} />
                        </div>
                        <p className="font-semibold mb-1" style={{ color: '#ededed' }}>No organization selected</p>
                        <p className="text-sm mb-5" style={{ color: '#737373' }}>Use the sidebar to create or select an organization.</p>
                    </div>
                )}

                {currentOrg && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: '#10b981', bg: '#052e16' },
                                { label: 'Total Tasks', value: stats.totalTasks, icon: TrendingUp, color: '#38bdf8', bg: '#0c1a2e' },
                                { label: 'In Progress', value: stats['In Progress'], icon: Clock, color: '#f59e0b', bg: '#1c1200' },
                                { label: 'Overdue', value: stats.overdue, icon: CalendarDays, color: '#ef4444', bg: '#2d0a0a' },
                            ].map(stat => (
                                <div key={stat.label} className="rounded-xl border p-4" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-medium" style={{ color: '#737373' }}>{stat.label}</p>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: '#ededed' }}>
                                        {loading ? '-' : stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Upcoming Tasks */}
                            <div className="lg:col-span-3 rounded-xl border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#2a2a2a' }}>
                                    <h3 className="font-semibold text-sm" style={{ color: '#ededed' }}>Upcoming Tasks</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#242424', color: '#737373' }}>
                                        {recentTasks.length} pending
                                    </span>
                                </div>
                                {loading ? (
                                    <div className="py-12 text-center text-sm" style={{ color: '#737373' }}>Loading tasks...</div>
                                ) : recentTasks.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
                                        <p className="text-sm" style={{ color: '#737373' }}>All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: '#1f1f1f' }}>
                                        {recentTasks.map(task => {
                                            const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.P2
                                            const due = formatDate(task.dueDate)
                                            const od = isOverdue(task.dueDate)
                                            const projColor = task.project?.color || '#10b981'
                                            return (
                                                <div key={task._id}
                                                    onClick={() => { setCurrentProject(task.project); navigate(`/project/${task.project._id}`) }}
                                                    className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: projColor }} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate" style={{ color: '#ededed' }}>{task.title}</p>
                                                        <p className="text-xs mt-0.5" style={{ color: '#525252' }}>{task.project?.name || 'Unknown'}</p>
                                                    </div>
                                                    {task.assignee && (
                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                            style={{ background: '#242424', color: '#737373' }}>
                                                            {(task.assignee.name || task.assignee.email)[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                                                        style={{ color: p.color, background: p.bg }}>{p.label}</span>
                                                    {due && (
                                                        <span className="text-xs shrink-0" style={{ color: od ? '#ef4444' : '#525252' }}>
                                                            {od ? '⚠ ' : ''}{due}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Projects mini list */}
                            <div className="lg:col-span-2 rounded-xl border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#2a2a2a' }}>
                                    <h3 className="font-semibold text-sm" style={{ color: '#ededed' }}>Projects</h3>
                                    <button onClick={() => navigate('/project-select')}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ background: '#242424', color: '#737373' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#242424'; e.currentTarget.style.color = '#737373' }}>
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {projects.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <FolderOpen className="w-7 h-7 mx-auto mb-2" style={{ color: '#525252' }} />
                                        <p className="text-sm mb-3" style={{ color: '#737373' }}>No projects yet</p>
                                        <button onClick={() => navigate('/project-select')} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                            style={{ background: '#10b981', color: '#fff' }}>Create Project</button>
                                    </div>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        {projects.map(proj => {
                                            const total = proj.taskStats?.total || 0
                                            const done = proj.taskStats?.Done || 0
                                            const pct = total > 0 ? Math.round((done / total) * 100) : 0
                                            return (
                                                <button key={proj._id}
                                                    onClick={() => { setCurrentProject(proj); navigate(`/project/${proj._id}`) }}
                                                    className="w-full text-left px-3 py-3 rounded-xl transition-all"
                                                    style={{ background: '#242424' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#242424'}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: proj.color || '#10b981' }} />
                                                        <span className="text-sm font-medium truncate" style={{ color: '#ededed' }}>{proj.name}</span>
                                                        <span className="ml-auto text-xs" style={{ color: proj.color || '#10b981' }}>{pct}%</span>
                                                    </div>
                                                    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1c1c1c' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: proj.color || '#10b981' }} />
                                                    </div>
                                                    <p className="text-xs mt-1.5" style={{ color: '#525252' }}>{total} tasks • {proj.members?.length || 1} members</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
