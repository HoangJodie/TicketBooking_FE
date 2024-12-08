import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userAPI from '../services/userAPI';
import { toast } from 'react-toastify';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        console.log('Profile response:', response);

        if (response?.status === 200 && response?.data) {
          setProfile(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-600 text-sm">Email</h3>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm">Họ tên</h3>
              <p className="font-medium">{profile.full_name || 'Chưa cập nhật'}</p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm">Số điện thoại</h3>
              <p className="font-medium">{profile.phone_number || 'Chưa cập nhật'}</p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm">Trạng thái</h3>
              <p className="font-medium">{profile.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm">Ngày tạo tài khoản</h3>
              <p className="font-medium">
                {new Date(profile.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm">Xác thực email</h3>
              <p className="font-medium">
                {profile.email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 