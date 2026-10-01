import React from 'react';

export interface ProgressBarProps {
  value: number; // completed
  max: number; // allocated
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = false,
  size = 'md',
  color = 'brand',
  className = ''
}) => {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const isOverDelivered = value > max;

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5'
  };

  const fillColors = {
    brand: 'bg-[#008000]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#DC2626]',
    info: 'bg-[#2563EB]'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">
            {value} / {max}
            {isOverDelivered && (
              <span className="text-[#008000] dark:text-[#4ADE80] font-semibold ml-1.5">
                (+{value - max} over)
              </span>
            )}
          </span>
          <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold">
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full ${heightStyles[size]} bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden`}>
        <div
          className={`${heightStyles[size]} ${fillColors[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CircularProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}> = ({ percentage, size = 64, strokeWidth = 6, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="text-[#E2E8F0] dark:text-[#1E293B]"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-[#008000] transition-all duration-500 ease-out"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          {percentage}%
        </span>
      </div>
      {label && <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">{label}</span>}
    </div>
  );
};
