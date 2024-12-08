import axiosClient from "./axiosClient";

const movieAPI = {
  getMovies: (params = {}) => {
    return axiosClient.get('/api/v1/movies', { 
      params: {
        page: params.page || 1,
        limit: params.limit || 8,
        search: params.search || ''
      }
    })
  },

  getMovieById: (id) => {
    return axiosClient.get(`/api/v1/movies/${id}`);
  },

  createMovie: async (formData) => {
    try {
      console.log('Sending create movie request');
      const response = await axiosClient.post('/api/v1/movies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Create movie response:', response);
      return response;
    } catch (error) {
      console.error('Error in createMovie:', error);
      throw error;
    }
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
