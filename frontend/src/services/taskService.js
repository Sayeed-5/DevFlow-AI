import api from './api'

export const taskService = {
  getTasksByProject: async (projectId) => {
    const { data } = await api.get(`/tasks?projectId=${projectId}`)
    return data
  },
  createTask: async (taskData) => {
    const { data } = await api.post('/tasks', taskData)
    return data
  },
  updateTask: async (id, taskData) => {
    const { data } = await api.patch(`/tasks/${id}`, taskData)
    return data
  },
  updateTaskStatus: async (id, status) => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status })
    return data
  },
  deleteTask: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`)
    return data
  }
}
