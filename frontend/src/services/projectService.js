import api from './api'

export const projectService = {
  getProjects: async () => {
    const { data } = await api.get('/projects')
    return data
  },
  getStats: async () => {
    const { data } = await api.get('/projects/stats')
    return data
  },
  analyzeIdea: async (ideaText, type, teamSize) => {
    const { data } = await api.post('/projects/analyze', { ideaText, type, teamSize })
    return data
  },
  createProject: async (projectData) => {
    const { data } = await api.post('/projects', projectData)
    return data
  },
  getProjectById: async (id) => {
    const { data } = await api.get(`/projects/${id}`)
    return data
  }
}
