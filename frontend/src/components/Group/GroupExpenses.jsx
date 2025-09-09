import React, { useState, useEffect } from 'react';
import { groupExpenseAPI, groupExpenseHelpers } from '../../services/groupExpenseAPI';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import ExpenseForm from './ExpenseForm';

const GroupExpenses = ({ group, currentUser }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    if (group?._id) {
      loadExpenses();
      loadSummary();
    }
  }, [group]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await groupExpenseAPI.getGroupExpenses(group._id);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải chi tiêu:', err);
      setError(err.message || 'Không thể tải chi tiêu');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await groupExpenseAPI.getGroupExpenseSummary(group._id);
      setSummary(response.data);
    } catch (err) {
      console.error('Lỗi khi tải tổng kết:', err);
    }
  };

  const handleCreateExpense = async (expenseData) => {
    try {
      const response = await groupExpenseAPI.createGroupExpense(group._id, expenseData);
      setExpenses(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      loadSummary(); // Reload summary
      setError('');
    } catch (err) {
      console.error('Lỗi khi tạo chi tiêu:', err);
      setError(err.message || 'Không thể tạo chi tiêu');
    }
  };

  const handleUpdatePayment = async (expenseId, userId, status) => {
    try {
      const response = await groupExpenseAPI.updatePaymentStatus(group._id, expenseId, {
        user_id: userId,
        trang_thai: status
      });
      
      setExpenses(prev => prev.map(exp => 
        exp._id === expenseId ? response.data : exp
      ));
      loadSummary(); // Reload summary
      setError('');
    } catch (err) {
      console.error('Lỗi khi cập nhật thanh toán:', err);
      setError(err.message || 'Không thể cập nhật thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'expenses'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Chi tiêu ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Tổng kết
          </button>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm chi tiêu
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Chưa có chi tiêu nào</h3>
                <p className="mb-4">Tạo chi tiêu đầu tiên để bắt đầu chia sẻ với nhóm</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Thêm chi tiêu đầu tiên
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <Card key={expense._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {expense.tieu_de}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {expense.mo_ta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {groupExpenseHelpers.formatCurrency(expense.tong_tien, expense.tien_te)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {groupExpenseHelpers.getCategoryText(expense.danh_muc)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        Trả bởi: <span className="font-medium text-gray-900 dark:text-white">
                          {expense.nguoi_tra.fullName}
                        </span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(expense.ngay_chi_tieu).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {groupExpenseHelpers.getSplitTypeText(expense.kieu_chia)}
                    </span>
                  </div>

                  {/* Payment details for current user */}
                  {expense.phan_chia.map((split) => {
                    if (split.user_id._id !== currentUser?.id) return null;
                    
                    return (
                      <div key={split.user_id._id} className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Phần của bạn: {groupExpenseHelpers.formatCurrency(split.so_tien, expense.tien_te)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {split.phan_tram}% của tổng chi tiêu
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${groupExpenseHelpers.getPaymentStatusColor(split.trang_thai_thanh_toan)}`}>
                              {groupExpenseHelpers.getPaymentStatusText(split.trang_thai_thanh_toan)}
                            </span>
                            {split.trang_thai_thanh_toan === 'chua_tra' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdatePayment(expense._id, currentUser.id, 'da_tra')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Đánh dấu đã trả
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary tab */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-4">
          {/* Overall summary */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tổng quan tài chính
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {groupExpenseHelpers.formatCurrency(summary.summary.tong_chi_tieu, group.tien_te_mac_dinh)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng chi tiêu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {groupExpenseHelpers.formatCurrency(summary.summary.tong_da_thanh_toan, group.tien_te_mac_dinh)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Đã thanh toán</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {groupExpenseHelpers.formatCurrency(summary.summary.tong_chua_thanh_toan, group.tien_te_mac_dinh)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa thanh toán</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {summary.summary.so_luong_chi_tieu}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Số chi tiêu</p>
              </div>
            </div>
          </Card>

          {/* Member summary */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tổng kết theo thành viên
            </h4>
            <div className="space-y-3">
              {Object.entries(summary.summary.theo_thanh_vien).map(([memberId, memberSummary]) => {
                // Find member info (avoid duplicates)
                let member = null;
                let memberName = 'Không xác định';
                
                if (memberId === group.nguoi_tao._id) {
                  // This is the creator
                  member = group.nguoi_tao;
                  memberName = member.fullName;
                } else {
                  // Find in thanh_vien
                  const memberData = group.thanh_vien.find(m => m.user_id._id === memberId);
                  if (memberData) {
                    member = memberData.user_id;
                    memberName = member.fullName;
                  }
                }
                
                return (
                  <div key={memberId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {memberName}
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {groupExpenseHelpers.formatCurrency(memberSummary.tong_phai_tra, group.tien_te_mac_dinh)}
                      </p>
                      <div className="flex space-x-2 text-xs">
                        <span className="text-green-600 dark:text-green-400">
                          Đã trả: {groupExpenseHelpers.formatCurrency(memberSummary.da_thanh_toan, group.tien_te_mac_dinh)}
                        </span>
                        {memberSummary.con_no > 0 && (
                          <span className="text-red-600 dark:text-red-400">
                            Còn nợ: {groupExpenseHelpers.formatCurrency(memberSummary.con_no, group.tien_te_mac_dinh)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Create Expense Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm Chi Tiêu Nhóm"
        size="lg"
      >
        <ExpenseForm
          group={group}
          onSubmit={handleCreateExpense}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default GroupExpenses;
