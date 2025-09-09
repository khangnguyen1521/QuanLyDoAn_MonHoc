import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  type = 'text',
  icon: Icon,
  required = false,
  showPasswordToggle = false,
  isValid = false,
  validMessage = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    if (type === 'password') {
      setShowPassword(!showPassword);
      setInputType(showPassword ? 'password' : 'text');
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={clsx(
            'w-full py-2.5 sm:py-3 border rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
            Icon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4',
            (showPasswordToggle && type === 'password') ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4',
            error 
              ? 'border-red-500 bg-red-50 focus:ring-red-500' 
              : isValid 
              ? 'border-green-500 bg-green-50 focus:ring-green-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
            className
          )}
          {...props}
        />
        
        {/* Left Icon */}
        {Icon && (
          <Icon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        )}
        
        {/* Password Toggle Button */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {isValid && validMessage && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {validMessage}
        </p>
      )}
      
      {helperText && !error && !isValid && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
