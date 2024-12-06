import axiosClient from "./axiosClient";

const movieAPI = {
  getMovies: () => {
    return axiosClient.get("/movies");
  },

  getMovieById: (id) => {
    return axiosClient.get(`/movies/${id}`);
  },

  getShowtimes: (movieId) => {
    return axiosClient.get(`/movies/${movieId}/showtimes`);
  },

  bookTickets: (data) => {
    return axiosClient.post("/bookings", data);
  },
};

export default movieAPI;
