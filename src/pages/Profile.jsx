import { useState, useEffect } from 'react'
import userAPI from '../services/userAPI'
import { toast } from 'react-toastify'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await userAPI.getProfile()
      setProfile(data)
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
      
      {profile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ tên</label>
            <p className="mt-1 text-gray-900">{profile.full_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{profile.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <p className="mt-1 text-gray-900">{profile.phone_number || 'Chưa cập nhật'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
              </span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày tạo tài khoản</label>
            <p className="mt-1 text-gray-900">
              {new Date(profile.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 