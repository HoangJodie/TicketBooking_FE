import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6">
          Đặt vé xem phim trực tuyến
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Đặt vé dễ dàng, thanh toán nhanh chóng
        </p>
        <Link 
          to="/movies" 
          className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600 transition duration-300"
        >
          Xem phim đang chiếu
        </Link>
      </section>
    </div>
  )
}

export default Home 