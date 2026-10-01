import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-card shadow-xs ${
        hoverEffect ? 'hover:shadow-sm hover:border-[#CBD5E1] dark:hover:border-[#334155] transition-all duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  caption?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  caption,
  icon,
  onClick,
  className = ''
}) => {
  return (
    <Card 
      onClick={onClick}
      hoverEffect={!!onClick}
      className={`p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] flex items-center justify-center shrink-0 border border-[#BBF7D0] dark:border-[#166534]/50">
            {icon}
          </div>
        )}
      </div>

      {(change || caption) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                changeType === 'positive' 
                  ? 'text-[#16A34A] bg-[#DCFCE7] dark:bg-[#14532D]/60' 
                  : changeType === 'negative' 
                  ? 'text-[#DC2626] bg-[#FEE2E2] dark:bg-[#7F1D1D]/60' 
                  : 'text-[#64748B] bg-[#F1F5F9] dark:bg-[#1E293B]'
              }`}
            >
              {change}
            </span>
          )}
          {caption && <span className="text-[#64748B] dark:text-[#94A3B8] truncate">{caption}</span>}
        </div>
      )}
    </Card>
  );
};
