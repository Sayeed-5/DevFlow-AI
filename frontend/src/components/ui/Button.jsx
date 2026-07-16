import React from 'react'

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        ghost: 'text-neutral-400 hover:text-white hover:bg-white/5',
        danger: 'text-red-400 hover:text-white hover:bg-red-500/20'
    }

    return (
        <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}
