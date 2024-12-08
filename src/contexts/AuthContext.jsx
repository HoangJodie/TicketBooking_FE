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
      const decoded = jwtDecode(token)
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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const tokenUser = getUserFromToken(token)
        if (tokenUser) {
          setUser(tokenUser)
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials)
      console.log('Login response:', response)
      
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      const tokenUser = getUserFromToken(response.accessToken)
      if (tokenUser) {
        setUser(tokenUser)
        console.log('Set user state from token:', tokenUser)
      } else {
        throw new Error('Invalid token data')
      }
      
      return response
    } catch (error) {
      console.error('Login error:', error)
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