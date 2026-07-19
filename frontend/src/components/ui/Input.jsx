import React from 'react'

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`w-full bg-white/60 border border-brand-2/40 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-4/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        />
    )
})
Input.displayName = 'Input'
