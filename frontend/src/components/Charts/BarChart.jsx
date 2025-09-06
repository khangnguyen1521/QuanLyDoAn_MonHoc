import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, title, height = 300, type = 'monthly' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            📈
          </div>
          <p className="font-semibold">Chưa có dữ liệu</p>
          <p className="text-sm">Thêm giao dịch để xem biểu đồ</p>
        </div>
      </div>
    );
  }

  let chartData;

  if (type === 'category') {
    // For category data
    chartData = {
      labels: data.map(item => item.category),
      datasets: [
        {
          label: 'Chi tiêu',
          data: data.map(item => item.amount),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(147, 51, 234, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(20, 184, 166, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(107, 114, 128, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  } else {
    // For monthly data
    chartData = {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Thu nhập',
          data: data.map(item => item.income),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Chi tiêu',
          data: data.map(item => item.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Tiết kiệm',
          data: data.map(item => item.savings),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const formattedValue = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value);
            
            if (type === 'category') {
              const percentage = data[context.dataIndex]?.percentage || 0;
              return `${label}: ${formattedValue} (${percentage.toFixed(1)}%)`;
            }
            
            return `${label}: ${formattedValue}`;
          },
          footer: function(tooltipItems) {
            const dataIndex = tooltipItems[0].dataIndex;
            const itemData = data[dataIndex];
            
            if (type === 'category' && itemData?.transactionCount) {
              return `Số giao dịch: ${itemData.transactionCount}`;
            } else if (type === 'monthly' && itemData?.growth !== undefined) {
              const growth = itemData.growth || 0;
              const growthText = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
              return `Tăng trưởng: ${growthText}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '600'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact'
            }).format(value);
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
