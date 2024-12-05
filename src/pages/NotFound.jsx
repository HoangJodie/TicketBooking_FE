import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <Link to="/">Về trang chủ</Link>
    </div>
  )
}

export default NotFound 