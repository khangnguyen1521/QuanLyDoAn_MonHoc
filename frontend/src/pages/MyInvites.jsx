import React, { useState, useEffect } from 'react';
import { inviteAPI, inviteHelpers } from '../services/inviteAPI';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const MyInvites = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingInvite, setProcessingInvite] = useState(null);

  useEffect(() => {
    loadMyInvites();
  }, []);

  const loadMyInvites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inviteAPI.getMyInvites();
      setInvites(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải lời mời:', err);
      setError(err.message || 'Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      setProcessingInvite(inviteId);
      const response = await inviteAPI.acceptInvite(inviteId);
      
      // Remove invite from list after accepting
      setInvites(prev => prev.filter(invite => invite._id !== inviteId));
      setError('');
      
      // Show success notification
      const groupName = response.data?.group?.ten_nhom || 'nhóm';
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Đã tham gia nhóm "${groupName}" thành công!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
      
    } catch (err) {
      console.error('Lỗi khi chấp nhận lời mời:', err);
      setError(err.message || 'Không thể chấp nhận lời mời');
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối lời mời này?')) {
      return;
    }

    try {
      setProcessingInvite(inviteId);
      await inviteAPI.declineInvite(inviteId);
      
      // Remove invite from list after declining
      setInvites(prev => prev.filter(invite => invite._id !== inviteId));
      setError('');
    } catch (err) {
      console.error('Lỗi khi từ chối lời mời:', err);
      setError(err.message || 'Không thể từ chối lời mời');
    } finally {
      setProcessingInvite(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Đang tải lời mời...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Lời Mời Của Tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Quản lý các lời mời tham gia nhóm
          </p>
        </div>
        <Button
          onClick={loadMyInvites}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Invites List */}
      {invites.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium mb-2">Không có lời mời nào</h3>
            <p className="text-sm sm:text-base mb-4">Bạn chưa nhận được lời mời tham gia nhóm nào</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {invites.map((invite) => {
            const formattedInvite = inviteHelpers.formatInvite(invite);
            const isProcessing = processingInvite === invite._id;
            
            return (
              <Card key={invite._id} className="p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  {/* Group Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {invite.nhom_id.ten_nhom.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {invite.nhom_id.ten_nhom}
                      </h3>
                      {invite.nhom_id.mo_ta && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {invite.nhom_id.mo_ta}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Invite Details - Mobile */}
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Được mời bởi:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {invite.nguoi_moi.fullName}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Vai trò:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invite.vai_tro === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {invite.vai_tro === 'admin' ? 'Admin' : 'Thành viên'}
                        </span>
                      </div>
                      
                      <span className={`text-xs font-medium ${
                        formattedInvite.is_expired 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {formattedInvite.expiry_status}
                      </span>
                    </div>
                  </div>

                  {/* Actions - Mobile */}
                  {!formattedInvite.is_expired && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        onClick={() => handleAcceptInvite(invite._id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
                        size="sm"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </div>
                        ) : (
                          '✅ Chấp nhận'
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleDeclineInvite(invite._id)}
                        disabled={isProcessing}
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 font-medium py-3 rounded-lg"
                        size="sm"
                      >
                        ❌ Từ chối
                      </Button>
                    </div>
                  )}
                  
                  {formattedInvite.is_expired && (
                    <div className="text-center">
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg text-sm font-medium">
                        ⏰ Đã hết hạn
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Gửi lúc {formattedInvite.thoi_gian_gui_formatted}
                  </p>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Group Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {invite.nhom_id.ten_nhom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {invite.nhom_id.ten_nhom}
                          </h3>
                          {invite.nhom_id.mo_ta && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {invite.nhom_id.mo_ta}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Invite Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Được mời bởi:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {invite.nguoi_moi.fullName} ({invite.nguoi_moi.email})
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Vai trò:
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            invite.vai_tro === 'admin' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {invite.vai_tro === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Hết hạn:
                          </span>
                          <span className={`text-sm font-medium ${
                            formattedInvite.is_expired 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {formattedInvite.expiry_status}
                          </span>
                        </div>

                        {invite.ghi_chu && (
                          <div className="flex items-start space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Ghi chú:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {invite.ghi_chu}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Gửi lúc {formattedInvite.thoi_gian_gui_formatted}
                      </p>
                    </div>

                    {/* Actions - Desktop */}
                    {!formattedInvite.is_expired && (
                      <div className="flex items-center space-x-3 ml-6">
                        <Button
                          onClick={() => handleAcceptInvite(invite._id)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            'Chấp nhận'
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite._id)}
                          disabled={isProcessing}
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                        >
                          Từ chối
                        </Button>
                      </div>
                    )}
                    
                    {formattedInvite.is_expired && (
                      <div className="ml-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full text-sm">
                          Đã hết hạn
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyInvites;
