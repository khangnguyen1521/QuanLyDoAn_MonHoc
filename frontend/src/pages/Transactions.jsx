import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react';

import TransactionForm from '../components/Transaction/TransactionForm';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { financialAPI } from '../services/financialAPI';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load transactions from API
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await financialAPI.getTransactions();
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa giao dịch này?\n\n` +
                          `"${transaction.title}"\n` +
                          `Số tiền: ${formatCurrency(transaction.amount)}\n\n` +
                          `⚠️ Giao dịch sẽ được xóa vĩnh viễn ! Bạn vẫn muốn xóa ?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // permanent = true để xóa thực sự khỏi database
        const response = await financialAPI.deleteTransaction(transaction._id, true);
        if (response.success) {
          setTransactions(prev => prev.filter(t => t._id !== transaction._id));
          toast.success('Đã xóa giao dịch thành công');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Không thể xóa giao dịch');
      }
    }
  };

  const handleSubmitTransaction = async (transactionData) => {
    try {
      setSubmitting(true);
      
      if (editingTransaction) {
        const response = await financialAPI.updateTransaction(editingTransaction._id, transactionData);
        if (response.success) {
          setTransactions(prev => 
            prev.map(t => t._id === editingTransaction._id ? response.data : t)
          );
          toast.success('Cập nhật giao dịch thành công');
        }
      } else {
        const response = await financialAPI.createTransaction(transactionData);
        if (response.success) {
          setTransactions(prev => [response.data, ...prev]);
          toast.success('Thêm giao dịch thành công');
        }
      }
      
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      
      // Show specific error message
      let errorMessage = editingTransaction ? 'Không thể cập nhật giao dịch' : 'Không thể thêm giao dịch';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('400') || error.message.includes('validation')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchFields = [
      transaction.title || '',
      transaction.description || '',
      transaction.category || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const typeOptions = [
    { value: 'all', label: 'Tất cả giao dịch' },
    { value: 'income', label: 'Thu nhập' },
    { value: 'expense', label: 'Chi tiêu' }
  ];

  // Calculate summary stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpense;

  const getCategoryIcon = (category) => {
    const icons = {
      salary: DollarSign,
      food: '🍽️',
      transport: '🚗',
      bills: '📄',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl -m-4"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Giao dịch
            </h1>
            <p className="text-xl text-gray-600">Quản lý và theo dõi tất cả giao dịch thu chi của bạn</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : `${transactions.length} giao dịch`}
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0">
            <Button 
              onClick={handleAddTransaction}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transform transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm giao dịch
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Tổng thu nhập
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(totalIncome)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {transactions.filter(t => t.type === 'income').length} giao dịch
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Tổng chi tiêu
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(totalExpense)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                {transactions.filter(t => t.type === 'expense').length} giao dịch
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Số dư ròng
              </h3>
              
              <p className={`text-2xl font-black mb-2 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netAmount)}
              </p>
              
              <div className={`flex items-center text-sm font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netAmount >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {netAmount >= 0 ? 'Tích cực' : 'Cần cải thiện'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm giao dịch theo mô tả hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 rounded-2xl border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>
          
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Select
                options={typeOptions}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 py-3 rounded-2xl border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đang tải dữ liệu...</h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giao dịch</h3>
            <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <Button
              onClick={handleAddTransaction}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm giao dịch đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => {
              const isIncome = transaction.type === 'income';
              const CategoryIcon = getCategoryIcon(transaction.category);
              
              return (
                <div key={transaction._id} className="group relative">
                  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100">
                    <div className={`absolute inset-0 bg-gradient-to-br ${isIncome ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Category Icon */}
                        <div className={`w-14 h-14 bg-gradient-to-r ${isIncome ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'} rounded-2xl flex items-center justify-center shadow-lg`}>
                          {typeof CategoryIcon === 'string' ? (
                            <span className="text-2xl">{CategoryIcon}</span>
                          ) : (
                            <CategoryIcon className="h-7 w-7 text-white" />
                          )}
                        </div>
                        
                        {/* Transaction Info */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{transaction.title}</h3>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="capitalize">{transaction.category}</span>
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span className="capitalize">{transaction.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Amount */}
                        <div className="text-right">
                          <p className={`text-2xl font-black ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <div className={`flex items-center text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                            )}
                            {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-3 hover:bg-blue-50 hover:text-blue-600 rounded-2xl"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="p-3 hover:bg-red-50 hover:text-red-600 rounded-2xl"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
        size="lg"
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmitTransaction}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Transactions;