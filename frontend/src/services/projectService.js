import api from './api'

export const projectService = {
  createProject: async (orgId, projectData) => {
    const { data } = await api.post(`/organizations/${orgId}/projects`, projectData)
    return data.project
  },
  getProjects: async (orgId) => {
    const { data } = await api.get(`/organizations/${orgId}/projects`)
    return data.projects
  },
  getProject: async (orgId, projectId) => {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}`)
    return data // { project, tasks }
  },
  updateProject: async (orgId, projectId, updateData) => {
    const { data } = await api.put(`/organizations/${orgId}/projects/${projectId}`, updateData)
    return data.project
  },
  deleteProject: async (orgId, projectId) => {
    const { data } = await api.delete(`/organizations/${orgId}/projects/${projectId}`)
    return data
  }
}
