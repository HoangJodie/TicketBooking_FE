import axiosClient from './axiosClient'

const showtimeAPI = {
  createShowtime: (movieId, data) => {
    return axiosClient.post(`/api/v1/showtimes/movies/${movieId}`, data)
  },

  getShowtimesByMovie: (movieId) => {
    return axiosClient.get(`/api/v1/showtimes/movies/${movieId}`)
  }
}

export default showtimeAPI 