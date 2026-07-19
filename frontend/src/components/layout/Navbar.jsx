import React from 'react'
import { useOrgStore } from '../../store/orgStore'

export const Navbar = ({ title }) => {
    const { currentOrg, currentProject } = useOrgStore()

    return (
        <header
            className="fixed top-0 left-[240px] right-0 h-14 z-20 flex items-center justify-between px-6"
            style={{ background: '#0a0a0a', borderBottom: '1px solid #1f1f1f' }}
        >
            <h1 className="text-sm font-semibold truncate" style={{ color: '#ededed' }}>{title}</h1>

            {/* Breadcrumb */}
            {currentOrg && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#525252' }}>
                    <span style={{ color: '#737373' }}>{currentOrg.name}</span>
                    {currentProject && (
                        <>
                            <span>/</span>
                            <span style={{ color: currentProject.color || '#10b981' }}>{currentProject.name}</span>
                        </>
                    )}
                </div>
            )}
        </header>
    )
}
