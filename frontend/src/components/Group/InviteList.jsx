import React, { useState, useEffect } from 'react';
import { inviteAPI, inviteHelpers } from '../../services/inviteAPI';
import Button from '../UI/Button';
import Card from '../UI/Card';

const InviteList = ({ groupId, currentUser, onInviteUpdate }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId) {
      loadInvites();
    }
  }, [groupId]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inviteAPI.getGroupInvites(groupId);
      setInvites(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách lời mời:', err);
      setError(err.message || 'Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lời mời này?')) {
      return;
    }

    try {
      await inviteAPI.cancelInvite(inviteId);
      setInvites(prev => prev.filter(invite => invite._id !== inviteId));
      setError('');
      if (onInviteUpdate) {
        onInviteUpdate();
      }
    } catch (err) {
      console.error('Lỗi khi hủy lời mời:', err);
      setError(err.message || 'Không thể hủy lời mời');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p>Chưa có lời mời nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white">
        Lời mời đang chờ ({invites.length})
      </h4>
      
      <div className="space-y-3">
        {invites.map((invite) => {
          const formattedInvite = inviteHelpers.formatInvite(invite);
          
          return (
            <Card key={invite._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                      {invite.email_duoc_moi.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invite.email_duoc_moi}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Được mời bởi {invite.nguoi_moi?.fullName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${formattedInvite.status_color}`}>
                      {formattedInvite.status_text}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invite.vai_tro === 'admin' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {invite.vai_tro === 'admin' ? 'Quản trị' : 'Thành viên'}
                    </span>
                    
                    <span className="text-gray-500 dark:text-gray-400">
                      {formattedInvite.expiry_status}
                    </span>
                  </div>
                  
                  {invite.ghi_chu && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      💬 {invite.ghi_chu}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Gửi lúc {formattedInvite.thoi_gian_gui_formatted}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {invite.trang_thai === 'pending' && !formattedInvite.is_expired && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelInvite(invite._id)}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={loadInvites}
          className="text-gray-600 dark:text-gray-400"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </Button>
      </div>
    </div>
  );
};

export default InviteList;
