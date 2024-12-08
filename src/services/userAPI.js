import axiosClient from './axiosClient'

const userAPI = {
  login: async (data) => {
    try {
      console.log('Sending login request with data:', data)
      const response = await axiosClient.post('/auth/login', {
        email: data.email,
        password: data.password
      })
      return response
    } catch (error) {
      console.error('API login error:', error.response?.data)
      throw error
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await axiosClient.post('/auth/logout')
      localStorage.removeItem('token')
      return response
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        localStorage.removeItem('token')
      }
      throw error
    }
  },

  getStatus: () => {
    return axiosClient.get('/auth/status')
  },

  getUserById: (id) => {
    return axiosClient.get(`/users/${id}`)
  },

  register: (data) => {
    return axiosClient.post('/users/register', data)
  },

  getProfile: () => {
    return axiosClient.get('/users/profile')
  }
}

export default userAPI
