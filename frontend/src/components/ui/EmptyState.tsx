import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#111827]/40 ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] flex items-center justify-center mb-4 border border-[#BBF7D0] dark:border-[#166534]">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{title}</h4>
      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
