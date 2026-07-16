import React from 'react'
import { Loader2 } from 'lucide-react'

export const Spinner = ({ className = '' }) => {
    return <Loader2 className={`animate-spin ${className}`} />
}
