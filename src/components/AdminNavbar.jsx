import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AdminNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/admin" className="font-bold text-xl">
              Admin Dashboard
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/admin/movies"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Quản lý phim
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-4">Xin chào, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar 