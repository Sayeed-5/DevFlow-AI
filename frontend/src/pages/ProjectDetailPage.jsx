import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { TaskCard } from '../components/task/TaskCard'
import { TaskModal } from '../components/task/TaskModal'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'
import toast from 'react-hot-toast'

export const ProjectDetailPage = () => {
    const { projectId } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTask, setSelectedTask] = useState(null)
    const [isCreatingTask, setIsCreatingTask] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskCol, setNewTaskCol] = useState('Todo')

    const fetchProjectData = async () => {
        try {
            const [projData, taskData] = await Promise.all([
                projectService.getProjectById(projectId),
                taskService.getTasksByProject(projectId)
            ])
            setProject(projData)
            setTasks(taskData || [])
        } catch (err) {
            toast.error('Failed to load project details')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjectData()
    }, [projectId])

    const handleCreateTask = async (status) => {
        if (!newTaskTitle.trim()) return
        try {
            await taskService.createTask({
                projectId,
                title: newTaskTitle,
                status,
                priority: 'P2'
            })
            toast.success('Task added')
            setNewTaskTitle('')
            setIsCreatingTask(false)
            fetchProjectData()
        } catch (err) {
            toast.error('Failed to create task')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const columns = ['Todo', 'In Progress', 'Done']
    const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Sidebar />
            <Navbar title={project?.name || 'Project Details'} />

            <main className="ml-[220px] pt-14 p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-white">{project?.name || 'Untitled Project'}</h2>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2">
                            <span className="text-sm text-neutral-400 mr-2">Total tasks:</span>
                            <span className="font-semibold text-white">{tasks.length}</span>
                        </div>
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2">
                            <span className="text-sm text-neutral-400 mr-2">In Progress:</span>
                            <span className="font-semibold text-amber-400">{getTasksByStatus('In Progress').length}</span>
                        </div>
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2">
                            <span className="text-sm text-neutral-400 mr-2">Completed:</span>
                            <span className="font-semibold text-green-400">{getTasksByStatus('Done').length}</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-6">Tasks</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {columns.map(status => (
                        <div key={status} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col min-h-[400px]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-white">{status}</h4>
                                <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                                    {getTasksByStatus(status).length}
                                </span>
                            </div>

                            <div className="flex-1 space-y-3 mb-4">
                                {getTasksByStatus(status).map(task => (
                                    <TaskCard
                                        key={task.id || task._id}
                                        task={task}
                                        onClick={(t) => setSelectedTask(t)}
                                    />
                                ))}
                            </div>

                            {isCreatingTask && newTaskCol === status ? (
                                <div className="space-y-2 mt-auto">
                                    <input
                                        autoFocus
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(status)}
                                        placeholder="Task title..."
                                        className="w-full bg-[#242424] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleCreateTask(status)} className="flex-1 py-1 text-xs">Add</Button>
                                        <Button variant="ghost" onClick={() => setIsCreatingTask(false)} className="flex-1 py-1 text-xs">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setIsCreatingTask(true); setNewTaskCol(status); setNewTaskTitle(''); }}
                                    className="w-full py-2.5 mt-auto flex items-center justify-center gap-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={fetchProjectData}
                    onDelete={fetchProjectData}
                />
            )}
        </div>
    )
}
