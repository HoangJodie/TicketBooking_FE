import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import movieAPI from '../services/movieAPI'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchMovieDetails()
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getMovieById(id)
      setMovie(response.data)
      
      // Set ngày mặc định là ngày đầu tiên có suất chiếu
      if (response.data.showtimes && response.data.showtimes.length > 0) {
        setSelectedDate(response.data.showtimes[0].showDate.split('T')[0])
      }
    } catch (error) {
      console.error('Error fetching movie details:', error)
      toast.error('Không thể tải thông tin phim')
    } finally {
      setLoading(false)
    }
  }

  const getUniqueDates = () => {
    if (!movie?.showtimes) return []
    const dates = new Set(
      movie.showtimes.map(showtime => showtime.showDate.split('T')[0])
    )
    return Array.from(dates).sort()
  }

  const getShowtimesByDate = (date) => {
    return movie.showtimes.filter(
      showtime => showtime.showDate.split('T')[0] === date
    ).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleShowtimeClick = (showtimeId) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để đặt vé')
      navigate('/login')
      return
    }
    navigate(`/booking/${showtimeId}`)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster và trailer */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] mb-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          {movie.trailer && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Trailer</h3>
              <div className="relative aspect-video">
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

        {/* Thông tin phim */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Thời lượng</p>
                <p className="font-semibold">{movie.duration} phút</p>
              </div>
              <div>
                <p className="text-gray-600">Khởi chiếu</p>
                <p className="font-semibold">
                  {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Thể loại</p>
                <p className="font-semibold">{movie.genres.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngôn ngữ</p>
                <p className="font-semibold">{movie.language} - Phụ đề {movie.subtitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Đạo diễn</p>
                <p className="font-semibold">{movie.director}</p>
              </div>
              <div>
                <p className="text-gray-600">Diễn viên</p>
                <p className="font-semibold">{movie.cast}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Nội dung phim</h3>
              <p className="text-gray-700 whitespace-pre-line">{movie.description}</p>
            </div>

            {/* Lịch chiếu */}
            {movie.showtimes && movie.showtimes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Lịch chiếu</h3>
                
                {/* Chọn ngày */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {getUniqueDates().map(date => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${
                        selectedDate === date
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </button>
                  ))}
                </div>

                {/* Danh sách suất chiếu */}
                <div className="space-y-4">
                  {getShowtimesByDate(selectedDate).map(showtime => (
                    <div
                      key={showtime.id}
                      className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{showtime.room.name}</h4>
                        <span className="text-gray-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(showtime.basePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {showtime.startTime} - {showtime.endTime}
                        </div>
                        <button
                          onClick={() => handleShowtimeClick(showtime.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                        >
                          Đặt vé
                        </button>
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

export default MovieDetail 