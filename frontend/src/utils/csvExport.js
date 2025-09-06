// CSV Export Utilities
export const exportToCSV = (data, filename) => {
  try {
    const csvContent = convertArrayToCSV(data);
    downloadCSV(csvContent, filename);
    return { success: true };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, error: error.message };
  }
};

// Convert array of objects to CSV string
const convertArrayToCSV = (data) => {
  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (value instanceof Date) {
        return `"${value.toLocaleDateString('vi-VN')}"`;
      }
      return `"${String(value)}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

// Download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  URL.revokeObjectURL(url);
};

// Format transaction data for CSV export
export const formatTransactionsForCSV = (transactions) => {
  return transactions.map(transaction => ({
    'Ngày': new Date(transaction.date).toLocaleDateString('vi-VN'),
    'Loại': transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
    'Tiêu đề': transaction.title || '',
    'Mô tả': transaction.description || '',
    'Danh mục': getCategoryDisplayName(transaction.category),
    'Số tiền': transaction.amount,
    'Phương thức': getPaymentMethodDisplayName(transaction.paymentMethod),
    'Trạng thái': 'Hoàn thành'
  }));
};

// Format goals data for CSV export
export const formatGoalsForCSV = (goals) => {
  return goals.map(goal => ({
    'Tên mục tiêu': goal.title || '',
    'Mô tả': goal.description || '',
    'Số tiền mục tiêu': goal.targetAmount || 0,
    'Số tiền hiện tại': goal.currentAmount || 0,
    'Tiến độ (%)': goal.targetAmount > 0 ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) : 0,
    'Ngày bắt đầu': goal.startDate ? new Date(goal.startDate).toLocaleDateString('vi-VN') : '',
    'Ngày kết thúc': goal.endDate ? new Date(goal.endDate).toLocaleDateString('vi-VN') : '',
    'Trạng thái': goal.status === 'active' ? 'Đang hoạt động' : goal.status === 'completed' ? 'Hoàn thành' : 'Tạm dừng'
  }));
};

// Format reports data for CSV export
export const formatReportsForCSV = (reportData, period) => {
  const { summary, categoryData, monthlyData } = reportData;
  
  // Create summary section
  const summaryRows = [
    { 'Mục': 'Tổng thu nhập', 'Giá trị': summary.totalIncome, 'Đơn vị': 'VND' },
    { 'Mục': 'Tổng chi tiêu', 'Giá trị': summary.totalExpense, 'Đơn vị': 'VND' },
    { 'Mục': 'Tiết kiệm ròng', 'Giá trị': summary.netSavings, 'Đơn vị': 'VND' },
    { 'Mục': 'Số giao dịch', 'Giá trị': summary.transactionCount, 'Đơn vị': 'giao dịch' },
    { 'Mục': 'Tỷ lệ tiết kiệm', 'Giá trị': summary.savingsRate.toFixed(1), 'Đơn vị': '%' }
  ];

  // Add category breakdown
  const categoryRows = categoryData.map(cat => ({
    'Mục': `Chi tiêu ${cat.category}`,
    'Giá trị': cat.amount,
    'Đơn vị': `VND (${cat.percentage.toFixed(1)}%)`
  }));

  // Add monthly data
  const monthlyRows = monthlyData.map(month => ({
    'Mục': `Tháng ${month.month}`,
    'Giá trị': `Thu: ${month.income}, Chi: ${month.expense}, Tiết kiệm: ${month.savings}`,
    'Đơn vị': 'VND'
  }));

  return [...summaryRows, ...categoryRows, ...monthlyRows];
};

// Helper functions for display names
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
  return displayNames[category] || category || 'Khác';
};

const getPaymentMethodDisplayName = (method) => {
  const displayNames = {
    'cash': 'Tiền mặt',
    'card': 'Thẻ',
    'bank_transfer': 'Chuyển khoản',
    'e_wallet': 'Ví điện tử',
    'other': 'Khác'
  };
  return displayNames[method] || method || 'Khác';
};
