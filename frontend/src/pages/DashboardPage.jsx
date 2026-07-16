import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { ProjectCard } from '../components/project/ProjectCard'
import { projectService } from '../services/projectService'
import toast from 'react-hot-toast'

export const DashboardPage = () => {
    const [projects, setProjects] = useState([])
    const [stats, setStats] = useState({ totalProjects: 0, activeTasks: 0, completedTasks: 0 })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, statsData] = await Promise.all([
                    projectService.getProjects(),
                    projectService.getStats()
                ])
                setProjects(projectsData || [])
                setStats(statsData || { totalProjects: 0, activeTasks: 0, completedTasks: 0 })
            } catch (err) {
                toast.error('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Sidebar />
            <Navbar title="Dashboard" />

            <main className="ml-[220px] pt-14 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <Button onClick={() => navigate('/projects/create')}>
                        New Project
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                        <p className="text-sm text-neutral-400 mb-1">Total Projects</p>
                        <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                        <p className="text-sm text-neutral-400 mb-1">Active Tasks</p>
                        <p className="text-3xl font-bold text-white">{stats.activeTasks}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                        <p className="text-sm text-neutral-400 mb-1">Completed Tasks</p>
                        <p className="text-3xl font-bold text-white">{stats.completedTasks}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Your Projects</h3>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 h-32 animate-pulse"></div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded-xl">
                            <p className="text-neutral-400 mb-4">No projects yet</p>
                            <Button onClick={() => navigate('/projects/create')}>Create your first project</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => (
                                <ProjectCard key={project.id || project._id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
