import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';

const TransactionForm = ({ transaction, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: transaction || {
      type: 'expense',
      amount: '',
      title: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    }
  });

  const transactionTypes = [
    { value: 'income', label: 'Thu nhập' },
    { value: 'expense', label: 'Chi tiêu' }
  ];

  const categories = [
    { value: 'food', label: 'Ăn uống' },
    { value: 'transport', label: 'Di chuyển' },
    { value: 'shopping', label: 'Mua sắm' },
    { value: 'entertainment', label: 'Giải trí' },
    { value: 'bills', label: 'Hóa đơn' },
    { value: 'healthcare', label: 'Y tế' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'salary', label: 'Lương' },
    { value: 'investment', label: 'Đầu tư' },
    { value: 'other', label: 'Khác' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'e_wallet', label: 'Ví điện tử' },
    { value: 'other', label: 'Khác' }
  ];

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Loại giao dịch"
          options={transactionTypes}
          {...register('type', { required: 'Vui lòng chọn loại giao dịch' })}
          error={errors.type?.message}
        />
        
        <Input
          label="Số tiền"
          type="number"
          step="0.01"
          placeholder="0"
          {...register('amount', { 
            required: 'Vui lòng nhập số tiền',
            min: { value: 0.01, message: 'Số tiền phải lớn hơn 0' }
          })}
          error={errors.amount?.message}
        />
      </div>

      <Input
        label="Tiêu đề"
        placeholder="Nhập tiêu đề giao dịch..."
        {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
        error={errors.title?.message}
      />

      <Input
        label="Mô tả"
        placeholder="Nhập mô tả chi tiết (tùy chọn)..."
        {...register('description')}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Danh mục"
          options={categories}
          placeholder="Chọn danh mục"
          {...register('category', { required: 'Vui lòng chọn danh mục' })}
          error={errors.category?.message}
        />
        
        <Select
          label="Phương thức thanh toán"
          options={paymentMethods}
          {...register('paymentMethod', { required: 'Vui lòng chọn phương thức thanh toán' })}
          error={errors.paymentMethod?.message}
        />
      </div>

      <Input
        label="Ngày"
        type="date"
        {...register('date', { required: 'Vui lòng chọn ngày' })}
        error={errors.date?.message}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={loading || isSubmitting}
          disabled={loading || isSubmitting}
        >
          {transaction ? 'Cập nhật' : 'Thêm giao dịch'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
