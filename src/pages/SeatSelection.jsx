import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import bookingAPI from '../services/bookingAPI'

function SeatSelection() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [showtime, setShowtime] = useState(null)
  const [room, setRoom] = useState(null)
  const [seatRows, setSeatRows] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [processing, setProcessing] = useState(false)
  const [pendingBooking, setPendingBooking] = useState(null)

  const fetchSeats = async () => {
    try {
      setLoading(true)
      const response = await bookingAPI.getShowtimeSeats(showtimeId)
      
      if (response?.data?.status === 'success') {
        const { showtime, room, seats } = response.data.data
        setShowtime(showtime)
        setRoom(room)
        setSeatRows(seats)

        // Lọc ghế pending của user hiện tại
        const pendingSeats = seats
          .flatMap(row => row.seats)
          .filter(seat => seat.status === 'pending' && seat.userId === user.id)
          .map(seat => ({ 
            ...seat, 
            rowName: seats.find(r => r.seats.some(s => s.id === seat.id)).row 
          }))

        if (pendingSeats.length > 0) {
          setSelectedSeats(pendingSeats)
          setPendingBooking({
            showtimeId,
            seatIds: pendingSeats.map(seat => seat.id)
          })
        }
      }
    } catch (error) {
      console.error('Error fetching seats:', error)
      toast.error('Không thể tải thông tin ghế ngồi')
      navigate('/movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt vé')
      navigate('/login')
      return
    }

    fetchSeats()
  }, [showtimeId, user, navigate])

  const handleSeatClick = async (seat, rowName) => {
    if (processing) return

    // Nếu là ghế pending của user hiện tại
    if (seat.status === 'pending' && seat.userId === user.id) {
      try {
        setProcessing(true)
        
        await bookingAPI.cancelSeat({
          showtimeId: Number(showtimeId),
          seatId: seat.id
        })

        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        
        if (selectedSeats.length === 1) {
          setPendingBooking(null)
        }

        await fetchSeats()
        toast.success('Đã hủy ghế thành công')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể hủy ghế')
      } finally {
        setProcessing(false)
      }
      return
    }

    // Không cho chọn ghế đã được đặt hoặc pending bởi người khác
    if (seat.status !== 'available') {
      return
    }

    try {
      setProcessing(true)

      // Nếu đã có booking pending, cập nhật danh sách ghế
      if (pendingBooking) {
        const newSeatIds = selectedSeats.find(s => s.id === seat.id)
          ? selectedSeats.filter(s => s.id !== seat.id).map(s => s.id)
          : [...selectedSeats.map(s => s.id), seat.id]

        await bookingAPI.updateSelectedSeats({
          showtimeId: Number(showtimeId),
          seatIds: newSeatIds
        })
      }

      // Cập nhật state local
      setSelectedSeats(prev => {
        const isSelected = prev.find(s => s.id === seat.id)
        if (isSelected) {
          return prev.filter(s => s.id !== seat.id)
        }

        if (prev.length >= 8) {
          toast.warning('Bạn chỉ được chọn tối đa 8 ghế')
          return prev
        }

        return [...prev, { ...seat, rowName }]
      })

      await fetchSeats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật ghế')
    } finally {
      setProcessing(false)
    }
  }

  const handleInitiateBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 ghế')
      return
    }

    if (selectedSeats.length > 8) {
      toast.warning('Bạn chỉ được chọn tối đa 8 ghế')
      return
    }

    try {
      setProcessing(true)
      
      // Log data trước khi gọi API
      console.log('Selected seats:', selectedSeats)
      
      const requestData = {
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats.map(seat => seat.id)
      }
      
      console.log('Request data:', requestData)
      
      const response = await bookingAPI.initiateBooking(requestData)

      // Log response để debug
      console.log('API Response:', response)

      if (response?.data?.bookingId) {
        const seatIdsParam = selectedSeats.map(seat => seat.id).join(',')
        
        // Sửa lại đường dẫn navigate
        navigate(`/booking-confirm/${showtimeId}/${seatIdsParam}`, {
          state: { 
            bookingId: response.data.bookingId 
          }
        })
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })

      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Ghế không hợp lệ')
      } else if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập lại')
        navigate('/login')
      } else {
        toast.error('Không thể đặt ghế, vui lòng thử lại sau')
      }
    } finally {
      setProcessing(false)
    }
  }

  const getSeatColor = (seat) => {
    if (seat.status === 'pending') {
      if (seat.userId === user.id) {
        return 'bg-yellow-200 hover:bg-red-500 cursor-pointer'
      }
      return 'bg-yellow-200 cursor-not-allowed'
    }
    
    if (selectedSeats.find(s => s.id === seat.id)) {
      return 'bg-indigo-600 text-white hover:bg-indigo-700'
    }
    
    switch (seat.status) {
      case 'available':
        return 'bg-white hover:bg-indigo-100 border border-gray-300'
      case 'booked':
        return 'bg-gray-300 cursor-not-allowed'
      default:
        return 'bg-gray-300 cursor-not-allowed'
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
      {/* Thông tin phim và suất chiếu */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">{showtime?.movie?.title}</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Suất chiếu</p>
            <p className="font-semibold">{showtime?.startTime} - {showtime?.endTime}</p>
          </div>
          <div>
            <p className="text-gray-600">Phòng</p>
            <p className="font-semibold">{room?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Giá vé cơ bản</p>
            <p className="font-semibold">{new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(showtime?.basePrice)}</p>
          </div>
        </div>
      </div>

      {/* Màn hình */}
      <div className="relative w-full mb-12">
        <div className="h-2 bg-gray-300 rounded-lg mb-4"></div>
        <p className="text-center text-sm text-gray-500">Màn hình</p>
      </div>

      {/* Danh sách ghế */}
      <div className="grid gap-4 mb-8">
        {seatRows.map((row) => (
          <div key={row.row} className="flex items-center gap-4">
            <span className="w-8 text-center font-bold">{row.row}</span>
            <div className="flex gap-2 flex-1 justify-center">
              {row.seats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat, row.row)}
                  disabled={processing || (seat.status !== 'available' && !(seat.status === 'pending' && seat.userId === user.id))}
                  className={`
                    w-8 h-8 rounded text-sm font-medium
                    ${getSeatColor(seat)}
                    transition-colors duration-200
                  `}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chú thích */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
          <span className="text-sm">Ghế trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded"></div>
          <span className="text-sm">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-sm">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-200 rounded"></div>
          <span className="text-sm">Đang giữ</span>
        </div>
      </div>

      {/* Thông tin đặt vé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Đã chọn: {selectedSeats.length} ghế ({selectedSeats.map(seat => 
                `${seat.rowName}${seat.seatNumber}`
              ).join(', ')})
            </p>
            <p className="font-bold">
              Tổng tiền: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0))}
            </p>
          </div>
          <div>
            <button
              onClick={handleInitiateBooking}
              disabled={selectedSeats.length === 0 || processing}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 
                       disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {processing ? 'Đang xử lý...' : 'Đặt vé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelection