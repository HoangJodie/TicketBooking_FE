import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import movieAPI from '../../services/movieAPI'
import MovieForm from '../../components/admin/MovieForm'

function MovieManagement() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getMovies()
      console.log('Movies response:', response)

      if (response?.data?.status === 'success' && Array.isArray(response.data.data)) {
        setMovies(response.data.data)
      } else {
        console.error('Invalid response format:', response)
        setMovies([])
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Không thể tải danh sách phim')
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovie = async (formData) => {
    try {
      console.log('Creating movie with data:', formData);
      const response = await movieAPI.createMovie(formData);
      console.log('Create movie response:', response);

      if (response?.data?.status === 'success') {
        toast.success('Thêm phim thành công');
        setShowForm(false);
        fetchMovies();
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error creating movie:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể thêm phim');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Thêm phim mới
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm phim mới</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Đóng</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MovieForm onSubmit={handleAddMovie} />
          </div>
        </div>
      )}

      {Array.isArray(movies) && movies.length > 0 ? (
        <div className="grid gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6 flex gap-6">
                <div className="w-48 flex-shrink-0">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-72 object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600">Thời lượng</p>
                      <p className="font-semibold">{movie.duration} phút</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày khởi chiếu</p>
                      <p className="font-semibold">
                        {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thể loại</p>
                      <p className="font-semibold">{movie.genres.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái</p>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          movie.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {movie.status === 'active' ? 'Đang chiếu' : 'Ngừng chiếu'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/movies/${movie.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Chi tiết
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
                          // handleDeleteMovie(movie.id)
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Không có phim nào</p>
      )}
    </div>
  )
}

export default MovieManagement 