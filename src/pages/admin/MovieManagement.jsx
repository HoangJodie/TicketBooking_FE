import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import movieAPI from '../../services/movieAPI'
import MovieForm from '../../components/admin/MovieForm'
import { useNavigate } from 'react-router-dom'
import showtimeAPI from '../../services/showtimeAPI'

function MovieManagement() {
  const { user } = useAuth()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const limit = 10 // Số phim mỗi trang
  const navigate = useNavigate()
  const [showTimeForm, setShowTimeForm] = useState({
    room_id: '',
    show_date: '',
    start_time: '',
    end_time: '',
    base_price: ''
  })
  const [showShowtimeForm, setShowShowtimeForm] = useState(false)

  useEffect(() => {
    fetchMovies()
  }, [page, searchTerm])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getMovies({
        page,
        limit,
        search: searchTerm,
      })
      setMovies(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Không thể tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (movieId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        await movieAPI.deleteMovie(movieId)
        toast.success('Xóa phim thành công')
        fetchMovies()
      } catch (error) {
        console.error('Error deleting movie:', error)
        toast.error('Không thể xóa phim')
      }
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleViewDetails = async (movieId) => {
    try {
      const response = await movieAPI.getMovieById(movieId)
      setSelectedMovie(response.data)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error fetching movie details:', error)
      toast.error('Không thể tải thông tin phim')
    }
  }

  const handleAddShowtime = async (e) => {
    e.preventDefault()
    try {
      await showtimeAPI.createShowtime(selectedMovie.id, showTimeForm)
      toast.success('Thêm lịch chiếu thành công')
      setShowShowtimeForm(false)
      setShowTimeForm({
        room_id: '',
        show_date: '',
        start_time: '',
        end_time: '',
        base_price: ''
      })
    } catch (error) {
      console.error('Error adding showtime:', error)
      toast.error(error.response?.data?.message || 'Không thể thêm lịch chiếu')
    }
  }

  const renderPagination = () => {
    if (!meta) return null

    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Trước
        </button>
        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 mx-1 rounded ${
              page === p
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
          disabled={page === meta.last_page}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        <button
          onClick={() => {
            setSelectedMovie(null)
            setIsModalOpen(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Thêm phim mới
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm phim..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thể loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày chiếu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-20 w-16 flex-shrink-0">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-20 w-16 object-cover rounded"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {movie.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movie.duration} phút
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {movie.genres.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      movie.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {movie.status === 'active' ? 'Đang chiếu' : 'Ngừng chiếu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/movies/${movie.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renderPagination()}

      {/* Modal thêm/sửa phim */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <MovieForm
              movie={selectedMovie}
              onSubmit={async (movieData) => {
                try {
                  if (selectedMovie) {
                    await movieAPI.updateMovie(selectedMovie.id, movieData)
                    toast.success('Cập nhật phim thành công')
                  } else {
                    await movieAPI.createMovie(movieData)
                    toast.success('Thêm phim mới thành công')
                  }
                  setIsModalOpen(false)
                  fetchMovies()
                } catch (error) {
                  console.error('Error saving movie:', error)
                  toast.error(selectedMovie ? 'Không thể cập nhật phim' : 'Không thể thêm phim mới')
                }
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal chi tiết phim */}
      {isModalOpen && selectedMovie && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chi tiết phim</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              
              <div className="col-span-2">
                <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600">Thời lượng</p>
                    <p className="font-semibold">{selectedMovie.duration} phút</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày chiếu</p>
                    <p className="font-semibold">
                      {new Date(selectedMovie.releaseDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Thể loại</p>
                    <p className="font-semibold">{selectedMovie.genres.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngôn ngữ</p>
                    <p className="font-semibold">
                      {selectedMovie.language} - Phụ đề {selectedMovie.subtitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Đạo diễn</p>
                    <p className="font-semibold">{selectedMovie.director}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Diễn viên</p>
                    <p className="font-semibold">{selectedMovie.cast}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 mb-2">Mô tả</p>
                  <p className="text-gray-800">{selectedMovie.description}</p>
                </div>
              </div>
            </div>

            <div className="col-span-3 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Lịch chiếu</h3>
                <button
                  onClick={() => setShowShowtimeForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Thêm lịch chiếu
                </button>
              </div>

              {showShowtimeForm && (
                <form onSubmit={handleAddShowtime} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phòng chiếu
                      </label>
                      <select
                        value={showTimeForm.room_id}
                        onChange={(e) => setShowTimeForm({
                          ...showTimeForm,
                          room_id: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Chọn phòng chiếu</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày chiếu
                      </label>
                      <input
                        type="date"
                        value={showTimeForm.show_date}
                        onChange={(e) => setShowTimeForm({
                          ...showTimeForm,
                          show_date: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giờ bắt đầu
                      </label>
                      <input
                        type="time"
                        value={showTimeForm.start_time}
                        onChange={(e) => setShowTimeForm({
                          ...showTimeForm,
                          start_time: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giờ kết thúc
                      </label>
                      <input
                        type="time"
                        value={showTimeForm.end_time}
                        onChange={(e) => setShowTimeForm({
                          ...showTimeForm,
                          end_time: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giá vé cơ bản
                      </label>
                      <input
                        type="number"
                        value={showTimeForm.base_price}
                        onChange={(e) => setShowTimeForm({
                          ...showTimeForm,
                          base_price: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowShowtimeForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Thêm lịch chiếu
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieManagement 