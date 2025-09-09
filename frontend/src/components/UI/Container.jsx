import React from 'react';
import { clsx } from 'clsx';

const Container = ({ 
  children, 
  className = '', 
  size = 'default',
  padding = 'default',
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-screen-xl',
    full: 'max-w-full',
  };

  const paddings = {
    none: '',
    sm: 'px-4 sm:px-6',
    default: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  };

  return (
    <div 
      className={clsx(
        'mx-auto w-full',
        sizes[size],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
