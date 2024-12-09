import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import bookingAPI from '../services/bookingAPI'

function BookingConfirmation() {
  const { showtimeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [confirmation, setConfirmation] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        setLoading(true)
        
        const seatIds = location.state?.seatIds
        if (!seatIds) {
          toast.error('Không tìm thấy thông tin ghế đã chọn')
          navigate('/movies')
          return
        }

        const response = await bookingAPI.getBookingConfirmation({
          showtimeId: Number(showtimeId),
          seatIds: seatIds
        })

        if (response?.data?.status === 'success') {
          setConfirmation(response.data.data.confirmation)
        } else {
          throw new Error('API response not success')
        }
      } catch (error) {
        console.error('Error in BookingConfirmation:', error)
        toast.error(error.response?.data?.message || 'Không thể tải thông tin đặt vé')
        navigate('/movies')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      navigate('/login')
      return
    }

    fetchConfirmation()
  }, [showtimeId, location.state, user, navigate])

  const handleConfirmBooking = async () => {
    try {
      setProcessing(true)
      
      // Xóa thông tin tạm trong localStorage
      localStorage.removeItem('booking_temp')
      
      // Chuyển đến trang thanh toán
      navigate('/payment', {
        state: {
          bookingId: confirmation.id,
          showtimeId: confirmation.showtime.id,
          seatIds: confirmation.seats.map(seat => seat.seatId),
          totalAmount: confirmation.totalAmount,
          movieTitle: confirmation.movie.title,
          showDate: confirmation.showtime.showDate,
          startTime: confirmation.showtime.startTime,
          roomName: confirmation.room.name
        }
      })
    } catch (error) {
      console.error('Error in handleConfirmBooking:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setProcessing(false)
    }
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Xác nhận đặt vé</h1>

        {/* Thông tin phim */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <img 
              src={confirmation?.movie.posterUrl} 
              alt={confirmation?.movie.title}
              className="w-32 h-48 object-cover rounded"
            />
            <div>
              <h2 className="text-xl font-bold mb-2">{confirmation?.movie.title}</h2>
              <p className="text-gray-600">
                Suất chiếu: {new Date(confirmation?.showtime.startTime).toLocaleTimeString()}
              </p>
              <p className="text-gray-600">
                Ngày chiếu: {new Date(confirmation?.showtime.showDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">Phòng: {confirmation?.room.name}</p>
              <p className="text-gray-600">
                Giá vé cơ bản: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(confirmation?.basePrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-bold mb-4">Thông tin khách hàng</h3>
          <p>Họ tên: {confirmation?.customer.name || 'Chưa cập nhật'}</p>
          <p>Email: {confirmation?.customer.email}</p>
        </div>

        {/* Thông tin ghế */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-bold mb-4">Thông tin ghế đã chọn</h3>
          <div className="space-y-2">
            {confirmation?.seats.map(seat => (
              <div key={seat.seatId} className="flex justify-between">
                <span>Ghế {seat.rowName}{seat.seatNumber}</span>
                <span>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(seat.price)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Tổng tiền</span>
                <span>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(confirmation?.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút xác nhận */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Quay lại
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={processing}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {processing ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation