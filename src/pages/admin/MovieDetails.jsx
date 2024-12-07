import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import movieAPI from '../../services/movieAPI'

function MovieDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovieDetails()
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getMovieById(id)
      setMovie(response.data)
    } catch (error) {
      console.error('Error fetching movie details:', error)
      toast.error('Không thể tải thông tin phim')
      navigate('/admin/movies')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy phim</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/movies')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/movies/edit/${id}`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
                // Xử lý xóa phim
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Xóa phim
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {/* Poster và trailer */}
          <div className="md:col-span-1">
            <div className="aspect-[2/3] relative mb-4">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover rounded-lg shadow"
              />
            </div>
            {movie.trailer && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Trailer</h3>
                <div className="aspect-video">
                  <iframe
                    src={movie.trailer.replace('watch?v=', 'embed/')}
                    title="Movie Trailer"
                    className="w-full h-full rounded"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin chi tiết */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-gray-600">Thời lượng</h3>
                <p className="text-lg font-semibold">{movie.duration} ph��t</p>
              </div>
              <div>
                <h3 className="text-gray-600">Ngày khởi chiếu</h3>
                <p className="text-lg font-semibold">
                  {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <h3 className="text-gray-600">Thể loại</h3>
                <p className="text-lg font-semibold">{movie.genres.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-gray-600">Trạng thái</h3>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  movie.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {movie.status === 'active' ? 'Đang chiếu' : 'Ngừng chiếu'}
                </span>
              </div>
              <div>
                <h3 className="text-gray-600">Ngôn ngữ</h3>
                <p className="text-lg font-semibold">{movie.language}</p>
              </div>
              <div>
                <h3 className="text-gray-600">Phụ đề</h3>
                <p className="text-lg font-semibold">{movie.subtitle}</p>
              </div>
              <div>
                <h3 className="text-gray-600">Đạo diễn</h3>
                <p className="text-lg font-semibold">{movie.director}</p>
              </div>
              <div>
                <h3 className="text-gray-600">Diễn viên</h3>
                <p className="text-lg font-semibold">{movie.cast}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-gray-600 mb-2">Mô tả</h3>
              <p className="text-gray-800 whitespace-pre-line">{movie.description}</p>
            </div>

            {/* Danh sách suất chiếu */}
            {movie.showtimes && movie.showtimes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Lịch chiếu</h3>
                <div className="grid gap-4">
                  {movie.showtimes.map(showtime => (
                    <div
                      key={showtime.id}
                      className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{showtime.room.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {showtime.startTime} - {showtime.endTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(showtime.basePrice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {showtime.availableSeats} ghế trống
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetails 