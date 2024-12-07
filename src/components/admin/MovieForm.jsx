import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import movieAPI from '../../services/movieAPI';

function MovieForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    releaseDate: '',
    director: '',
    cast: '',
    language: '',
    subtitle: '',
    genreIds: [],
    poster: null
  });

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await movieAPI.getGenres();
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Không thể tải danh sách thể loại phim');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên phim';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Vui lòng nhập thời lượng';
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Thời lượng phải là số dương';
    }
    
    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Vui lòng chọn ngày khởi chiếu';
    }
    
    if (formData.genreIds.length === 0) {
      newErrors.genreIds = 'Vui lòng chọn ít nhất một thể loại';
    }
    
    if (!formData.poster) {
      newErrors.poster = 'Vui lòng chọn poster phim';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const movieFormData = new FormData();
      
      movieFormData.append('title', formData.title);
      movieFormData.append('description', formData.description || '');
      movieFormData.append('duration', parseInt(formData.duration));
      movieFormData.append('releaseDate', formData.releaseDate);
      movieFormData.append('director', formData.director || '');
      movieFormData.append('cast', formData.cast || '');
      movieFormData.append('language', formData.language || '');
      movieFormData.append('subtitle', formData.subtitle || '');
      
      movieFormData.append('genreIds', JSON.stringify(formData.genreIds));
      
      if (formData.poster) {
        movieFormData.append('poster', formData.poster);
      }

      console.log('Form data being sent:', {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        releaseDate: formData.releaseDate,
        director: formData.director,
        cast: formData.cast,
        language: formData.language,
        subtitle: formData.subtitle,
        genreIds: formData.genreIds,
        hasFile: !!formData.poster
      });

      for (let pair of movieFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await movieAPI.createMovie(movieFormData);
      console.log('Create movie response:', response);
      
      toast.success('Thêm phim mới thành công!');
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating movie:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Có lỗi xảy ra khi thêm phim';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      setFormData({ ...formData, poster: file });
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên phim *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Thể loại *</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {genres.map((genre) => (
            <label key={genre.genre_id} className="inline-flex items-center">
              <input
                type="checkbox"
                value={genre.genre_id}
                checked={formData.genreIds.includes(genre.genre_id)}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setFormData({
                    ...formData,
                    genreIds: e.target.checked
                      ? [...formData.genreIds, id]
                      : formData.genreIds.filter(gId => gId !== id)
                  });
                }}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2">{genre.name}</span>
            </label>
          ))}
        </div>
        {errors.genreIds && <p className="mt-1 text-sm text-red-600">{errors.genreIds}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Thời lượng (phút) *</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày khởi chiếu *</label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.releaseDate && <p className="mt-1 text-sm text-red-600">{errors.releaseDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Đạo diễn</label>
          <input
            type="text"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Diễn viên</label>
          <input
            type="text"
            value={formData.cast}
            onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngôn ngữ</label>
          <input
            type="text"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phụ đề</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Poster *</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePosterChange}
          className="mt-1 block w-full"
        />
        {posterPreview && (
          <img
            src={posterPreview}
            alt="Preview"
            className="mt-2 h-32 w-auto object-cover rounded"
          />
        )}
        {errors.poster && <p className="mt-1 text-sm text-red-600">{errors.poster}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Đang xử lý...' : 'Thêm phim'}
        </button>
      </div>
    </form>
  );
}

export default MovieForm; 