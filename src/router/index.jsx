import { createBrowserRouter, Navigate } from 'react-router-dom'
import MovieManagement from '../pages/admin/MovieManagement'
import MovieDetails from '../pages/admin/MovieDetails'
import { useAuth } from '../contexts/AuthContext'
// Import các component khác...

// HOC để bảo vệ route admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user || Number(user.role_id) !== 1) {
    return <Navigate to="/" />
  }
  
  return children
}

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />, // Bạn cần có AdminLayout
    children: [
      {
        path: 'movies',
        element: (
          <AdminRoute>
            <MovieManagement />
          </AdminRoute>
        ),
      },
      {
        path: 'movies/:id',
        element: (
          <AdminRoute>
            <MovieDetails />
          </AdminRoute>
        ),
      }
      // Các route khác...
    ]
  }
  // Các route khác...
])

export default router 