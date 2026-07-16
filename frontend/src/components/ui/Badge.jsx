import React from 'react'

export const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-white/10 text-white',
        P1: 'bg-red-500/10 text-red-400',
        P2: 'bg-amber-500/10 text-amber-400',
        P3: 'bg-green-500/10 text-green-400'
    }
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    )
}
