import React, { useState } from 'react';
import { groupsHelpers } from '../../services/groupsAPI';
import { inviteHelpers } from '../../services/inviteAPI';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

const AddMemberForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    vai_tro: 'member',
    ghi_chu: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!inviteHelpers.validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate role
    if (!formData.vai_tro) {
      newErrors.vai_tro = 'Vai trò là bắt buộc';
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
    setResult(null);
    try {
      const response = await onSubmit(formData);
      setResult({
        success: true,
        message: response.message,
        type: response.type
      });
      
      // Reset form
      setFormData({
        email: '',
        vai_tro: 'member',
        ghi_chu: ''
      });
    } catch (error) {
      console.error('Lỗi khi thêm thành viên:', error);
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <Input
          label="Email thành viên"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Nhập email của thành viên..."
          required
          error={errors.email}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Nhập email của người bạn muốn thêm vào nhóm
        </p>
      </div>

      {/* Vai trò */}
      <div>
        <Select
          label="Vai trò"
          name="vai_tro"
          value={formData.vai_tro}
          onChange={handleChange}
          options={groupsHelpers.MEMBER_ROLES}
          error={errors.vai_tro}
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <p><strong>Thành viên:</strong> Có thể xem thông tin nhóm và tham gia chia sẻ chi phí</p>
          <p><strong>Quản trị viên:</strong> Có thể thêm/xóa thành viên và chỉnh sửa thông tin nhóm</p>
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ghi chú (tùy chọn)
        </label>
        <textarea
          name="ghi_chu"
          value={formData.ghi_chu}
          onChange={handleChange}
          placeholder="Thêm ghi chú cho lời mời..."
          rows={2}
          maxLength={200}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${
            errors.ghi_chu ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.ghi_chu && (
            <span className="text-red-500 text-sm">{errors.ghi_chu}</span>
          )}
          <span className="text-gray-400 text-sm ml-auto">
            {formData.ghi_chu.length}/200
          </span>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${
              result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {result.success ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {result.message}
              </p>
              {result.success && result.type === 'invite_sent' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {result.user_exists ? (
                    <>📧 Lời mời đã được gửi. Người dùng cần chấp nhận để tham gia nhóm.</>
                  ) : (
                    <>💡 Lời mời sẽ được gửi khi người dùng đăng ký tài khoản với email này.</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Quy trình thêm thành viên
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              <p>• <strong>Email đã có tài khoản:</strong> Gửi lời mời, cần chấp nhận để tham gia</p>
              <p>• <strong>Email chưa có tài khoản:</strong> Gửi lời mời, hiệu lực 7 ngày</p>
              <p>• <strong>Bảo mật:</strong> Tất cả thành viên cần xác nhận trước khi tham gia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang thêm...
            </div>
          ) : (
            'Thêm thành viên'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddMemberForm;
