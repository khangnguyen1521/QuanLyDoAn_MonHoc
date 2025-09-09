import React from 'react';
import { groupsHelpers } from '../../services/groupsAPI';
import Card from '../UI/Card';
import Button from '../UI/Button';

const GroupCard = ({ group, currentUser, onViewDetail, onEdit, onDelete }) => {
  // Show loading state if user is not loaded yet
  if (!currentUser) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 opacity-50">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const isAdmin = groupsHelpers.isGroupAdmin(group, currentUser?.id);
  const isCreator = group.nguoi_tao?._id === currentUser?.id;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Tạm dừng';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {group.ten_nhom}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(group.trang_thai)}`}>
                {getStatusText(group.trang_thai)}
              </span>
              {isCreator && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Người tạo
                </span>
              )}
              {isAdmin && !isCreator && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Quản trị
                </span>
              )}
            </div>
          </div>
          
          {/* Dropdown menu */}
          <div className="relative group">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={onViewDetail}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Xem chi tiết
                </button>
                {isAdmin && (
                  <button
                    onClick={onEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Chỉnh sửa
                  </button>
                )}
                {isCreator && (
                  <button
                    onClick={onDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Xóa nhóm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.mo_ta && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {group.mo_ta}
          </p>
        )}

        {/* Group Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Thành viên:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              {group.so_luong_thanh_vien || group.thanh_vien?.length || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tiền tệ:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              {group.tien_te_mac_dinh}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Người tạo:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              {group.nguoi_tao?.fullName || 'Không xác định'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              {formatDate(group.thoi_gian_tao)}
            </span>
          </div>
        </div>

        {/* Split Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Kiểu chia:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {groupsHelpers.SPLIT_TYPES.find(type => type.value === group.kieu_chia_mac_dinh)?.label || group.kieu_chia_mac_dinh}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t dark:border-gray-700">
          {/* Always show primary actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetail}
              className="flex-1"
            >
              Xem chi tiết
            </Button>
            {/* Creator-only buttons */}
            {isCreator && (
              <>
                <Button
                  size="sm"
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="sm"
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xóa nhóm
                </Button>
              </>
            )}
          </div>
          
        </div>
      </div>
    </Card>
  );
};

export default GroupCard;
