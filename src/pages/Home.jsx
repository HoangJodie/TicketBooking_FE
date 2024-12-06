import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import movieAPI from "../services/movieAPI";

function Home() {
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieAPI.getMovies();
        // Phân loại phim đang chiếu và sắp chiếu dựa vào ngày
        const now = new Date();
        const current = [];
        const upcoming = [];

        response.data.forEach((movie) => {
          const releaseDate = new Date(movie.releaseDate);
          if (releaseDate <= now) {
            current.push(movie);
          } else {
            upcoming.push(movie);
          }
        });

        setMovies(current);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );

  return (
    <div className="home bg-gray-100">
      {/* Hero Banner */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={movies[0]?.poster}
          alt="banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent">
          <div className="container mx-auto h-full flex items-end pb-20 px-4">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4">{movies[0]?.title}</h1>
              <p className="text-lg mb-6">{movies[0]?.description}</p>
              <Link
                to={`/movies/${movies[0]?.id}`}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Đặt vé ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Phim đang chiếu */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Phim đang chiếu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-[300px] object-cover transform group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">
                    {movie.duration} phút
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {movie.genres.join(", ")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Phim sắp chiếu */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Phim sắp chiếu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {upcomingMovies.map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-[300px] object-cover transform group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">
                    {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {movie.genres.join(", ")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
