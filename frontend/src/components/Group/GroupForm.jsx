import React, { useState } from 'react';
import { groupsHelpers } from '../../services/groupsAPI';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

const GroupForm = ({ initialData = null, onSubmit, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    ten_nhom: initialData?.ten_nhom || '',
    mo_ta: initialData?.mo_ta || '',
    tien_te_mac_dinh: initialData?.tien_te_mac_dinh || 'VND',
    kieu_chia_mac_dinh: initialData?.kieu_chia_mac_dinh || 'deu',
    trang_thai: initialData?.trang_thai || 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    const validation = groupsHelpers.validateGroupData(formData);
    
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('Tên nhóm')) {
          newErrors.ten_nhom = error;
        } else if (error.includes('Mô tả')) {
          newErrors.mo_ta = error;
        } else if (error.includes('Tiền tệ')) {
          newErrors.tien_te_mac_dinh = error;
        } else if (error.includes('Kiểu chia')) {
          newErrors.kieu_chia_mac_dinh = error;
        }
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tên nhóm */}
      <div>
        <Input
          label="Tên nhóm"
          name="ten_nhom"
          value={formData.ten_nhom}
          onChange={handleChange}
          placeholder="Nhập tên nhóm..."
          required
          error={errors.ten_nhom}
          maxLength={100}
        />
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mô tả
        </label>
        <textarea
          name="mo_ta"
          value={formData.mo_ta}
          onChange={handleChange}
          placeholder="Mô tả về nhóm (tùy chọn)..."
          rows={3}
          maxLength={500}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${
            errors.mo_ta ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.mo_ta && (
            <span className="text-red-500 text-sm">{errors.mo_ta}</span>
          )}
          <span className="text-gray-400 text-sm ml-auto">
            {formData.mo_ta.length}/500
          </span>
        </div>
      </div>

      {/* Tiền tệ mặc định */}
      <div>
        <Select
          label="Tiền tệ mặc định"
          name="tien_te_mac_dinh"
          value={formData.tien_te_mac_dinh}
          onChange={handleChange}
          options={groupsHelpers.CURRENCIES}
          error={errors.tien_te_mac_dinh}
        />
      </div>

      {/* Kiểu chia mặc định */}
      <div>
        <Select
          label="Kiểu chia mặc định"
          name="kieu_chia_mac_dinh"
          value={formData.kieu_chia_mac_dinh}
          onChange={handleChange}
          options={groupsHelpers.SPLIT_TYPES}
          error={errors.kieu_chia_mac_dinh}
        />
      </div>

      {/* Trạng thái (chỉ hiển thị khi edit) */}
      {isEdit && (
        <div>
          <Select
            label="Trạng thái"
            name="trang_thai"
            value={formData.trang_thai}
            onChange={handleChange}
            options={groupsHelpers.GROUP_STATUS}
          />
        </div>
      )}

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
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
            </div>
          ) : (
            isEdit ? 'Cập nhật nhóm' : 'Tạo nhóm'
          )}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm;
