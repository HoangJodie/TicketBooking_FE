function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Về chúng tôi</h3>
            <p className="text-gray-300">
              Website đặt vé xem phim trực tuyến
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Liên hệ</h3>
            <p className="text-gray-300">Email: contact@ticketbooking.com</p>
            <p className="text-gray-300">Điện thoại: 1900 xxxx</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 