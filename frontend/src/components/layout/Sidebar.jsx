import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Sparkles, LayoutDashboard, Plus, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Sidebar = () => {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
            ? 'bg-indigo-500/10 text-indigo-400'
            : 'text-neutral-400 hover:text-white hover:bg-white/5'
        }`

    return (
        <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#111111] border-r border-white/8 flex flex-col">
            <div className="flex items-center gap-2 p-5 pb-6">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <span className="font-bold text-lg text-white">PlanAI</span>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/projects/create" className={linkClass}>
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </NavLink>
            </nav>

            <div className="p-4 border-t border-white/8">
                <div className="mb-4 px-2">
                    <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    <span>LogOut</span>
                </button>
            </div>
        </aside>
    )
}
