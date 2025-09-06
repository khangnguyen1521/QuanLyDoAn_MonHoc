import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Star,
  Clock,
  DollarSign,
  Loader
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import { useForm } from 'react-hook-form';
import { goalsAPI } from '../services/goalsAPI';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    overallProgress: 0
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load goals on component mount
  useEffect(() => {
    loadGoals();
    loadSummary();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await goalsAPI.getGoals();
      setGoals(response.data || []);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await goalsAPI.getGoalsSummary();
      setSummary(response.data || {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        overallProgress: 0
      });
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-indigo-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      transport: '🚗',
      travel: '✈️',
      emergency: '🚨',
      work: '💼',
      home: '🏠',
      education: '📚'
    };
    return icons[category] || '🎯';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'from-red-500 to-pink-500',
      medium: 'from-yellow-500 to-orange-500',
      low: 'from-green-500 to-emerald-500'
    };
    return colors[priority] || 'from-gray-500 to-gray-600';
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddGoal = () => {
    if (activeGoals.length >= 7) {
      alert('Bạn chỉ có thể tạo tối đa 7 mục tiêu đang hoạt động');
      return;
    }
    setEditingGoal(null);
    reset();
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    reset(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goal) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      try {
        await goalsAPI.deleteGoal(goal._id);
        await loadGoals();
        await loadSummary();
      } catch (err) {
        console.error('Error deleting goal:', err);
        alert('Có lỗi xảy ra khi xóa mục tiêu: ' + err.message);
      }
    }
  };

  const handleSubmitGoal = async (data) => {
    try {
      setSubmitting(true);
      const goalData = {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || 0),
        status: 'active',
        category: data.category || 'other',
        priority: data.priority || 'medium'
      };

      if (editingGoal) {
        await goalsAPI.updateGoal(editingGoal._id, goalData);
      } else {
        await goalsAPI.createGoal(goalData);
      }
      
      await loadGoals();
      await loadSummary();
      setIsModalOpen(false);
      setEditingGoal(null);
      reset();
    } catch (err) {
      console.error('Error saving goal:', err);
      alert('Có lỗi xảy ra khi lưu mục tiêu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  // Calculate active goals summary stats for display
  const activeTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const activeCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const activeProgress = activeTargetAmount > 0 ? (activeCurrentAmount / activeTargetAmount) * 100 : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải mục tiêu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={loadGoals}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-3xl -m-4"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Mục tiêu tiết kiệm
            </h1>
            <p className="text-xl text-gray-600">Thiết lập và theo dõi các mục tiêu tài chính của bạn</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <Award className="w-4 h-4 mr-2 text-yellow-500" />
              {completedGoals.length} mục tiêu đã hoàn thành • {activeGoals.length} đang thực hiện
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0">
            <Button 
              onClick={handleAddGoal}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transform transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm mục tiêu
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Tổng mục tiêu
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(activeTargetAmount)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-emerald-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                {activeGoals.length} mục tiêu đang hoạt động
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Đã tiết kiệm
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(activeCurrentAmount)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-blue-600">
                <Zap className="w-4 h-4 mr-1" />
                {activeProgress.toFixed(1)}% hoàn thành
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Đã hoàn thành
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {completedGoals.length}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-yellow-600">
                <Star className="w-4 h-4 mr-1" />
                Thành tích tuyệt vời!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mục tiêu đang thực hiện</h2>
          {activeGoals.length > 0 && (
            <div className="text-sm text-gray-600">
              Tiến độ trung bình: <span className="font-bold text-emerald-600">{activeProgress.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {activeGoals.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có mục tiêu nào</h3>
            <p className="text-gray-600 mb-6">Hãy tạo mục tiêu đầu tiên để bắt đầu hành trình tiết kiệm</p>
            <Button
              onClick={handleAddGoal}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo mục tiêu đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isUrgent = daysRemaining <= 30;
              
              return (
                <div key={goal._id} className="group relative">
                  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{getCategoryIcon(goal.category)}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-3 h-3 bg-gradient-to-r ${getPriorityColor(goal.priority)} rounded-full`}></div>
                              <span className="text-sm text-gray-600 capitalize">{goal.priority} priority</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                            className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-2xl"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal)}
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-2xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="font-bold text-lg">{progress.toFixed(1)}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(goal.deadline)}
                        </div>
                        <div className={`flex items-center text-sm font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {daysRemaining > 0 ? `${daysRemaining} ngày` : 'Đã quá hạn'}
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

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="w-6 h-6 mr-3 text-yellow-500" />
            Mục tiêu đã hoàn thành
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <div key={goal._id} className="group relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
                        <p className="text-sm text-green-600 font-semibold">✅ Đã hoàn thành</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-black text-green-600 mb-2">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                    <div className="flex items-center justify-center text-sm text-green-700">
                      <Star className="w-4 h-4 mr-1" />
                      Thành tích xuất sắc!
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu mới'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleSubmitGoal)} className="space-y-4">
          <Input
            label="Tên mục tiêu"
            placeholder="Ví dụ: Mua xe máy mới"
            {...register('title', { required: 'Vui lòng nhập tên mục tiêu' })}
            error={errors.title?.message}
          />

          <Input
            label="Số tiền mục tiêu"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('targetAmount', { 
              required: 'Vui lòng nhập số tiền mục tiêu',
              min: { value: 1, message: 'Số tiền phải lớn hơn 0' }
            })}
            error={errors.targetAmount?.message}
          />

          <Input
            label="Số tiền hiện tại"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('currentAmount')}
            error={errors.currentAmount?.message}
          />

          <Input
            label="Hạn hoàn thành"
            type="date"
            {...register('deadline', { required: 'Vui lòng chọn hạn hoàn thành' })}
            error={errors.deadline?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="other">Khác</option>
                <option value="transport">Phương tiện</option>
                <option value="travel">Du lịch</option>
                <option value="emergency">Khẩn cấp</option>
                <option value="work">Công việc</option>
                <option value="home">Nhà cửa</option>
                <option value="education">Giáo dục</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="rounded-2xl"
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {editingGoal ? 'Đang cập nhật...' : 'Đang thêm...'}
                </>
              ) : (
                editingGoal ? 'Cập nhật' : 'Thêm mục tiêu'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;