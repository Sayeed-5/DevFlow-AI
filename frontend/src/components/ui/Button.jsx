import React from 'react'

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
        primary: 'bg-brand-4 text-gray-900 hover:bg-brand-4/80 text-gray-900',
        ghost: 'text-gray-700 hover:text-gray-900 hover:bg-brand-2/20',
        danger: 'text-red-400 hover:text-gray-900 hover:bg-red-500/20'
    }

    return (
        <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}
