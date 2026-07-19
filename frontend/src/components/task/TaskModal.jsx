import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { taskService } from '../../services/taskService'
import toast from 'react-hot-toast'

export const TaskModal = ({ task, onClose, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({
        title: task.title || '',
        status: task.status || 'Todo',
        priority: task.priority || 'P2',
        description: task.description || ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSave = async () => {
        try {
            setLoading(true)
            await taskService.updateTask(task.id || task._id, formData)
            toast.success('Task updated successfully')
            onUpdate()
            onClose()
        } catch (err) {
            toast.error('Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setLoading(true)
            await taskService.deleteTask(task.id || task._id)
            toast.success('Task deleted successfully')
            onDelete()
            onClose()
        } catch (err) {
            toast.error('Failed to delete task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-1 shadow-sm border border-brand-2/40 rounded-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-700 hover:text-gray-900 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Title</label>
                        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Task title" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-white/60 border border-brand-2/40 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-4/40 appearance-none"
                            >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full bg-white/60 border border-brand-2/40 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-4/40 appearance-none"
                            >
                                <option value="P1">P1</option>
                                <option value="P2">P2</option>
                                <option value="P3">P3</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-white/60 border border-brand-2/40 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-4/40 resize-none"
                            placeholder="Task description..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        Delete Task
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
