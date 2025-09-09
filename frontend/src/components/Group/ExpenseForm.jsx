import React, { useState } from 'react';
import { groupExpenseHelpers } from '../../services/groupExpenseAPI';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

const ExpenseForm = ({ group, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    tieu_de: '',
    mo_ta: '',
    tong_tien: '',
    tien_te: group.tien_te_mac_dinh,
    danh_muc: 'khac',
    kieu_chia: group.kieu_chia_mac_dinh,
    nguoi_tra: '',
    ngay_chi_tieu: new Date().toISOString().split('T')[0],
    dia_diem: ''
  });

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitDetails, setSplitDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get all group members including creator (avoid duplicates)
  const allMembers = React.useMemo(() => {
    const members = [];
    
    // Add creator first
    members.push({
      _id: group.nguoi_tao._id, 
      fullName: group.nguoi_tao.fullName,
      email: group.nguoi_tao.email,
      isCreator: true
    });
    
    // Add other members (excluding creator if they're in thanh_vien)
    group.thanh_vien.forEach(member => {
      // Check if this member is not the creator
      if (member.user_id._id !== group.nguoi_tao._id) {
        members.push({
          _id: member.user_id._id,
          fullName: member.user_id.fullName,
          email: member.user_id.email,
          isCreator: false
        });
      }
    });
    
    return members;
  }, [group]);

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

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => {
      const newSelected = prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      // Initialize split details for new members
      if (!prev.includes(memberId)) {
        setSplitDetails(prevSplit => ({
          ...prevSplit,
          [memberId]: {
            so_tien: 0,
            phan_tram: 0,
            co_phan: 1
          }
        }));
      }
      
      return newSelected;
    });
  };

  const handleSplitChange = (memberId, field, value) => {
    setSplitDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const calculateAutoSplit = () => {
    const totalAmount = parseFloat(formData.tong_tien) || 0;
    const memberCount = selectedMembers.length;
    
    if (totalAmount <= 0 || memberCount === 0) return;
    
    const newSplitDetails = {};
    
    selectedMembers.forEach(memberId => {
      switch (formData.kieu_chia) {
        case 'deu':
          const equalAmount = totalAmount / memberCount;
          newSplitDetails[memberId] = {
            so_tien: equalAmount,
            phan_tram: 100 / memberCount,
            co_phan: 1
          };
          break;
        default:
          newSplitDetails[memberId] = splitDetails[memberId] || {
            so_tien: 0,
            phan_tram: 0,
            co_phan: 1
          };
      }
    });
    
    setSplitDetails(newSplitDetails);
  };

  const validateForm = () => {
    const validation = groupExpenseHelpers.validateExpenseData({
      ...formData,
      phan_chia: selectedMembers.map(memberId => ({
        user_id: memberId,
        ...splitDetails[memberId]
      }))
    });
    
    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('Tiêu đề')) newErrors.tieu_de = error;
        if (error.includes('Tổng tiền')) newErrors.tong_tien = error;
        if (error.includes('Người trả')) newErrors.nguoi_tra = error;
        if (error.includes('chia tiền')) newErrors.members = error;
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
      const expenseData = {
        ...formData,
        tong_tien: parseFloat(formData.tong_tien),
        phan_chia: selectedMembers.map(memberId => ({
          user_id: memberId,
          so_tien: splitDetails[memberId]?.so_tien || 0,
          phan_tram: splitDetails[memberId]?.phan_tram || 0,
          co_phan: splitDetails[memberId]?.co_phan || 1,
          trang_thai_thanh_toan: memberId === formData.nguoi_tra ? 'da_tra' : 'chua_tra'
        }))
      };
      
      await onSubmit(expenseData);
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Tiêu đề chi tiêu"
            name="tieu_de"
            value={formData.tieu_de}
            onChange={handleChange}
            placeholder="Ví dụ: Ăn tối nhà hàng..."
            required
            error={errors.tieu_de}
          />
        </div>
        <div>
          <Input
            label="Tổng tiền"
            name="tong_tien"
            type="number"
            value={formData.tong_tien}
            onChange={handleChange}
            placeholder="0"
            required
            error={errors.tong_tien}
            min="0"
            step="1000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mô tả
        </label>
        <textarea
          name="mo_ta"
          value={formData.mo_ta}
          onChange={handleChange}
          placeholder="Mô tả chi tiết về chi tiêu..."
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          label="Danh mục"
          name="danh_muc"
          value={formData.danh_muc}
          onChange={handleChange}
          options={groupExpenseHelpers.CATEGORIES}
        />
        
        <Select
          label="Người trả tiền"
          name="nguoi_tra"
          value={formData.nguoi_tra}
          onChange={handleChange}
          options={allMembers.map(member => ({
            value: member._id,
            label: member.fullName
          }))}
          required
          error={errors.nguoi_tra}
        />
        
        <Input
          label="Ngày chi tiêu"
          name="ngay_chi_tieu"
          type="date"
          value={formData.ngay_chi_tieu}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Địa điểm (tùy chọn)"
        name="dia_diem"
        value={formData.dia_diem}
        onChange={handleChange}
        placeholder="Ví dụ: Nhà hàng ABC..."
      />

      {/* Member Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Chọn thành viên tham gia chia tiền
        </label>
        {errors.members && (
          <p className="text-red-500 text-sm mb-2">{errors.members}</p>
        )}
        <div className="space-y-2">
          {allMembers.map((member) => (
            <label key={member._id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member._id)}
                onChange={() => handleMemberToggle(member._id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {member.fullName}
                  </span>
                  {member.isCreator && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Người tạo
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Split Configuration */}
      {selectedMembers.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cách chia tiền
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={calculateAutoSplit}
            >
              Tính tự động
            </Button>
          </div>
          
          <Select
            name="kieu_chia"
            value={formData.kieu_chia}
            onChange={handleChange}
            options={groupExpenseHelpers.SPLIT_TYPES}
            className="mb-4"
          />

          <div className="space-y-3">
            {selectedMembers.map((memberId) => {
              const member = allMembers.find(m => m._id === memberId);
              const split = splitDetails[memberId] || { so_tien: 0, phan_tram: 0, co_phan: 1 };
              
              return (
                <div key={memberId} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {member.fullName}
                    </span>
                  </div>
                  
                  {formData.kieu_chia === 'tuy_chinh' && (
                    <Input
                      type="number"
                      value={split.so_tien}
                      onChange={(e) => handleSplitChange(memberId, 'so_tien', e.target.value)}
                      placeholder="Số tiền"
                      min="0"
                      className="w-24"
                    />
                  )}
                  
                  {formData.kieu_chia === 'phan_tram' && (
                    <Input
                      type="number"
                      value={split.phan_tram}
                      onChange={(e) => handleSplitChange(memberId, 'phan_tram', e.target.value)}
                      placeholder="%"
                      min="0"
                      max="100"
                      className="w-20"
                    />
                  )}
                  
                  {formData.kieu_chia === 'co_phan' && (
                    <Input
                      type="number"
                      value={split.co_phan}
                      onChange={(e) => handleSplitChange(memberId, 'co_phan', e.target.value)}
                      placeholder="Cổ phần"
                      min="1"
                      className="w-24"
                    />
                  )}
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-20 text-right">
                    {groupExpenseHelpers.formatCurrency(split.so_tien, formData.tien_te)}
                  </span>
                </div>
              );
            })}
          </div>
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
          disabled={loading || selectedMembers.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tạo...
            </div>
          ) : (
            'Tạo chi tiêu'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
