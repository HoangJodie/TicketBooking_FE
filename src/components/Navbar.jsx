import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import userAPI from '../services/userAPI'

function Navbar() {
  const { user, logout } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await userAPI.getProfile()
          if (response?.status === 200 && response?.data) {
            setUserProfile(response.data)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Cinema
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-indigo-600">
                Trang chủ
              </Link>
              <Link to="/movies" className="text-gray-700 hover:text-indigo-600">
                Phim
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
                >
                  <span>{userProfile?.full_name || user.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link 
                      to="/tickets" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                      </svg>
                      Vé của tôi
                    </Link>
                    {user.role_id === 1 && (
                      <Link 
                        to="/admin/movies" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Quản lý phim
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 