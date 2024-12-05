import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            MovieTickets
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/movies" className="text-gray-600 hover:text-gray-900">
              Phim
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header 