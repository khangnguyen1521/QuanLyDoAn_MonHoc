import React, { useState } from 'react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const DeleteGroupModal = ({ isOpen, onClose, group, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (confirmText !== group?.ten_nhom) {
      setError('Tên nhóm không chính xác');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(confirmText);
      setConfirmText('');
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError('');
    onClose();
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Xóa Nhóm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Cảnh báo: Hành động này không thể hoàn tác!
              </h3>
              <div className="text-sm text-red-700 dark:text-red-300 mt-2">
                <p>Xóa nhóm sẽ:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Xóa vĩnh viễn nhóm "<strong>{group.ten_nhom}</strong>"</li>
                  <li>Xóa tất cả {group.thanh_vien?.length || 0} thành viên khỏi nhóm</li>
                  <li>Xóa tất cả lời mời đang chờ</li>
                  <li>Xóa toàn bộ lịch sử và dữ liệu liên quan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Thông tin nhóm sẽ bị xóa:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Tên nhóm:</span>
              <span className="font-medium text-gray-900 dark:text-white">{group.ten_nhom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Số thành viên:</span>
              <span className="font-medium text-gray-900 dark:text-white">{group.thanh_vien?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(group.thoi_gian_tao).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Để xác nhận, vui lòng nhập tên nhóm: <strong>"{group.ten_nhom}"</strong>
          </label>
          <Input
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError('');
            }}
            placeholder={`Nhập "${group.ten_nhom}" để xác nhận`}
            error={error}
            autoComplete="off"
            className={confirmText === group.ten_nhom ? 'border-green-500' : ''}
          />
          {confirmText === group.ten_nhom && (
            <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Tên nhóm chính xác
            </p>
          )}
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
            disabled={loading || confirmText !== group.ten_nhom}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xóa...
              </div>
            ) : (
              'Xóa nhóm vĩnh viễn'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteGroupModal;
