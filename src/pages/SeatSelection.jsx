import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import bookingAPI from '../services/bookingAPI'

function SeatSelection() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  
  console.log('SeatSelection mounted with showtimeId:', showtimeId)

  const [loading, setLoading] = useState(true)
  const [showtime, setShowtime] = useState(null)
  const [room, setRoom] = useState(null)
  const [seatRows, setSeatRows] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])

  useEffect(() => {
    console.log('useEffect triggered with showtimeId:', showtimeId)
    
    const fetchSeats = async () => {
      try {
        console.log('Starting to fetch seats...')
        setLoading(true)
        
        if (!showtimeId) {
          console.log('No showtimeId provided')
          return
        }

        const response = await bookingAPI.getShowtimeSeats(showtimeId)
        console.log('API Response received:', response)

        if (response?.data?.status !== 'success' || !response?.data?.data) {
          throw new Error('Invalid API response format')
        }

        const { showtime, room, seats } = response.data.data
        console.log('API Data extracted:', {
          showtime,
          room,
          seats
        })

        if (!showtime || !room || !Array.isArray(seats)) {
          throw new Error('Missing required data')
        }

        setShowtime(showtime)
        setRoom(room)
        setSeatRows(seats)

      } catch (error) {
        console.error('Error in fetchSeats:', error)
        toast.error('Không thể tải thông tin ghế ngồi')
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [showtimeId])

  useEffect(() => {
    console.log('Loading state changed:', loading)
  }, [loading])

  useEffect(() => {
    console.log('State updated:', {
      showtime,
      room,
      seatRows,
      selectedSeats
    })
  }, [showtime, room, seatRows, selectedSeats])

  const handleSeatClick = (seat, rowName) => {
    if (seat.status !== 'active') return

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id)
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id)
      }
      return [...prev, { ...seat, rowName }]
    })
  }

  const getSeatColor = (seat) => {
    if (seat.status !== 'active') return 'bg-gray-300 cursor-not-allowed'
    if (selectedSeats.find(s => s.id === seat.id)) return 'bg-indigo-600 text-white'
    if (seat.type === 'VIP') return 'bg-white hover:bg-indigo-100 border-2 border-red-500'
    if (seat.type === 'Couple') return 'bg-white hover:bg-indigo-100 border-2 border-pink-500'
    return 'bg-white hover:bg-indigo-100 border border-indigo-600'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    console.log('Rendering loading state')
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  console.log('Rendering main component')
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
            <p className="font-semibold">{formatCurrency(showtime?.basePrice)}</p>
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
        {console.log('Rendering with seatRows:', seatRows)}
        {Array.isArray(seatRows) && seatRows.length > 0 ? (
          seatRows.map((row) => {
            console.log('Rendering row:', row)
            return (
              <div key={row.row} className="flex items-center gap-4">
                <span className="w-8 text-center font-bold">{row.row}</span>
                <div className="flex gap-2 flex-1 justify-center">
                  {Array.isArray(row.seats) && row.seats.map((seat) => {
                    console.log('Rendering seat:', seat)
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat, row.row)}
                        disabled={seat.status !== 'active'}
                        className={`
                          w-8 h-8 rounded text-sm font-medium
                          ${getSeatColor(seat)}
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-gray-500">
            {loading ? 'Đang tải thông tin ghế...' : 'Không có thông tin ghế'}
          </p>
        )}
      </div>

      {/* Chú thích */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border border-indigo-600 rounded"></div>
          <span className="text-sm">Ghế thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded"></div>
          <span className="text-sm">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span className="text-sm">Không khả dụng</span>
        </div>
      </div>

      {/* Thông tin đã chọn và nút tiếp tục */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Đã chọn: {selectedSeats.length} ghế ({selectedSeats.map(seat => 
                `${seat.rowName}${seat.seatNumber}`
              ).join(', ')})
            </p>
            <p className="font-bold">
              Tổng tiền: {formatCurrency(
                selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0)
              )}
            </p>
          </div>
          <button
            onClick={() => {
              // TODO: Chuyển đến bước tiếp theo
              console.log('Selected seats:', selectedSeats)
            }}
            disabled={selectedSeats.length === 0}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}

export default SeatSelection 