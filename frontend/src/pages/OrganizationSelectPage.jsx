import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, ChevronDown, Check, X, Users } from 'lucide-react'
import { useOrgStore } from '../store/orgStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export const OrganizationSelectPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { orgs, addOrg, setCurrentOrg } = useOrgStore()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [form, setForm] = useState({ name: '', description: '', invites: '' })
    const [creating, setCreating] = useState(false)

    const handleSelectOrg = (org) => {
        setCurrentOrg(org)
        setDropdownOpen(false)
        navigate('/project-select')
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return toast.error('Organization name required')
        setCreating(true)
        await new Promise(r => setTimeout(r, 600))
        const newOrg = {
            id: Date.now().toString(),
            name: form.name.trim(),
            description: form.description.trim(),
            createdBy: user?.email,
            members: [
                { id: user?.id || '1', email: user?.email, name: user?.name, role: 'owner' },
                ...form.invites.split(',')
                    .map(e => e.trim())
                    .filter(Boolean)
                    .map(email => ({ id: Date.now().toString() + Math.random(), email, role: 'member' }))
            ],
            projects: [],
            createdAt: new Date().toISOString()
        }
        addOrg(newOrg)
        setCurrentOrg(newOrg)
        toast.success(`"${newOrg.name}" created!`)
        setCreating(false)
        setShowCreateForm(false)
        navigate('/project-select')
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
            <div className="w-full max-w-md px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#052e16' }}>
                        <Building2 className="w-7 h-7" style={{ color: '#10b981' }} />
                    </div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: '#ededed' }}>Select Organization</h1>
                    <p className="text-sm" style={{ color: '#737373' }}>
                        Welcome back, {user?.name || 'there'}! Choose your workspace.
                    </p>
                </div>

                {/* Dropdown Select */}
                {orgs.length > 0 && (
                    <div className="mb-4 relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                            style={{
                                background: '#1c1c1c',
                                borderColor: dropdownOpen ? '#10b981' : '#2a2a2a',
                                color: '#ededed'
                            }}
                        >
                            <span className="flex items-center gap-3">
                                <Building2 className="w-5 h-5" style={{ color: '#10b981' }} />
                                <span className="font-medium">Choose an organization</span>
                            </span>
                            <ChevronDown
                                className="w-4 h-4 transition-transform"
                                style={{ color: '#737373', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-20 shadow-2xl"
                                style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                                {orgs.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => handleSelectOrg(org)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5"
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                                            style={{ background: '#052e16', color: '#10b981' }}>
                                            {org.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate" style={{ color: '#ededed' }}>{org.name}</p>
                                            <p className="text-xs truncate" style={{ color: '#737373' }}>
                                                {org.members?.length || 1} member{(org.members?.length || 1) !== 1 ? 's' : ''} • {org.projects?.length || 0} project{(org.projects?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <Check className="w-4 h-4 shrink-0 opacity-0" style={{ color: '#10b981' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Divider */}
                {orgs.length > 0 && (
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
                        <span className="text-xs" style={{ color: '#525252' }}>or</span>
                        <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
                    </div>
                )}

                {/* Create New Org button / form */}
                {!showCreateForm ? (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed font-medium text-sm transition-all"
                        style={{ borderColor: '#2a2a2a', color: '#a3a3a3' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#a3a3a3' }}
                    >
                        <Plus className="w-4 h-4" />
                        {orgs.length === 0 ? 'Create your first organization' : 'Create new organization'}
                    </button>
                ) : (
                    <form onSubmit={handleCreate} className="rounded-xl border p-5 space-y-4" style={{ background: '#1c1c1c', borderColor: '#2a2a2a' }}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm" style={{ color: '#ededed' }}>New Organization</h3>
                            <button type="button" onClick={() => setShowCreateForm(false)}>
                                <X className="w-4 h-4" style={{ color: '#737373' }} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Organization Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Acme Corp"
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a3a3a3' }}>Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="What does this org do?"
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: '#a3a3a3' }}>
                                <Users className="w-3.5 h-3.5" /> Invite Members (comma-separated emails)
                            </label>
                            <input
                                value={form.invites}
                                onChange={e => setForm(p => ({ ...p, invites: e.target.value }))}
                                placeholder="john@co.com, sarah@co.com"
                                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                                style={{ background: '#242424', borderColor: '#2a2a2a', color: '#ededed' }}
                                onFocus={e => e.target.style.borderColor = '#10b981'}
                                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            style={{ background: creating ? '#059669' : '#10b981', color: '#fff', opacity: creating ? 0.8 : 1 }}
                        >
                            {creating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> Create Organization
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* No org yet + no form */}
                {orgs.length === 0 && !showCreateForm && (
                    <p className="text-center text-xs mt-4" style={{ color: '#525252' }}>
                        You're not part of any organization yet.
                    </p>
                )}
            </div>
        </div>
    )
}
