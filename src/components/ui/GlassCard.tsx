import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[#002B5B] mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default GlassCard;