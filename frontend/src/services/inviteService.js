import api from './api'

export const inviteService = {
  sendInvites: async (orgId, emails, role = 'member') => {
    const { data } = await api.post('/invitations/send', { orgId, emails, role })
    return data
  },
  getInvitations: async (orgId) => {
    const { data } = await api.get(`/invitations/${orgId}`)
    return data.invitations
  },
  revokeInvitation: async (inviteId) => {
    const { data } = await api.delete(`/invitations/${inviteId}`)
    return data
  },
  acceptInvitation: async (token) => {
    const { data } = await api.get(`/invitations/accept/${token}`)
    return data
  }
}
