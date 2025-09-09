import React, { useState, useEffect } from 'react';
import { groupsAPI, groupsHelpers } from '../services/groupsAPI';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import GroupForm from '../components/Group/GroupForm';
import GroupCard from '../components/Group/GroupCard';
import AddMemberForm from '../components/Group/AddMemberForm';
import InviteList from '../components/Group/InviteList';
import GroupExpenses from '../components/Group/GroupExpenses';
import DeleteGroupModal from '../components/Group/DeleteGroupModal';
import RemoveMemberModal from '../components/Group/RemoveMemberModal';

const Groups = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  // Auto-refresh groups every 30 seconds if user is active
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if user is not in any modal
      if (!showCreateModal && !showEditModal && !showDetailModal && !showAddMemberModal) {
        loadGroups();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [showCreateModal, showEditModal, showDetailModal, showAddMemberModal]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await groupsAPI.getGroups();
      setGroups(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhóm:', err);
      setError(err.message || 'Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  // Utility function để hiển thị notifications
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await groupsAPI.createGroup(groupData);
      setGroups(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      console.error('Lỗi khi tạo nhóm:', err);
      setError(err.message || 'Không thể tạo nhóm');
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      if (!selectedGroup) return;
      
      const response = await groupsAPI.updateGroup(selectedGroup._id, groupData);
      setGroups(prev => prev.map(group => 
        group._id === selectedGroup._id ? response.data : group
      ));
      setSelectedGroup(response.data);
      setShowEditModal(false);
      setError('');
    } catch (err) {
      console.error('Lỗi khi cập nhật nhóm:', err);
      setError(err.message || 'Không thể cập nhật nhóm');
    }
  };

  const handleDeleteGroup = async (confirmText) => {
    try {
      if (!selectedGroup) return;
      
      await groupsAPI.deleteGroup(selectedGroup._id, confirmText);
      setGroups(prev => prev.filter(group => group._id !== selectedGroup._id));
      setShowDetailModal(false);
      setShowDeleteGroupModal(false);
      setSelectedGroup(null);
      setError('');
    } catch (err) {
      console.error('Lỗi khi xóa nhóm:', err);
      throw err; // Re-throw để modal có thể xử lý error
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      if (!selectedGroup) return;
      
      const response = await groupsAPI.addMember(selectedGroup._id, memberData);
      
      // Luôn là invite_sent bây giờ
      if (response.type === 'invite_sent') {
        // Lời mời được gửi - không cần cập nhật group ngay
        // Modal sẽ hiển thị thông báo thành công
        // Không đóng modal để user có thể thêm thành viên khác
      }
      
      setError('');
      return response; // Return response để AddMemberForm có thể xử lý
    } catch (err) {
      console.error('Lỗi khi gửi lời mời:', err);
      setError(err.message || 'Không thể gửi lời mời');
      throw err; // Re-throw để AddMemberForm có thể xử lý error
    }
  };

  const handleRemoveMember = async (memberId, reason) => {
    try {
      if (!selectedGroup) return;
      
      const response = await groupsAPI.removeMember(selectedGroup._id, memberId, reason);
      const updatedGroup = response.data;
      
      // Check if current user left the group
      const isSelf = memberId === user?.id;
      
      if (isSelf) {
        // User left the group - close modal and show success message
        setGroups(prev => prev.filter(group => group._id !== selectedGroup._id));
        setShowDetailModal(false);
        setSelectedGroup(null);
        setError('');
        
        // Show success notification
        showNotification(
          `Bạn đã rời khỏi nhóm "${selectedGroup.ten_nhom}" thành công!`,
          'success'
        );
        
      } else {
        // Admin removed a member - update both lists and detail view
        setGroups(prev => prev.map(group => 
          group._id === selectedGroup._id ? updatedGroup : group
        ));
        setSelectedGroup(updatedGroup);
        setError('');
        
        // Show notification for successful member removal
        const memberName = response.removed_member?.name || 'Thành viên';
        showNotification(
          `Đã xóa ${memberName} khỏi nhóm`,
          'success'
        );
        
        // Force refresh group list to ensure consistency
        setTimeout(() => {
          loadGroups();
        }, 1000);
      }
    } catch (err) {
      console.error('Lỗi khi xóa thành viên:', err);
      throw err; // Re-throw để modal có thể xử lý error
    }
  };

  const openRemoveMemberModal = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      if (!selectedGroup) return;
      
      const response = await groupsAPI.updateMemberRole(selectedGroup._id, memberId, { vai_tro: newRole });
      const updatedGroup = response.data;
      
      setGroups(prev => prev.map(group => 
        group._id === selectedGroup._id ? updatedGroup : group
      ));
      setSelectedGroup(updatedGroup);
      setError('');
    } catch (err) {
      console.error('Lỗi khi cập nhật vai trò:', err);
      setError(err.message || 'Không thể cập nhật vai trò');
    }
  };

  const openGroupDetail = async (group) => {
    try {
      const response = await groupsAPI.getGroup(group._id);
      setSelectedGroup(response.data);
      setShowDetailModal(true);
      setActiveTab('info'); // Reset to info tab when opening
    } catch (err) {
      console.error('Lỗi khi tải chi tiết nhóm:', err);
      setError(err.message || 'Không thể tải chi tiết nhóm');
    }
  };

  // Function để refresh group detail khi có changes
  const refreshGroupDetail = async () => {
    if (selectedGroup && showDetailModal) {
      try {
        const response = await groupsAPI.getGroup(selectedGroup._id);
        setSelectedGroup(response.data);
        
        // Also update in the main groups list
        setGroups(prev => prev.map(group => 
          group._id === selectedGroup._id ? response.data : group
        ));
      } catch (err) {
        console.error('Lỗi khi refresh group detail:', err);
      }
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản Lý Nhóm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tạo và quản lý các nhóm chia sẻ chi phí
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Nhóm Mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Chưa có nhóm nào</h3>
            <p className="mb-4">Tạo nhóm đầu tiên để bắt đầu chia sẻ chi phí với bạn bè</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tạo Nhóm Đầu Tiên
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              currentUser={user}
              onViewDetail={() => openGroupDetail(group)}
              onEdit={() => openEditModal(group)}
              onDelete={() => {
                setSelectedGroup(group);
                setShowDeleteGroupModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo Nhóm Mới"
      >
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh Sửa Nhóm"
      >
        {selectedGroup && (
          <GroupForm
            initialData={selectedGroup}
            onSubmit={handleUpdateGroup}
            onCancel={() => setShowEditModal(false)}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Group Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi Tiết Nhóm"
        size="lg"
      >
        {selectedGroup && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b dark:border-gray-700">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Thông tin nhóm
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`pb-3 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'expenses'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Chi tiêu & Góp tiền
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Group Info */}
            <div className="border-b dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {selectedGroup.ten_nhom}
              </h3>
              {selectedGroup.mo_ta && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {selectedGroup.mo_ta}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Người tạo:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedGroup.nguoi_tao?.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tiền tệ:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedGroup.tien_te_mac_dinh}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Kiểu chia:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {groupsHelpers.SPLIT_TYPES.find(type => type.value === selectedGroup.kieu_chia_mac_dinh)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(selectedGroup.thoi_gian_tao).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Thành viên ({selectedGroup.thanh_vien?.length || 0})
                </h4>
                {selectedGroup.nguoi_tao._id === user?.id && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Thêm thành viên
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {selectedGroup.thanh_vien?.map((member) => (
                  <div key={member.user_id._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {member.user_id.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.user_id.fullName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.user_id.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.vai_tro === 'admin' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {member.vai_tro === 'admin' ? 'Quản trị' : 'Thành viên'}
                      </span>
                      
                        {/* Role selector for creator */}
                        {selectedGroup.nguoi_tao._id === user?.id && 
                         member.user_id._id !== selectedGroup.nguoi_tao._id && (
                          <select
                            value={member.vai_tro}
                            onChange={(e) => handleUpdateMemberRole(member.user_id._id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 mr-2"
                          >
                            <option value="member">Thành viên</option>
                            <option value="admin">Quản trị</option>
                          </select>
                        )}
                        
                        {/* Delete member button for creator */}
                        {selectedGroup.nguoi_tao._id === user?.id && 
                         member.user_id._id !== selectedGroup.nguoi_tao._id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRemoveMemberModal(member)}
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                          >
                            Xóa
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invites */}
            {selectedGroup.nguoi_tao._id === user?.id && (
              <div className="border-t dark:border-gray-700 pt-6">
                <InviteList 
                  groupId={selectedGroup._id}
                  currentUser={user}
                  onInviteUpdate={() => {
                    // Refresh group detail when invite is updated
                    refreshGroupDetail();
                  }}
                />
              </div>
            )}

                {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
              <div>
                {/* Leave Group button for non-creator members */}
                {selectedGroup.nguoi_tao._id !== user?.id && 
                 groupsHelpers.isGroupMember(selectedGroup, user?.id) && (
                  <Button
                    onClick={() => {
                      const currentUserMember = selectedGroup.thanh_vien.find(member => 
                        member.user_id._id === user.id
                      );
                      if (currentUserMember) {
                        openRemoveMemberModal(currentUserMember);
                      }
                    }}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                  >
                    Rời nhóm
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {selectedGroup.nguoi_tao._id === user?.id && (
                  <>
                    <Button
                      onClick={() => openEditModal(selectedGroup)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      onClick={() => setShowDeleteGroupModal(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa nhóm
                    </Button>
                  </>
                )}
              </div>
            </div>
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <GroupExpenses 
                group={selectedGroup}
                currentUser={user}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Thêm Thành Viên"
      >
        <AddMemberForm
          onSubmit={handleAddMember}
          onCancel={() => setShowAddMemberModal(false)}
        />
      </Modal>

      {/* Delete Group Modal */}
      <DeleteGroupModal
        isOpen={showDeleteGroupModal}
        onClose={() => setShowDeleteGroupModal(false)}
        group={selectedGroup}
        onConfirm={handleDeleteGroup}
      />

      {/* Remove Member Modal */}
      <RemoveMemberModal
        isOpen={showRemoveMemberModal}
        onClose={() => {
          setShowRemoveMemberModal(false);
          setMemberToRemove(null);
        }}
        member={memberToRemove}
        group={selectedGroup}
        currentUser={user}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
};

export default Groups;
