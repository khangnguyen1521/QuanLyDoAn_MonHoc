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
    <Card className="hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-4">
        {/* Header - Mobile */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 truncate">
              {group.ten_nhom}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(group.trang_thai)}`}>
                {getStatusText(group.trang_thai)}
              </span>
              {isCreator && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  👑 Người tạo
                </span>
              )}
              {isAdmin && !isCreator && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  🛡️ Admin
                </span>
              )}
            </div>
          </div>
          
          {/* Quick Actions - Mobile */}
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onViewDetail}
              className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              title="Xem chi tiết"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="p-2 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg"
                title="Chỉnh sửa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            {isCreator && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg"
                title="Xóa nhóm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Description - Mobile */}
        {group.mo_ta && (
          <p className="text-gray-600 dark:text-gray-400 text-sm overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {group.mo_ta}
          </p>
        )}

        {/* Group Info - Mobile Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">👥 Thành viên</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {group.so_luong_thanh_vien || group.thanh_vien?.length || 0}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">💰 Tiền tệ</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {group.tien_te_mac_dinh}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 col-span-2">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">📅 Ngày tạo</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {formatDate(group.thoi_gian_tao)}
            </div>
          </div>
        </div>

        {/* Split Type - Mobile */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">🔄 Kiểu chia:</span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {groupsHelpers.SPLIT_TYPES.find(type => type.value === group.kieu_chia_mac_dinh)?.label || group.kieu_chia_mac_dinh}
            </span>
          </div>
        </div>

        {/* Main Action Button - Mobile */}
        <Button
          onClick={onViewDetail}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg"
        >
          📊 Xem chi tiết nhóm
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block space-y-4">
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
          <p className="text-gray-600 dark:text-gray-400 text-sm overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
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
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetail}
              className="flex-1"
            >
              Xem chi tiết
            </Button>
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
