import axiosClient from './axiosClient'

const roomAPI = {
  getRooms: () => {
    const token = localStorage.getItem('token')
    return axiosClient.get('/api/v1/rooms', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

export default roomAPI 