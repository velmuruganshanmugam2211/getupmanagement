import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  const variantStyles = {
    brand: 'bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#008000] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#166534]',
    success: 'bg-[#F0FDF4] dark:bg-[#14532D]/40 text-[#16A34A] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#166534]',
    warning: 'bg-[#FFFBEB] dark:bg-[#78350F]/30 text-[#D97706] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#92400E]',
    danger: 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#DC2626] dark:text-[#F87171] border border-[#FECACA] dark:border-[#991B1B]',
    info: 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1E40AF]',
    neutral: 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]',
    outline: 'bg-transparent text-[#64748B] dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#475569]'
  };

  const dotColors = {
    brand: 'bg-[#008000]',
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#DC2626]',
    info: 'bg-[#2563EB]',
    neutral: 'bg-[#64748B]',
    outline: 'bg-[#94A3B8]'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const s = status.toLowerCase();
  let variant: BadgeProps['variant'] = 'neutral';

  if (['active', 'paid', 'completed', 'published', 'on_track', 'running', 'ready'].includes(s)) {
    variant = 'success';
  } else if (['in progress', 'review', 'internal review', 'partial', 'scheduled', 'at_risk', 'planned'].includes(s)) {
    variant = 'warning';
  } else if (['overdue', 'danger', 'failed', 'cancelled'].includes(s)) {
    variant = 'danger';
  } else if (['idea', 'assigned', 'todo', 'draft', 'info'].includes(s)) {
    variant = 'info';
  } else if (['paused', 'archived', 'pending'].includes(s)) {
    variant = 'neutral';
  }

  // Format label
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return <Badge variant={variant} size={size} dot>{label}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: string; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const p = priority.toLowerCase();
  let variant: BadgeProps['variant'] = 'neutral';

  if (p === 'urgent') variant = 'danger';
  else if (p === 'high') variant = 'warning';
  else if (p === 'medium') variant = 'info';
  else variant = 'neutral';

  return <Badge variant={variant} size={size}>{priority}</Badge>;
};
