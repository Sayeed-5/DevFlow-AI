import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderPlus, Plus } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { useOrgStore } from '../store/orgStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const COLORS = [
    { value: '#10b981', bg: '#052e16' },
    { value: '#38bdf8', bg: '#0c1a2e' },
    { value: '#f59e0b', bg: '#1c1200' },
    { value: '#ef4444', bg: '#2d0a0a' },
    { value: '#a855f7', bg: '#1a0a2e' },
    { value: '#fb923c', bg: '#231200' },
]

export const CreateProjectPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { currentOrg, addProjectToOrg, setCurrentProject } = useOrgStore()
    const [form, setForm] = useState({ name: '', description: '', color: COLORS[0].value, teamSize: 'Solo' })
    const [loading, setLoading] = useState(false)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return toast.error('Project name is required')
        if (!currentOrg) return toast.error('No organization selected')
        setLoading(true)
        await new Promise(r => setTimeout(r, 400))
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
        setLoading(false)
        navigate(`/project/${newProject.id}`)
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            <Sidebar />
            <Navbar title="New Project" />

            <main className="ml-[240px] pt-14 p-8">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate('/project-select')}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#737373' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ededed'}
                            onMouseLeave={e => e.currentTarget.style.color = '#737373'}>
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h2 className="text-xl font-bold" style={{ color: '#ededed' }}>New Project</h2>
                    </div>

                    <form onSubmit={handleCreate} className="rounded-2xl border p-6 space-y-5"
                        style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>

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
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Team Size</label>
                            <select
                                value={form.teamSize}
                                onChange={e => setForm(p => ({ ...p, teamSize: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none appearance-none"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}>
                                <option>Solo</option>
                                <option>2-5 people</option>
                                <option>6-15 people</option>
                                <option>15+ people</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-2" style={{ color: '#a3a3a3' }}>Color Tag</label>
                            <div className="flex items-center gap-3">
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, color: c.value }))}
                                        className="w-7 h-7 rounded-full border-2 transition-all"
                                        style={{
                                            background: c.value,
                                            borderColor: form.color === c.value ? '#ededed' : 'transparent',
                                            transform: form.color === c.value ? 'scale(1.2)' : 'scale(1)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: loading ? '#059669' : '#10b981', color: '#fff' }}>
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                            ) : (
                                <><FolderPlus className="w-4 h-4" /> Create Project</>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
