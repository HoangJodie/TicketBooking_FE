import { createContext, useContext, useState, useEffect } from 'react'
import userAPI from '../services/userAPI'
import { toast } from 'react-toastify'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUserFromToken = (token) => {
    try {
      if (!token || typeof token !== 'string') {
        console.error('Invalid token format:', token)
        return null
      }

      const decoded = jwtDecode(token)
      console.log('Decoded token:', decoded)

      if (!decoded.user_id || !decoded.email) {
        console.error('Missing required fields in token:', decoded)
        return null
      }

      return {
        user_id: decoded.user_id,
        email: decoded.email,
        role_id: decoded.role_id
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials)
      console.log('Login response:', response)

      // Kiểm tra response format
      if (!response?.data?.accessToken) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      const { accessToken, refreshToken } = response.data
      console.log('Tokens:', { accessToken, refreshToken })

      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      const tokenUser = getUserFromToken(accessToken)
      if (!tokenUser) {
        throw new Error('Invalid token data')
      }

      setUser(tokenUser)
      console.log('User set from token:', tokenUser)
      return response.data

    } catch (error) {
      console.error('Login error:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      throw error
    }
  }

  const logout = async () => {
    try {
      await userAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Checking auth with token:', token)

        if (!token) {
          console.log('No token found')
          setUser(null)
          return
        }

        const tokenUser = getUserFromToken(token)
        if (tokenUser) {
          console.log('User restored from token:', tokenUser)
          setUser(tokenUser)
        } else {
          console.log('Invalid token, clearing auth')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 