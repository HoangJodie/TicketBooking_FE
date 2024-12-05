import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    // Fetch user's booking history
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/bookings/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  if (!user) return <div>Please login to view profile</div>

  return (
    <div className="profile">
      <h2>Thông tin cá nhân</h2>
      <div className="user-info">
        <p>Họ tên: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>

      <h3>Lịch sử đặt vé</h3>
      <div className="booking-history">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-item">
            <p>Phim: {booking.movieTitle}</p>
            <p>Ngày chiếu: {booking.showtime}</p>
            <p>Số ghế: {booking.seats.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile 