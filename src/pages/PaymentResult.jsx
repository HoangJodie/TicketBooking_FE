import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import bookingAPI from '../services/bookingAPI'

function PaymentResult() {
  const [status, setStatus] = useState('loading')
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const params = new URLSearchParams(location.search)
        const bookingId = params.get('bookingId')
        
        if (!bookingId) {
          throw new Error('Không tìm thấy thông tin thanh toán')
        }

        console.log('Checking payment status for booking:', bookingId)

        const response = await bookingAPI.getPaymentStatus(bookingId)
        
        console.log('Payment status check:', response.data)
        
        if (response?.data?.return_code === 1) {
          setStatus('success')
          toast.success('Thanh toán thành công!')
          localStorage.removeItem('pending_payment')
          
          clearInterval(intervalId)
          
          setTimeout(() => {
            navigate('/tickets')
          }, 3000)
        } else if (response?.data?.return_code === 0) {
          setStatus('failed')
          throw new Error(response.data.return_message || 'Thanh toán thất bại')
        }
      } catch (error) {
        console.error('Error checking payment:', error)
        setStatus('error')
        
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
        toast.error(errorMessage)
        
        clearInterval(intervalId)
        
        setTimeout(() => {
          navigate('/movies')
        }, 3000)
      }
    }

    let intervalId
    checkPaymentStatus()
    intervalId = setInterval(checkPaymentStatus, 2000)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [location, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === 'loading' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <h2 className="text-xl font-semibold">Đang kiểm tra trạng thái thanh toán...</h2>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600">Bạn sẽ được chuyển đến trang vé trong giây lát...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h2>
          <p className="text-gray-600">Vui lòng thử lại sau...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">Có lỗi xảy ra!</h2>
          <p className="text-gray-600">Không thể kiểm tra trạng thái thanh toán</p>
        </div>
      )}
    </div>
  )
}

export default PaymentResult 