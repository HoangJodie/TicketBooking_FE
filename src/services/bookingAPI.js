import axiosClient from './axiosClient'

const bookingAPI = {
  getShowtimeSeats: async (showtimeId) => {
    if (!showtimeId) throw new Error('Showtime ID is required')
    
    try {
      console.log('Making request to:', `/api/v1/bookings/showtimes/${showtimeId}/seats`)
      const response = await axiosClient.get(`/api/v1/bookings/showtimes/${showtimeId}/seats`)
      console.log('API Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  }
}

export default bookingAPI 