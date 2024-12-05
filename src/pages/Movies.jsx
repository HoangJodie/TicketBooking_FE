import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import movieAPI from '../services/movieAPI'

function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieAPI.getMovies()
        setMovies(response.data)
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )

  return (
    <div className="movies">
      <h2 className="text-3xl font-bold mb-8">Phim đang chiếu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:scale-105">
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full h-80 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                <p className="text-gray-600">{movie.genre}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Movies 