import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-sm',
  hover = false,
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        padding,
        shadow,
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={clsx('border-b border-gray-200 dark:border-gray-700 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={clsx('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={clsx('', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={clsx('border-t border-gray-200 dark:border-gray-700 pt-4 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
