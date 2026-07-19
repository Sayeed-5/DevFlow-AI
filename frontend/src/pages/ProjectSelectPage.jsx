import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Plus, X, ArrowLeft, CalendarDays, Users } from 'lucide-react'
import { useOrgStore } from '../store/orgStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const COLORS = [
    { label: 'Emerald', value: '#10b981', bg: '#052e16' },
    { label: 'Blue', value: '#38bdf8', bg: '#0c1a2e' },
    { label: 'Amber', value: '#f59e0b', bg: '#1c1200' },
    { label: 'Rose', value: '#ef4444', bg: '#2d0a0a' },
    { label: 'Purple', value: '#a855f7', bg: '#1a0a2e' },
    { label: 'Orange', value: '#fb923c', bg: '#231200' },
]

export const ProjectSelectPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { currentOrg, addProjectToOrg, setCurrentProject, getProjectsForCurrentOrg, setCurrentOrg, clearOrg } = useOrgStore()
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({ name: '', description: '', color: COLORS[0].value, teamSize: 'Solo' })

    const projects = getProjectsForCurrentOrg()

    const handleSelectProject = (project) => {
        setCurrentProject(project)
        navigate(`/project/${project.id}`)
    }

    const handleCreateProject = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return toast.error('Project name required')
        setCreating(true)
        await new Promise(r => setTimeout(r, 500))
        const newProject = {
            id: Date.now().toString(),
            orgId: currentOrg.id,
            name: form.name.trim(),
            description: form.description.trim(),
            color: form.color,
            teamSize: form.teamSize,
            tasks: [],
            members: currentOrg.members || [],
            createdAt: new Date().toISOString(),
            createdBy: user?.email
        }
        addProjectToOrg(newProject)
        setCurrentProject(newProject)
        toast.success(`Project "${newProject.name}" created!`)
        setCreating(false)
        setShowCreate(false)
        navigate(`/project/${newProject.id}`)
    }

    const handleSwitchOrg = () => {
        clearOrg()
        navigate('/org-select')
    }

    if (!currentOrg) {
        navigate('/org-select')
        return null
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            {/* Top bar */}
            <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#1f1f1f', background: '#111111' }}>
                <div className="flex items-center gap-3">
                    <button onClick={handleSwitchOrg} className="p-2 rounded-lg transition-colors" style={{ color: '#737373' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ededed'}
                        onMouseLeave={e => e.currentTarget.style.color = '#737373'}>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                            style={{ background: '#052e16', color: '#10b981' }}>
                            {currentOrg.name[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-none" style={{ color: '#ededed' }}>{currentOrg.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#525252' }}>{currentOrg.members?.length || 1} member{(currentOrg.members?.length || 1) !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: '#10b981', color: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                >
                    <Plus className="w-4 h-4" /> New Project
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-xl font-bold mb-1" style={{ color: '#ededed' }}>Select a Project</h1>
                    <p className="text-sm" style={{ color: '#737373' }}>Pick a project to open or create a new one.</p>
                </div>

                {/* Projects list */}
                {projects.length === 0 && !showCreate ? (
                    <div className="text-center py-16 rounded-2xl border" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: '#242424' }}>
                            <FolderOpen className="w-6 h-6" style={{ color: '#525252' }} />
                        </div>
                        <p className="font-medium mb-1" style={{ color: '#ededed' }}>No projects yet</p>
                        <p className="text-sm mb-5" style={{ color: '#737373' }}>Create your first project to get started.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
                            style={{ background: '#10b981', color: '#fff' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                        >
                            <Plus className="w-4 h-4" /> Create Project
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {projects.map(project => {
                            const total = project.tasks?.length || 0
                            const done = project.tasks?.filter(t => t.status === 'Done').length || 0
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0
                            return (
                                <button
                                    key={project.id}
                                    onClick={() => handleSelectProject(project)}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all group"
                                    style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = project.color; e.currentTarget.style.background = '#242424' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#1c1c1c' }}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                                        style={{ background: project.color + '22', color: project.color }}>
                                        {project.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm" style={{ color: '#ededed' }}>{project.name}</p>
                                        {project.description && (
                                            <p className="text-xs truncate mt-0.5" style={{ color: '#737373' }}>{project.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
                                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: project.color }} />
                                            </div>
                                            <span className="text-xs shrink-0" style={{ color: '#737373' }}>{pct}%</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs" style={{ color: '#525252' }}>{total} tasks</p>
                                        <p className="text-xs mt-1" style={{ color: '#525252' }}>{project.members?.length || 1} members</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Create form */}
                {showCreate && (
                    <div className="mt-6 rounded-2xl border p-6 space-y-4" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold" style={{ color: '#ededed' }}>Create New Project</h3>
                            <button onClick={() => setShowCreate(false)}>
                                <X className="w-4 h-4" style={{ color: '#737373' }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Project Name *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Website Redesign"
                                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                                    style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief project description..."
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                                    style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Team Size</label>
                                    <select
                                        value={form.teamSize}
                                        onChange={e => setForm(p => ({ ...p, teamSize: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none appearance-none"
                                        style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                    >
                                        <option>Solo</option>
                                        <option>2-5 people</option>
                                        <option>6-15 people</option>
                                        <option>15+ people</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Color Tag</label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, color: c.value }))}
                                                className="w-6 h-6 rounded-full border-2 transition-all"
                                                style={{
                                                    background: c.value,
                                                    borderColor: form.color === c.value ? '#ededed' : 'transparent',
                                                    transform: form.color === c.value ? 'scale(1.2)' : 'scale(1)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                                style={{ background: '#10b981', color: '#fff', opacity: creating ? 0.8 : 1 }}
                            >
                                {creating ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                                ) : (
                                    <><Plus className="w-4 h-4" /> Create Project</>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
