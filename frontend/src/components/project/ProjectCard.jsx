import React from 'react'
import { Link } from 'react-router-dom'
import { Folder } from 'lucide-react'

export const ProjectCard = ({ project }) => {
    // Gracefully handle id assuming _id for mongo or id for sql
    const projectId = project.id || project._id

    return (
        <Link to={`/project/${projectId}`} className="block">
            <div className="bg-brand-1 shadow-sm border border-brand-2/40 rounded-xl p-5 hover:border-brand-4/50 transition-colors h-full">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-brand-4/40 rounded-lg">
                        <Folder className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{project.name || 'Untitled Project'}</h3>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                    {project.summary || 'No description available for this project.'}
                </p>
            </div>
        </Link>
    )
}
