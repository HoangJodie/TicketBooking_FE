import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import movieAPI from '../services/movieAPI'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await movieAPI.getMovieById(id)
        setMovie(response.data)
      } catch (error) {
        console.error('Error fetching movie:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
  
  if (!movie) return (
    <div className="text-center py-12">
      <h2 className="text-2xl text-gray-600">Movie not found</h2>
    </div>
  )

  return (
    <div className="movie-detail flex flex-col md:flex-row gap-8">
      <img 
        src={movie.poster} 
        alt={movie.title} 
        className="w-full md:w-1/3 rounded-lg shadow-lg"
      />
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
        <p className="text-gray-600 mb-6">{movie.description}</p>
        <button 
          onClick={() => navigate(`/booking/${id}`)}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Đặt vé ngay
        </button>
      </div>
    </div>
  )
}

export default MovieDetail 