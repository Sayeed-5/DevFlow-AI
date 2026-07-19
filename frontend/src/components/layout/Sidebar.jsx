import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, FolderOpen, LogOut, ChevronDown,
    Plus, Building2, CheckSquare, ListChecks, X, Users
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useOrgStore } from '../../store/orgStore'
import toast from 'react-hot-toast'

// Inline create-org modal
const CreateOrgModal = ({ onClose }) => {
    const { user } = useAuthStore()
    const { addOrg, setCurrentOrg } = useOrgStore()
    const [form, setForm] = useState({ name: '', description: '', invites: '' })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return toast.error('Organization name required')
        setSaving(true)
        await new Promise(r => setTimeout(r, 500))
        const newOrg = {
            id: Date.now().toString(),
            name: form.name.trim(),
            description: form.description.trim(),
            createdBy: user?.email,
            members: [
                { id: user?.id || '1', email: user?.email, name: user?.name, role: 'owner' },
                ...form.invites.split(',').map(e => e.trim()).filter(Boolean)
                    .map(email => ({ id: Date.now().toString() + Math.random(), email, role: 'member' }))
            ],
            projects: [],
            createdAt: new Date().toISOString()
        }
        addOrg(newOrg)
        setCurrentOrg(newOrg)
        toast.success(`"${newOrg.name}" created!`)
        setSaving(false)
        onClose()
    }

    const inp = { background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#ededed', outline: 'none', width: '100%' }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
                style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold" style={{ color: '#ededed' }}>New Organization</h3>
                    <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#737373' }} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Name *</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Acme Corp" style={inp}
                            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Description</label>
                        <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="What does this org do?" style={inp}
                            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: '#a3a3a3' }}>
                            <Users className="w-3 h-3" /> Invite (comma-separated emails)
                        </label>
                        <input value={form.invites} onChange={e => setForm(p => ({ ...p, invites: e.target.value }))}
                            placeholder="john@co.com, sarah@co.com" style={inp}
                            onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    </div>
                    <button type="submit" disabled={saving}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1"
                        style={{ background: '#10b981', color: '#fff', opacity: saving ? 0.8 : 1 }}>
                        {saving
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                            : <><Plus className="w-4 h-4" /> Create</>}
                    </button>
                </form>
            </div>
        </div>
    )
}

