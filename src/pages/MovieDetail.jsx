import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import movieAPI from '../services/movieAPI'
import showtimeAPI from '../services/showtimeAPI'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showtimes, setShowtimes] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch movie details
        const movieResponse = await movieAPI.getMovieById(id)
        console.log('Movie response:', movieResponse)
        
        if (movieResponse?.data?.status === 'success') {
          setMovie(movieResponse.data.data)
        } else {
          throw new Error('Invalid movie data')
        }

        // Fetch showtimes
        const showtimeResponse = await showtimeAPI.getShowtimesByMovie(id)
        console.log('Showtimes response:', showtimeResponse)
        
        if (showtimeResponse?.data?.status === 'success' && Array.isArray(showtimeResponse.data.data)) {
          setShowtimes(showtimeResponse.data.data)
          
          // Get unique dates
          const dates = [...new Set(showtimeResponse.data.data.map(showtime => 
            new Date(showtime.showDate).toISOString().split('T')[0]
          ))].sort()
          setAvailableDates(dates)
          
          // Set default selected date
          if (dates.length > 0) {
            setSelectedDate(dates[0])
          }
        } else {
          console.error('Invalid showtimes data:', showtimeResponse)
          setShowtimes([])
          setAvailableDates([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Không thể tải thông tin phim')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Lọc lịch chiếu theo ngày đã chọn
  const filteredShowtimes = Array.isArray(showtimes) 
    ? showtimes.filter(showtime => 
        new Date(showtime.showDate).toISOString().split('T')[0] === selectedDate
      )
    : []

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format ngày tiếng Việt
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const handleBooking = (showtimeId) => {
    console.log('handleBooking called with:', showtimeId)
    
    if (!showtimeId) {
      console.log('No showtimeId provided')
      return
    }

    const path = `/booking/${showtimeId}`
    console.log('Navigating to:', path)
    navigate(path)
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
      {/* Movie Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
          
          <div className="bg-white rounded-lg shadow-md p-6">
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

            <div>
              <h3 className="text-lg font-semibold mb-2">Nội dung phim</h3>
              <p className="text-gray-700 whitespace-pre-line">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Lịch chiếu phim</h2>
        
        {/* Date Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Chọn ngày chiếu</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Showtimes List */}
        {selectedDate && (
          <div>
            <h3 className="text-xl font-bold mb-4">
              Suất chiếu ngày {formatDate(selectedDate)}
            </h3>
            
            <div className="grid gap-4">
              {filteredShowtimes.map(showtime => (
                <div
                  key={showtime.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{showtime.room.name}</p>
                      <p className="text-gray-600">
                        {showtime.startTime} - {showtime.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-indigo-600">
                        {formatCurrency(showtime.basePrice)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {showtime.availableSeats} ghế trống
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBooking(showtime.id)}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Đặt vé
                  </button>
                </div>
              ))}

              {filteredShowtimes.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Không có suất chiếu nào trong ngày này
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetail 