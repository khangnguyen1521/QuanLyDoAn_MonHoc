import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income';
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isIncome ? 'bg-success-100' : 'bg-danger-100'
          }`}>
            {isIncome ? (
              <TrendingUp className="h-5 w-5 text-success-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-danger-600" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <p className="text-sm text-gray-500">{transaction.category}</p>
            <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className={`font-semibold ${
              isIncome ? 'text-success-600' : 'text-danger-600'
            }`}>
              {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
            </p>
            {transaction.wallet && (
              <p className="text-xs text-gray-500">{transaction.wallet}</p>
            )}
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
              className="p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction)}
              className="p-2 text-danger-600 hover:bg-danger-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
