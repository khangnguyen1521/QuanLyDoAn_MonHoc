import React from 'react';
import { clsx } from 'clsx';

const Grid = ({ 
  children, 
  cols = 1,
  gap = 'default',
  className = '',
  responsive = true,
  ...props 
}) => {
  const getColsClass = () => {
    if (typeof cols === 'number') {
      if (responsive) {
        // Auto responsive breakpoints
        if (cols === 1) return 'grid-cols-1';
        if (cols === 2) return 'grid-cols-1 sm:grid-cols-2';
        if (cols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        if (cols === 4) return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4';
        if (cols >= 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-' + cols;
      }
      return `grid-cols-${cols}`;
    }
    return cols; // Custom responsive string
  };

  const gaps = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    default: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12',
  };

  return (
    <div 
      className={clsx(
        'grid',
        getColsClass(),
        gaps[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Grid;
