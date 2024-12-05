import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import movieAPI from '../services/movieAPI'

function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [movieRes, showtimesRes] = await Promise.all([
          movieAPI.getMovieById(id),
          movieAPI.getShowtimes(id)
        ])
        setMovie(movieRes.data)
        setShowtimes(showtimesRes.data)
      } catch (error) {
        console.error('Error fetching booking data:', error)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const handleBooking = async () => {
    try {
      await movieAPI.bookTickets({
        movieId: id,
        showtimeId: selectedShowtime,
        seats: selectedSeats
      })
      navigate('/profile')
    } catch (error) {
      console.error('Booking error:', error)
    }
  }

  if (!movie) return <div>Loading...</div>

  return (
    <div className="booking">
      <h2>Đặt vé xem phim: {movie.title}</h2>
      
      <div className="showtime-selection">
        <h3>Chọn suất chiếu:</h3>
        <select 
          value={selectedShowtime}
          onChange={(e) => setSelectedShowtime(e.target.value)}
        >
          <option value="">Chọn suất chiếu</option>
          {showtimes.map((showtime) => (
            <option key={showtime.id} value={showtime.id}>
              {showtime.time}
            </option>
          ))}
        </select>
      </div>

      <div className="seat-selection">
        <h3>Chọn ghế:</h3>
        {/* Implement seat map here */}
      </div>

      <div className="booking-summary">
        <h3>Tổng tiền: {selectedSeats.length * movie.price}đ</h3>
        <button 
          onClick={handleBooking}
          disabled={!selectedShowtime || selectedSeats.length === 0}
        >
          Xác nhận đặt vé
        </button>
      </div>
    </div>
  )
}

export default Booking 