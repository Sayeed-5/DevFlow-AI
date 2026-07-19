import api from './api'

export const orgService = {
  createOrg: async (orgData) => {
    const { data } = await api.post('/organizations', orgData)
    return data.org
  },
  getMyOrgs: async () => {
    const { data } = await api.get('/organizations')
    return data.orgs
  },
  getOrg: async (orgId) => {
    const { data } = await api.get(`/organizations/${orgId}`)
    return data.org
  },
  updateOrg: async (orgId, updateData) => {
    const { data } = await api.put(`/organizations/${orgId}`, updateData)
    return data.org
  },
  deleteOrg: async (orgId) => {
    const { data } = await api.delete(`/organizations/${orgId}`)
    return data
  },
  getMembers: async (orgId) => {
    const { data } = await api.get(`/organizations/${orgId}/members`)
    return data.members
  },
  removeMember: async (orgId, userId) => {
    const { data } = await api.delete(`/organizations/${orgId}/members/${userId}`)
    return data
  },
  changeMemberRole: async (orgId, userId, role) => {
    const { data } = await api.put(`/organizations/${orgId}/members/${userId}/role`, { role })
    return data.org
  }
}
