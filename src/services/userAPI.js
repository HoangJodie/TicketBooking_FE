import axiosClient from './axiosClient'

const userAPI = {
  login: async (data) => {
    try {
      console.log('API login request:', data)
      const response = await axiosClient.post('/auth/login', data)
      if (response && response.accessToken) {
        console.log('Access token received:', response.accessToken)
      } else {
        console.error('Invalid response structure:', response)
      }
      return response
    } catch (error) {
      console.error('API login error:', error)
      throw error
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      console.log('Sending logout request with token:', token)
      const response = await axiosClient.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Logout response:', response)

      localStorage.removeItem('token')
      return response
    } catch (error) {
      console.error('Logout API error:', error)
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
