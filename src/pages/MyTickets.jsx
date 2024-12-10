import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import bookingAPI from '../services/bookingAPI'

function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await bookingAPI.getMyTickets()
        
        if (response?.data?.status === 'success') {
          setTickets(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        toast.error('Không thể tải danh sách vé')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Đơn giản hóa hàm formatDateTime vì dữ liệu đã được format từ backend
  const formatDateTime = (date, time) => {
    return `${date} ${time}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Vé của tôi</h1>

      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Bạn chưa có vé nào</p>
          <button
            onClick={() => navigate('/movies')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Đặt vé ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((booking) => (
            <div key={booking.booking_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Movie Info */}
              <div className="flex p-4">
                <img
                  src={booking.movie.poster_url}
                  alt={booking.movie.title}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="ml-4">
                  <h3 className="font-bold text-lg mb-2">{booking.movie.title}</h3>
                  <p className="text-sm text-gray-600">
                    Mã đặt vé: {booking.booking_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {booking.booking_date}
                  </p>
                </div>
              </div>

              {/* Showtime Info */}
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-sm">
                  <span className="font-semibold">Suất chiếu: </span>
                  {formatDateTime(booking.showtime.show_date, booking.showtime.start_time)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Phòng: </span>
                  {booking.showtime.room.name}
                </p>
              </div>

              {/* Seats Info */}
              <div className="px-4 py-3 border-t">
                <p className="text-sm font-semibold mb-2">Ghế:</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <div
                      key={seat.seat_id}
                      className="px-2 py-1 bg-gray-100 rounded text-sm"
                      title={seat.ticket_code ? `Mã vé: ${seat.ticket_code}` : 'Chưa có mã vé'}
                    >
                      {seat.row}{seat.seat_number}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="px-4 py-3 bg-gray-50 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng tiền:</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTickets 