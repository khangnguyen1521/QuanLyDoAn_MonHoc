import React, { useState } from 'react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const RemoveMemberModal = ({ isOpen, onClose, member, group, currentUser, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      await onConfirm(member.user_id._id, reason);
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa thành viên');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!member || !group) return null;

  const isSelf = member.user_id._id === currentUser?._id;
  const isCreator = member.user_id._id === group.nguoi_tao._id;
  const isAdmin = member.vai_tro === 'admin';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSelf ? "Rời Khỏi Nhóm" : "Xóa Thành Viên"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Member Info */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {member.user_id.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {member.user_id.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {member.user_id.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                isAdmin 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {isAdmin ? 'Quản trị viên' : 'Thành viên'}
              </span>
              {isCreator && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Người tạo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warning for special cases */}
        {isAdmin && !isSelf && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Cảnh báo: Xóa Quản trị viên
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Bạn đang xóa một quản trị viên khỏi nhóm. Họ sẽ mất tất cả quyền quản lý nhóm.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSelf && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Rời khỏi nhóm
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Bạn sẽ không còn thể truy cập nhóm "{group.ten_nhom}" sau khi rời. Bạn cần được mời lại để tham gia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reason Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isSelf ? 'Lý do rời nhóm (tùy chọn)' : 'Lý do xóa thành viên (tùy chọn)'}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isSelf ? 'Ví dụ: Không còn thời gian tham gia...' : 'Ví dụ: Vi phạm quy định nhóm...'}
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-gray-400 text-sm">
              {reason.length}/200
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={`${isSelf ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              isSelf ? 'Rời nhóm' : 'Xóa thành viên'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RemoveMemberModal;
