import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import movieAPI from '../../services/movieAPI'
import roomAPI from '../../services/roomAPI'
import showtimeAPI from '../../services/showtimeAPI'

function MovieDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState([])
  const [showTimeForm, setShowTimeForm] = useState({
    room_id: '',
    show_date: '',
    start_time: '',
    base_price: ''
  })
  const [showShowtimeForm, setShowShowtimeForm] = useState(false)
  const [showtimes, setShowtimes] = useState([])

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

        // Fetch rooms
        const roomResponse = await roomAPI.getRooms()
        console.log('Rooms response:', roomResponse)
        
        if (roomResponse?.data?.status === 'success' && Array.isArray(roomResponse.data.data)) {
          setRooms(roomResponse.data.data)
        } else {
          setRooms([])
        }

        // Fetch showtimes
        const showtimeResponse = await showtimeAPI.getShowtimesByMovie(id)
        console.log('Showtimes response:', showtimeResponse)
        
        if (showtimeResponse?.data?.status === 'success' && Array.isArray(showtimeResponse.data.data)) {
          setShowtimes(showtimeResponse.data.data)
        } else {
          setShowtimes([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Không thể tải thông tin phim')
        navigate('/admin/movies')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  const handleAddShowtime = async (e) => {
    e.preventDefault()
    try {
      const endTime = calculateEndTime(showTimeForm.start_time)
      
      // Validate dữ liệu
      if (!showTimeForm.room_id || !showTimeForm.show_date || !showTimeForm.start_time || !showTimeForm.base_price) {
        toast.error('Vui lòng điền đầy đủ thông tin')
        return
      }

      // Format dữ liệu
      const data = {
        room_id: Number(showTimeForm.room_id),
        show_date: showTimeForm.show_date,
        start_time: showTimeForm.start_time,
        end_time: endTime,
        base_price: Number(showTimeForm.base_price)
      }

      console.log('Sending showtime data:', data)

      const response = await showtimeAPI.createShowtime(id, data)
      console.log('Showtime response:', response)

      if (response?.data?.status === 'success') {
        toast.success('Thêm lịch chiếu thành công')
        setShowShowtimeForm(false)
        setShowTimeForm({
          room_id: '',
          show_date: '',
          start_time: '',
          base_price: ''
        })
        
        // Fetch lại danh sách lịch chiếu
        const updatedShowtimes = await showtimeAPI.getShowtimesByMovie(id)
        if (updatedShowtimes?.data?.status === 'success') {
          setShowtimes(updatedShowtimes.data.data)
        }
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error('Error adding showtime:', error)
      toast.error(error.response?.data?.message || 'Không thể thêm lịch chiếu')
    }
  }

  const calculateEndTime = (startTime) => {
    if (!startTime || !movie?.duration) return ''
    
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + movie.duration
    
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Nếu timeString đã có format HH:mm
    if (timeString.length === 5) return timeString;
    // Nếu timeString là ISO format
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

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
                <p className="text-lg font-semibold">{movie.duration} phút</p>
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
                            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
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

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quản lý lịch chiếu</h2>
          <button
            onClick={() => setShowShowtimeForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Thêm lịch chiếu
          </button>
        </div>

        {showShowtimeForm && (
          <form onSubmit={handleAddShowtime} className="bg-gray-50 p-6 rounded-lg">
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
                    <option key={room.room_id} value={room.room_id}>
                      {room.name} (Sức chứa: {room.capacity})
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
                  min={new Date().toISOString().split('T')[0]}
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
                  Giờ kết thúc (tự động)
                </label>
                <input
                  type="time"
                  value={calculateEndTime(showTimeForm.start_time)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                  disabled
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
                  min="0"
                  step="1000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
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

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Lịch chiếu hiện tại</h3>
        <div className="grid gap-4">
          {showtimes.map(showtime => (
            <div key={showtime.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{showtime.room.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
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
    </div>
  )
}

export default MovieDetails 