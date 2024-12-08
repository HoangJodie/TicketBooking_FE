import axiosClient from "./axiosClient";

const movieAPI = {
  getMovies: (params = {}) => {
    return axiosClient.get('/api/v1/movies', {
      params: {
        page: params.page || 1,
        limit: params.limit || 12,
        search: params.search || '',
      }
    });
  },

  getMovieById: (id) => {
    return axiosClient.get(`/api/v1/movies/${id}`);
  },

  createMovie: (formData) => {
    return axiosClient.post('/api/v1/movies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  updateMovie: (id, movieData) => {
    return axiosClient.put(`/api/v1/movies/${id}`, movieData);
  },

  deleteMovie: (id) => {
    return axiosClient.delete(`/api/v1/movies/${id}`);
  },

  getGenres: () => {
    return axiosClient.get('/api/v1/movies/genres')
  },
};

export default movieAPI;
