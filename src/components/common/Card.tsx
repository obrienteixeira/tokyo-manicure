
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  // 1. This component provides a styled container for content.
  // 2. It uses a combination of background, border, shadow, and padding for a consistent look.
  return (
    <div className={`bg-surface border border-gray-200/50 rounded-xl shadow-sm p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
