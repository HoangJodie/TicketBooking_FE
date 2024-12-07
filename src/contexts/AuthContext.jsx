import { createContext, useContext, useState, useEffect } from 'react'
import userAPI from '../services/userAPI'
import { toast } from 'react-toastify'
import axiosClient from '../services/axiosClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const fetchUserDetails = async (userId) => {
    try {
      console.log('Fetching user details for ID:', userId)
      const response = await userAPI.getUserById(userId)
      console.log('User details response:', response)
      return response
    } catch (error) {
      console.error('Error fetching user details:', error)
      return null
    }
  }

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        return
      }

      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token payload in checkAuthStatus:', tokenPayload)

      try {
        const userProfile = await userAPI.getProfile()
        setUser({
          ...userProfile,
          role_id: tokenPayload.role_id // Đảm bảo lấy role_id từ token
        })
      } catch (error) {
        setUser({
          user_id: tokenPayload.user_id,
          email: tokenPayload.email,
          role_id: tokenPayload.role_id,
          full_name: tokenPayload.full_name || tokenPayload.email
        })
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      const response = await userAPI.login({ email, password })
      console.log('Login response in AuthContext:', response)
      
      if (response && response.accessToken) {
        console.log('Saving token:', response.accessToken)
        localStorage.setItem('token', response.accessToken)
        
        // Giải mã token để lấy thông tin user
        const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]))
        console.log('Token payload:', tokenPayload)

        // Lấy thông tin profile từ API
        try {
          const userProfile = await userAPI.getProfile()
          console.log('User profile after login:', userProfile)
          
          // Kết hợp thông tin t� token và profile, đảm bảo giữ nguyên role_id
          setUser({
            ...userProfile,
            role_id: tokenPayload.role_id // Đảm bảo lấy role_id từ token
          })
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError)
          // Fallback: dùng thông tin từ token
          setUser({
            user_id: tokenPayload.user_id,
            email: tokenPayload.email,
            role_id: tokenPayload.role_id,
            full_name: tokenPayload.full_name || email
          })
        }
        
        toast.success('Đăng nhập thành công!')
        return response
      } else {
        console.error('Invalid login response:', response)
        toast.error('Đăng nhập thất bại: Phản hồi không hợp lệ từ server')
        throw new Error('Invalid login response format')
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Đăng nhập thất bại'

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Email hoặc mật khẩu không đúng'
            break
          case 403:
            errorMessage = 'Tài khoản của bạn đã bị khóa'
            break
          case 404:
            errorMessage = 'Tài khoản không tồn tại'
            break
          default:
            errorMessage = error.response.data?.message || 'Có lỗi xảy ra khi đăng nhập'
        }
      }

      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      await userAPI.logout()
      console.log('API logout successful')
      
      // Token đã được xóa trong userAPI.logout
      setUser(null)
      
      // Reset headers của axiosClient
      delete axiosClient.defaults.headers.common['Authorization']
      
      toast.success('Đăng xuất thành công')
      return true
    } catch (error) {
      console.error('Logout error in AuthContext:', error)
      
      // Nếu lỗi 401 hoặc 400, vẫn xóa user state
      if (error.response?.status === 401 || error.response?.status === 400) {
        setUser(null)
        delete axiosClient.defaults.headers.common['Authorization']
        return true
      }
      
      toast.error('Có lỗi xảy ra khi đăng xuất')
      return false
    }
  }

  // Log mỗi khi user state thay đổi
  useEffect(() => {
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 