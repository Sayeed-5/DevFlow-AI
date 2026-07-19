import api from './api'

export const taskService = {
  createTask: async (projectId, taskData) => {
    const { data } = await api.post(`/projects/${projectId}/tasks`, taskData)
    return data.task
  },
  getTasksByProject: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/tasks`)
    return data.tasks
  },
  updateTask: async (projectId, taskId, updateData) => {
    const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, updateData)
    return data.task
  },
  deleteTask: async (projectId, taskId) => {
    const { data } = await api.delete(`/projects/${projectId}/tasks/${taskId}`)
    return data
  },
  getMyTasks: async () => {
    const { data } = await api.get('/tasks/my-tasks')
    return data.tasks
  },
  getDashboardStats: async (orgId) => {
    const { data } = await api.get(`/tasks/stats?orgId=${orgId}`)
    return data.stats
  },
  getRecentTasks: async (orgId) => {
    const { data } = await api.get(`/tasks/recent?orgId=${orgId}`)
    return data.tasks
  }
}