export const Sidebar = () => {
    const { user, logout } = useAuthStore()
    const { orgs, currentOrg, setCurrentOrg, getProjectsForCurrentOrg, setCurrentProject } = useOrgStore()
    const navigate = useNavigate()
    const location = useLocation()
    const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
    const [showCreateOrg, setShowCreateOrg] = useState(false)

    const projects = getProjectsForCurrentOrg()

    const handleLogout = () => { logout(); navigate('/login') }

    const handleSwitchOrg = (org) => {
        setCurrentOrg(org)
        setOrgDropdownOpen(false)
        navigate('/dashboard')
    }

    const handleProjectClick = (project) => {
        setCurrentProject(project)
        navigate(`/project/${project.id}`)
    }

    const isProjectActive = (id) => location.pathname === `/project/${id}`

    return (
        <>
            <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col z-30"
                style={{ background: '#111111', borderRight: '1px solid #1f1f1f' }}>

                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#052e16' }}>
                        <CheckSquare className="w-4 h-4" style={{ color: '#10b981' }} />
                    </div>
                    <span className="font-bold text-base tracking-tight" style={{ color: '#ededed' }}>DevFlow</span>
                </div>

                {/* Org Selector */}
                <div className="px-3 mb-2">
                    {currentOrg ? (
                        <>
                            <button
                                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
                                style={{ background: '#1c1c1c', border: '1px solid #2a2a2a' }}
                            >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                                    style={{ background: '#052e16', color: '#10b981' }}>
                                    {currentOrg.name[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium truncate flex-1 text-left" style={{ color: '#ededed' }}>
                                    {currentOrg.name}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform"
                                    style={{ color: '#737373', transform: orgDropdownOpen ? 'rotate(180deg)' : '' }} />
                            </button>

                            {/* Org dropdown — list other orgs + create new */}
                            {orgDropdownOpen && (
                                <div className="mt-1 rounded-xl border overflow-hidden shadow-xl"
                                    style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                    {/* Other orgs */}
                                    {orgs.filter(o => o.id !== currentOrg.id).map(org => (
                                        <button key={org.id} onClick={() => handleSwitchOrg(org)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
                                            <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0"
                                                style={{ background: '#052e16', color: '#10b981' }}>
                                                {org.name[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm truncate" style={{ color: '#ededed' }}>{org.name}</span>
                                        </button>
                                    ))}

                                    {/* Divider only if other orgs exist */}
                                    {orgs.filter(o => o.id !== currentOrg.id).length > 0 && (
                                        <div className="h-px mx-3" style={{ background: '#2a2a2a' }} />
                                    )}

                                    {/* Create new org */}
                                    <button
                                        onClick={() => { setOrgDropdownOpen(false); setShowCreateOrg(true) }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
                                        <Plus className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                                        <span className="text-sm" style={{ color: '#10b981' }}>New Organization</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* No org selected — show create button */
                        <button onClick={() => setShowCreateOrg(true)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed text-sm transition-all"
                            style={{ borderColor: '#2a2a2a', color: '#737373' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#737373' }}>
                            <Plus className="w-3.5 h-3.5" /> Create Organization
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 overflow-y-auto space-y-0.5 pt-1">
                    <NavLink to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'font-medium' : 'hover:bg-white/5'}`
                        }
                        style={({ isActive }) => ({
                            color: isActive ? '#10b981' : '#a3a3a3',
                            background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent'
                        })}>
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        <span>Dashboard</span>
                    </NavLink>

                    {/* My Tasks */}
                    <NavLink to="/my-tasks"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'font-medium' : 'hover:bg-white/5'}`
                        }
                        style={({ isActive }) => ({
                            color: isActive ? '#10b981' : '#a3a3a3',
                            background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent'
                        })}>
                        <ListChecks className="w-4 h-4 shrink-0" />
                        <span>My Tasks</span>
                    </NavLink>

                    {/* Projects section */}
                    {currentOrg && (
                        <div className="pt-3">
                            <div className="flex items-center justify-between px-3 pb-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>Projects</p>
                                <button onClick={() => navigate('/project-select')}
                                    className="p-0.5 rounded transition-colors"
                                    style={{ color: '#525252' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#525252'}
                                    title="New Project">
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {projects.length === 0 ? (
                                <p className="px-3 py-1.5 text-xs" style={{ color: '#525252' }}>No projects yet</p>
                            ) : (
                                <div className="space-y-0.5">
                                    {projects.map(project => (
                                        <button key={project.id} onClick={() => handleProjectClick(project)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all"
                                            style={{
                                                background: isProjectActive(project.id) ? 'rgba(16,185,129,0.1)' : 'transparent',
                                                color: isProjectActive(project.id) ? '#10b981' : '#a3a3a3'
                                            }}
                                            onMouseEnter={e => { if (!isProjectActive(project.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                                            onMouseLeave={e => { if (!isProjectActive(project.id)) e.currentTarget.style.background = 'transparent' }}>
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: project.color || '#10b981' }} />
                                            <span className="truncate">{project.name}</span>
                                            <span className="ml-auto text-xs shrink-0" style={{ color: '#525252' }}>
                                                {project.tasks?.length || 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* User / Logout */}
                <div className="p-3 border-t" style={{ borderColor: '#1f1f1f' }}>
                    <div className="flex items-center gap-2.5 px-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: '#242424', color: '#a3a3a3' }}>
                            {(user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate leading-none" style={{ color: '#ededed' }}>{user?.name || 'User'}</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#525252' }}>{user?.email || ''}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                        style={{ color: '#737373' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#737373' }}>
                        <LogOut className="w-4 h-4" /><span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Create Org Modal (outside aside so it can be full-screen overlay) */}
            {showCreateOrg && <CreateOrgModal onClose={() => setShowCreateOrg(false)} />}
        </>
    )
}
