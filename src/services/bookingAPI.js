import axiosClient from './axiosClient'

const bookingAPI = {
  getShowtimeSeats: async (showtimeId) => {
    if (!showtimeId) throw new Error('Showtime ID is required')
    
    try {
      const response = await axiosClient.get(`/api/v1/bookings/showtimes/${showtimeId}/seats`)
      return response
    } catch (error) {
      console.error('Error getting seats:', error)
      throw error
    }
  },

  initiateBooking: async (data) => {
    try {
      const { showtimeId, seatIds } = data
      if (!showtimeId || !seatIds?.length) {
        throw new Error('Missing required data')
      }

      const requestData = {
        showtimeId: Number(showtimeId),
        seatIds: seatIds.map(id => Number(id))
      }
      
      console.log('Request data:', requestData)

      const response = await axiosClient.post(
        `/api/v1/bookings/initiate-booking`, 
        requestData
      )

      console.log('Response:', {
        status: response.status,
        data: response.data
      })

      return response
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      })
      throw error
    }
  },

  updateSelectedSeats: async (data) => {
    try {
      const { showtimeId, seatIds } = data
      if (!showtimeId || !Array.isArray(seatIds)) {
        throw new Error('Missing required data')
      }

      const response = await axiosClient.put(`/api/v1/bookings/update-selected-seats`, {
        showtimeId: Number(showtimeId),
        seatIds: seatIds.map(id => Number(id))
      })

      return response
    } catch (error) {
      console.error('Error updating seats:', error)
      throw error
    }
  },

  cancelSeat: async (data) => {
    try {
      const { showtimeId, seatId } = data
      if (!showtimeId || !seatId) {
        throw new Error('Missing required data')
      }

      const response = await axiosClient.post(`/api/v1/bookings/cancel-seat`, {
        showtimeId: Number(showtimeId),
        seatId: Number(seatId)
      })
      return response
    } catch (error) {
      console.error('Error canceling seat:', error)
      throw error
    }
  },

  getBookingConfirmation: async (data) => {
    try {
      const { showtimeId, seatIds } = data
      if (!showtimeId || !seatIds) {
        throw new Error('Missing required data')
      }

      const seatIdsParam = Array.isArray(seatIds) ? seatIds.join(',') : seatIds

      const response = await axiosClient.get('/api/v1/bookings/confirm', {
        params: {
          showtimeId: Number(showtimeId),
          seatIds: seatIdsParam
        }
      })

      return response
    } catch (error) {
      console.error('Error getting booking confirmation:', {
        message: error.message,
        response: error.response?.data
      })
      throw error
    }
  }
}

export default bookingAPI