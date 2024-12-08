import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import movieAPI from '../services/movieAPI'

function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const limit = 8 // Số phim mỗi trang

  useEffect(() => {
    fetchMovies()
  }, [page, searchTerm])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getMovies({
        page,
        limit,
        search: searchTerm
      })
      console.log('Movies response:', response)

      if (response?.data?.status === 'success') {
        setMovies(response.data.data)
        setTotalPages(Math.ceil(response.data.meta.total / limit))
      } else {
        console.error('Invalid response format:', response)
        setMovies([])
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Không thể tải danh sách phim')
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset về trang 1 khi tìm kiếm
  }

  const renderPagination = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            page === i
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm phim..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Movie grid */}
          {Array.isArray(movies) && movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map(movie => (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:scale-105">
                    <div className="aspect-w-2 aspect-h-3 relative">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-600">
                        {movie.title}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{movie.duration} phút</p>
                        <p className="line-clamp-1">{movie.genres.join(', ')}</p>
                        <p className="text-indigo-600">
                          {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Không tìm thấy phim nào</p>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  )
}

export default Movies 