import React from 'react'
import { useAuthStore } from '../../store/authStore'

export const Navbar = ({ title }) => {
    const { user } = useAuthStore()

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.substring(0, 2).toUpperCase()
    }

    return (
        <header className="fixed top-0 left-[220px] right-0 h-14 bg-[#0f0f0f] border-b border-white/8 z-10 flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-medium text-white">
                    {getInitials(user?.name)}
                </div>
            </div>
        </header>
    )
}
