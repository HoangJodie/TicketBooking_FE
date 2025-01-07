import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import movieAPI from '../../services/movieAPI';

function MovieForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    releaseDate: '',
    director: '',
    cast: '',
    poster: null,
    trailer: '',
    language: '',
    subtitle: '',
    genres: [],
    ...initialData
  });

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  const [posterPreview, setPosterPreview] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movieAPI.getGenres();
        console.log('Genres response:', response);
        
        if (response?.data?.status === 'success' && Array.isArray(response.data.data)) {
          setGenres(response.data.data);
        } else {
          console.error('Invalid genres response:', response);
          setGenres([]);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        toast.error('Không thể tải danh sách thể loại');
        setGenres([]);
      }
    };

    fetchGenres();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      
      if (!formData.title || !formData.duration || !formData.releaseDate || !formData.genres.length) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      form.append('title', formData.title);
      form.append('duration', Number(formData.duration));
      form.append('releaseDate', new Date(formData.releaseDate).toISOString().split('T')[0]);
      
      formData.genres.forEach(genre => {
        const genreObj = genres.find(g => g.name === genre);
        if (genreObj) {
          form.append('genreIds[]', genreObj.genre_id);
        }
      });

      if (formData.description) form.append('description', formData.description);
      if (formData.director) form.append('director', formData.director);
      if (formData.cast) form.append('cast', formData.cast);
      if (formData.language) form.append('language', formData.language);
      if (formData.subtitle) form.append('subtitle', formData.subtitle);
      if (formData.poster instanceof File) form.append('poster', formData.poster);
      if (formData.trailer) form.append('trailer', formData.trailer);

      for (let pair of form.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await onSubmit(form);
      toast.success('Thêm phim thành công');
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi thêm phim');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = (e) => {
    e.preventDefault()
    if (!genreInput.trim()) return

    if (!formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }))
    }
    setGenreInput('')
  }

  const handleRemoveGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }))
  }

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        poster: file
      }));

      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên phim
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thời lượng (phút)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngày khởi chiếu
          </label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thể loại
          </label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.genres.map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genre)}
                    className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value=""
                onChange={(e) => {
                  const selectedGenre = genres.find(g => g.genre_id === Number(e.target.value));
                  if (selectedGenre && !formData.genres.includes(selectedGenre.name)) {
                    setFormData(prev => ({
                      ...prev,
                      genres: [...prev.genres, selectedGenre.name]
                    }));
                  }
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Chọn thể loại...</option>
                {Array.isArray(genres) && genres
                  .filter(genre => !formData.genres.includes(genre.name))
                  .map(genre => (
                    <option key={genre.genre_id} value={genre.genre_id}>
                      {genre.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
           Đạo diễn
          </label>
          <input
            type="text"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diễn viên
          </label>
          <input
            type="text"
            value={formData.cast}
            onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ngôn ngữ
          </label>
          <input
            type="text"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phụ đề
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poster
          </label>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePosterChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG, GIF tối đa 5MB
              </p>
            </div>
            
            {(posterPreview || formData.poster) && (
              <div className="relative w-32 h-48 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={posterPreview || formData.poster}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, poster: null }));
                    setPosterPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {loading ? 'Đang xử lý...' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}

export default MovieForm; 