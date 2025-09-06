import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Eye,
  Download,
  Filter,
  Zap
} from 'lucide-react';

import Select from '../components/UI/Select';
import Button from '../components/UI/Button';
import { financialAPI } from '../services/financialAPI';
import toast from 'react-hot-toast';
import BarChartComponent from '../components/Charts/BarChart';
import { exportToCSV, formatReportsForCSV } from '../utils/csvExport';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const periodOptions = [
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: 'Quý này' },
    { value: 'year', label: 'Năm này' }
  ];

  const yearOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  // Load report data from API
  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Debug logging
      console.log('Loading report data for period:', selectedPeriod, 'year:', selectedYear);
      
      // Get transactions data
      const response = await financialAPI.getTransactions();
      console.log('Transactions API response:', response);
      
      if (response.success) {
        const transactions = response.data;
        console.log('Transactions data:', transactions);
        
        // Process data to create report structure
        const processedData = processTransactionsToReport(transactions, selectedPeriod);
        console.log('Processed report data:', processedData);
        setReportData(processedData);
      } else {
        console.error('API response not successful:', response);
        toast.error('Không thể lấy dữ liệu giao dịch');
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Không thể tải dữ liệu báo cáo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      console.log('Regenerating report for period:', selectedPeriod, 'year:', selectedYear);
      
      // Force reload data
      setReportData(null); // Clear current data first
      await loadReportData();
      
      toast.success('Cập nhật báo cáo thành công');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Không thể tạo báo cáo');
    } finally {
      setGenerating(false);
    }
  };

  // Export report data as CSV
  const handleExportReportCSV = async () => {
    try {
      setExportLoading(true);
      toast.loading('Đang chuẩn bị báo cáo xuất...');

      if (!reportData) {
        throw new Error('Chưa có dữ liệu báo cáo để xuất');
      }

      // Format report data for CSV
      const csvData = formatReportsForCSV(reportData, selectedPeriod);

      // Generate filename with timestamp and period
      const timestamp = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const periodLabel = periodOptions.find(p => p.value === selectedPeriod)?.label || selectedPeriod;
      const yearLabel = selectedYear === 'all' ? 'TatCa' : selectedYear;
      const filename = `BaoCao_${periodLabel}_${yearLabel}_${timestamp}`;

      // Export CSV
      const result = exportToCSV(csvData, filename);
      
      if (result.success) {
        toast.dismiss();
        toast.success(`Đã xuất báo cáo ${periodLabel} thành công!`);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error exporting report:', error);
      toast.dismiss();
      toast.error(`Lỗi xuất báo cáo: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Get data from API or use defaults
  const summaryData = reportData?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    transactionCount: 0,
    savingsRate: 0
  };

  const categoryData = reportData?.categoryData || [];
  const monthlyData = reportData?.monthlyData || [];

  // Debug logging for data display
  console.log('Current summaryData:', summaryData);
  console.log('Current categoryData:', categoryData);
  console.log('Current monthlyData:', monthlyData);
  console.log('Loading state:', loading);

  // Function to process transactions data into report format
  const processTransactionsToReport = (transactions, period) => {
    const now = new Date();
    let startDate, endDate;
    
    // Calculate date range based on period and selected year
    if (selectedYear === 'all') {
      // Show all transactions regardless of year
      switch (period) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
          break;
        case 'year':
          // Show all transactions from all years
          startDate = new Date('2020-01-01');
          endDate = new Date('2030-12-31');
          break;
        default:
          startDate = new Date('2020-01-01');
          endDate = new Date('2030-12-31');
      }
    } else {
      const targetYear = parseInt(selectedYear);
      
      switch (period) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          if (targetYear === now.getFullYear()) {
            startDate = new Date(targetYear, now.getMonth(), 1);
            endDate = new Date(targetYear, now.getMonth() + 1, 0);
          } else {
            // For past/future years, use whole year
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31);
          }
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          if (targetYear === now.getFullYear()) {
            startDate = new Date(targetYear, quarter * 3, 1);
            endDate = new Date(targetYear, quarter * 3 + 3, 0);
          } else {
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31);
          }
          break;
        case 'year':
          startDate = new Date(targetYear, 0, 1);
          endDate = new Date(targetYear, 11, 31);
          break;
        default:
          startDate = new Date(targetYear, 0, 1);
          endDate = new Date(targetYear, 11, 31);
      }
    }

    console.log('Date range calculation:', {
      period,
      selectedYear,
      startDate,
      endDate
    });

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const isInRange = transactionDate >= startDate && transactionDate <= endDate;
      
      // Debug each transaction
      if (!isInRange) {
        console.log('Transaction filtered out:', {
          title: t.title,
          date: t.date,
          transactionDate,
          startDate,
          endDate,
          reason: transactionDate < startDate ? 'before start' : 'after end'
        });
      }
      
      return isInRange;
    });

    console.log('Filtered transactions:', {
      total: transactions.length,
      filtered: filteredTransactions.length,
      dateRange: { startDate, endDate },
      period,
      selectedYear
    });

    // Show all transaction dates for debugging
    console.log('All transaction dates:', transactions.map(t => ({
      title: t.title,
      date: t.date,
      type: t.type,
      amount: t.amount
    })));

    // Calculate summary
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    console.log('Summary calculations:', {
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate
    });

    // Calculate category breakdown
    const categoryMap = new Map();
    const categoryColors = {
      'food': 'from-red-500 to-pink-500',
      'transport': 'from-blue-500 to-cyan-500',
      'shopping': 'from-purple-500 to-indigo-500',
      'bills': 'from-green-500 to-emerald-500',
      'entertainment': 'from-yellow-500 to-orange-500',
      'healthcare': 'from-teal-500 to-cyan-500',
      'education': 'from-indigo-500 to-purple-500',
      'salary': 'from-green-600 to-emerald-600',
      'investment': 'from-blue-600 to-indigo-600',
      'other': 'from-gray-500 to-gray-600'
    };

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'other';
        if (categoryMap.has(category)) {
          categoryMap.set(category, {
            amount: categoryMap.get(category).amount + t.amount,
            count: categoryMap.get(category).count + 1
          });
        } else {
          categoryMap.set(category, { amount: t.amount, count: 1 });
        }
      });

    const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category: getCategoryDisplayName(category),
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      transactionCount: data.count,
      color: categoryColors[category] || 'from-gray-500 to-gray-600'
    })).sort((a, b) => b.amount - a.amount);

    // Generate monthly data for comparison (last 4 months)
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 3; i >= 0; i--) {
      let monthStart, monthEnd;
      
      if (selectedYear === 'all') {
        // Use actual current date for monthly comparison
        monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      } else {
        const targetYear = parseInt(selectedYear);
        monthStart = new Date(targetYear, currentDate.getMonth() - i, 1);
        monthEnd = new Date(targetYear, currentDate.getMonth() - i + 1, 0);
      }
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthSavings = monthIncome - monthExpense;
      
      // Calculate growth compared to previous month
      let growth = 0;
      if (monthlyData.length > 0) {
        const prevSavings = monthlyData[monthlyData.length - 1].savings;
        growth = prevSavings !== 0 ? ((monthSavings - prevSavings) / Math.abs(prevSavings)) * 100 : 0;
      }
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
        income: monthIncome,
        expense: monthExpense,
        savings: monthSavings,
        growth,
        transactionCount: monthTransactions.length
      });
    }

    // Generate insights
    const topCategory = categoryData[0];
    const insights = {
      recommendation: generateRecommendation(savingsRate),
      optimizationTip: generateOptimizationTip(topCategory, categoryData)
    };

    return {
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        transactionCount,
        savingsRate
      },
      categoryData,
      monthlyData,
      insights,
      period,
      dateRange: { startDate, endDate }
    };
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (category) => {
    const displayNames = {
      'food': 'Ăn uống',
      'transport': 'Di chuyển', 
      'shopping': 'Mua sắm',
      'bills': 'Hóa đơn',
      'entertainment': 'Giải trí',
      'healthcare': 'Y tế',
      'education': 'Giáo dục',
      'salary': 'Lương',
      'investment': 'Đầu tư',
      'other': 'Khác'
    };
    return displayNames[category] || category;
  };

  // Helper function to generate recommendation
  const generateRecommendation = (savingsRate) => {
    if (savingsRate >= 30) {
      return `Tuyệt vời! Tỷ lệ tiết kiệm ${savingsRate.toFixed(1)}% của bạn rất tốt. Hãy tiếp tục duy trì!`;
    } else if (savingsRate >= 20) {
      return `Tỷ lệ tiết kiệm ${savingsRate.toFixed(1)}% khá tốt. Hãy thử tăng lên 30% để đạt mục tiêu lý tưởng.`;
    } else if (savingsRate >= 10) {
      return `Tỷ lệ tiết kiệm ${savingsRate.toFixed(1)}% cần cải thiện. Hãy xem xét giảm chi tiêu không cần thiết.`;
    } else if (savingsRate >= 0) {
      return `Tỷ lệ tiết kiệm ${savingsRate.toFixed(1)}% quá thấp. Cần có kế hoạch tài chính rõ ràng hơn.`;
    } else {
      return `Chi tiêu vượt thu nhập ${Math.abs(savingsRate).toFixed(1)}%. Cần cắt giảm chi tiêu ngay lập tức!`;
    }
  };

  // Helper function to generate optimization tip
  const generateOptimizationTip = (topCategory, categoryData) => {
    if (!topCategory || categoryData.length === 0) {
      return 'Hãy thêm các giao dịch để nhận được gợi ý tối ưu hóa chi tiêu từ AI.';
    }

    const categoryTips = {
      'Ăn uống': 'Thử nấu ăn tại nhà nhiều hơn và lập kế hoạch bữa ăn hàng tuần.',
      'Di chuyển': 'Xem xét sử dụng phương tiện công cộng hoặc đi chung xe.',
      'Mua sắm': 'Lập danh sách mua sắm và tránh mua impulsive.',
      'Hóa đơn': 'Kiểm tra và so sánh các gói dịch vụ để tìm lựa chọn tiết kiệm hơn.',
      'Giải trí': 'Tìm các hoạt động giải trí miễn phí hoặc giá rẻ.',
      'Y tế': 'Đầu tư vào sức khỏe phòng ngừa để tránh chi phí y tế cao.',
      'Giáo dục': 'Tìm các khóa học online miễn phí hoặc có giá ưu đãi.',
      'Khác': 'Xem xét kỹ các khoản chi tiêu này và loại bỏ những gì không cần thiết.'
    };

    const tip = categoryTips[topCategory.category] || 'Hãy xem xét kỹ các khoản chi tiêu này.';
    return `Chi tiêu ${topCategory.category.toLowerCase()} chiếm ${topCategory.percentage.toFixed(1)}% tổng chi phí. ${tip}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };



  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl -m-4"></div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Báo cáo
            </h1>
            <p className="text-xl text-gray-600">Phân tích chi tiết và thông minh về tình hình tài chính</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              {loading ? 'Đang tải dữ liệu...' : 
               reportData ? `Hiển thị ${summaryData.transactionCount} giao dịch • ${selectedYear === 'all' ? 'Tất cả năm' : `Năm ${selectedYear}`}` : 
               'Chưa có dữ liệu giao dịch'}
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex gap-3">
            <Select
              options={periodOptions}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-40 rounded-2xl border-gray-200"
            />
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-32 rounded-2xl border-gray-200"
            />
                          <Button
              onClick={handleGenerateReport}
              loading={generating}
              disabled={generating}
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {generating ? 'Đang cập nhật...' : 'Cập nhật báo cáo'}
            </Button>
            <Button
              onClick={handleExportReportCSV}
              disabled={exportLoading || !reportData}
              className="px-6 py-3 rounded-2xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportLoading ? 'Đang xuất...' : 'Xuất CSV'}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          <>
        {/* Total Income */}
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
                {formatCurrency(summaryData.totalIncome || 0)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Tăng trưởng tích cực
              </div>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white rotate-180" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Tổng chi tiêu
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(summaryData.totalExpense || 0)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                Cần kiểm soát
              </div>
            </div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Tiết kiệm ròng
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {formatCurrency(summaryData.netSavings || 0)}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-purple-600">
                <Target className="w-4 h-4 mr-1" />
                Tỷ lệ {(summaryData.savingsRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="group relative">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Số giao dịch
              </h3>
              
              <p className="text-2xl font-black text-gray-900 mb-2">
                {summaryData.transactionCount || 0}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-orange-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                Hoạt động tích cực
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>



      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-purple-600" />
                  Chi tiêu theo danh mục
                </h2>
                <p className="text-gray-600 mt-1">Phân bố chi tiêu trong tháng</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-2xl">
                <Eye className="w-4 h-4 mr-2" />
                Chi tiết
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Category Bar Chart */}
            <div className="mb-6">
              <BarChartComponent 
                data={categoryData} 
                title="Chi tiêu theo danh mục"
                height={300}
                type="category"
              />
            </div>
            
            {/* Category Details List */}
            <div className="space-y-4">
              {loading ? (
                // Loading skeleton for categories
                [...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : categoryData.length > 0 ? (
                categoryData.slice(0, 5).map((item, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.category}</h4>
                        <div className="flex items-center mt-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                            <span className="text-sm font-semibold text-gray-600">{(item.percentage || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">
                        {formatCurrency(item.amount)}
                      </p>
                        <p className="text-sm text-gray-500">
                          {item.transactionCount} giao dịch
                      </p>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có dữ liệu</h3>
                  <p className="text-gray-500">Hãy thêm một số giao dịch để xem phân tích chi tiêu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
                  Xu hướng thu chi
                </h2>
                <p className="text-gray-600 mt-1">Phân tích 4 tháng gần nhất</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-2xl">
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Monthly Trend Bar Chart */}
            <BarChartComponent 
              data={monthlyData} 
              title="Xu hướng thu chi theo tháng"
              height={300}
              type="monthly"
            />
          </div>
        </div>
      </div>



      {/* Monthly Comparison Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-green-600" />
            So sánh theo tháng
          </h2>
          <p className="text-gray-600 mt-1">Chi tiết thu chi 4 tháng gần nhất</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Tháng</th>
                <th className="text-right py-4 px-6 font-bold text-gray-900">Thu nhập</th>
                <th className="text-right py-4 px-6 font-bold text-gray-900">Chi tiêu</th>
                <th className="text-right py-4 px-6 font-bold text-gray-900">Tiết kiệm</th>
                <th className="text-right py-4 px-6 font-bold text-gray-900">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.length > 0 ? monthlyData.map((row, index) => {
                const savings = row.income - row.expense;
                const isPositiveGrowth = (row.growth || 0) > 0;
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3"></div>
                        <span className="font-bold text-gray-900">{row.month}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-green-600 font-bold text-lg">
                        {formatCurrency(row.income)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-red-600 font-bold text-lg">
                        {formatCurrency(row.expense)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-purple-600 font-bold text-lg">
                        {formatCurrency(savings)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className={`flex items-center justify-end font-bold ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositiveGrowth ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {`${(row.growth || 0) > 0 ? '+' : ''}${(row.growth || 0).toFixed(1)}%`}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-semibold">Chưa có dữ liệu tháng</p>
                      <p>Hãy thêm giao dịch để xem so sánh theo tháng</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Thông tin từ AI</h2>
              <p className="opacity-90">Phân tích thông minh dựa trên dữ liệu của bạn</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-lg mb-3 text-yellow-300">🎯 Mục tiêu đề xuất</h3>
              <p className="opacity-90 leading-relaxed">
                {reportData?.insights?.recommendation || 
                 `Với tỷ lệ tiết kiệm hiện tại là ${summaryData.savingsRate.toFixed(1)}%, hãy cố gắng duy trì và cải thiện thêm.`}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-lg mb-3 text-green-300">💡 Gợi ý tối ưu</h3>
              <p className="opacity-90 leading-relaxed">
                {reportData?.insights?.optimizationTip || 
                 'Hãy thêm các giao dịch để nhận được gợi ý tối ưu hóa chi tiêu từ AI.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-6 right-12 w-4 h-4 bg-yellow-300/50 rounded-full"></div>
      </div>
    </div>
  );
};

export default Reports;