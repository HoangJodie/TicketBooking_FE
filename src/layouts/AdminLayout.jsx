import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/AdminNavbar'

function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout 