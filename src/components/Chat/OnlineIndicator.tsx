'use client';

import type React from 'react';

interface OnlineIndicatorProps {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline = false,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border-2 
        border-white 
        ${isOnline ? 'bg-green-500' : 'bg-gray-400'} 
        ${className}
      `}
    />
  );
};

export default OnlineIndicator;
