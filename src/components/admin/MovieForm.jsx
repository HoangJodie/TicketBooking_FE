import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import movieAPI from '../../services/movieAPI';

function MovieForm({ movie, onSubmit, onCancel }) {
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    releaseDate: '',
    director: '',
    cast: '',
    genreIds: [],
    language: '',
    subtitle: '',
    poster: null,
    status: 'active'
  });
  const [posterPreview, setPosterPreview] = useState('');

  useEffect(() => {
    fetchGenres();
    if (movie) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        duration: movie.duration || '',
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        director: movie.director || '',
        cast: movie.cast || '',
        genreIds: movie.genres ? movie.genres.map(g => g.genre_id) : [],
        language: movie.language || '',
        subtitle: movie.subtitle || '',
        status: movie.status || 'active'
      });
      setPosterPreview(movie.poster || '');
    }
  }, [movie]);

  const fetchGenres = async () => {
    try {
      const response = await movieAPI.getGenres();
      console.log('Genres response:', response);
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Không thể tải danh sách thể loại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('duration', formData.duration);
    form.append('releaseDate', formData.releaseDate);
    form.append('director', formData.director);
    form.append('cast', formData.cast);
    form.append('language', formData.language);
    form.append('subtitle', formData.subtitle);
    
    formData.genreIds.forEach(genreId => {
      form.append('genreIds[]', genreId);
    });

    if (formData.poster) {
      form.append('poster', formData.poster);
    }

    onSubmit(form);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, poster: file });
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  };

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
          <label className="block text-sm font-medium text-gray-700">
            Thể loại
          </label>
          <Select
            isMulti
            value={genres
              .filter(genre => formData.genreIds.includes(genre.genre_id.toString()))
              .map(genre => ({
                value: genre.genre_id,
                label: genre.name
              }))}
            onChange={(selectedOptions) => {
              const selectedIds = selectedOptions ? selectedOptions.map(option => option.value.toString()) : [];
              setFormData({ ...formData, genreIds: selectedIds });
            }}
            options={genres.map(genre => ({
              value: genre.genre_id,
              label: genre.name
            }))}
            className="mt-1"
            classNamePrefix="select"
            placeholder="Chọn thể loại..."
            noOptionsMessage={() => "Không có thể loại nào"}
          />
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
          <label className="block text-sm font-medium text-gray-700">
            Poster
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {posterPreview && (
              <img 
                src={posterPreview} 
                alt="Poster preview" 
                className="h-20 w-20 object-cover rounded"
              />
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
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {movie ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}

export default MovieForm; 