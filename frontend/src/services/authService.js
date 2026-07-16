import api from './api'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data // { user, token }
  },
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    return data
  }
}
