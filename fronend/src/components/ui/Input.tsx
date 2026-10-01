import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  inputSize = 'md',
  className = '',
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-3.5 text-sm',
    lg: 'h-11 px-4 text-base'
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#94A3B8] pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          required={required}
          className={`w-full rounded-lg bg-white dark:bg-[#111827] border ${
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#008000] focus:ring-[#008000]/20'
          } text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-[#F1F5F9] dark:disabled:bg-[#1E293B] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${sizeStyles[inputSize]} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#94A3B8] flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  disabled,
  required,
  id,
  rows = 3,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`w-full rounded-lg bg-white dark:bg-[#111827] border ${
          error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#008000] focus:ring-[#008000]/20'
        } p-3 text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-[#F1F5F9] dark:disabled:bg-[#1E293B] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  disabled,
  required,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        disabled={disabled}
        required={required}
        className={`w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-[#111827] border ${
          error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#CBD5E1] dark:border-[#334155] focus:border-[#008000] focus:ring-[#008000]/20'
        } text-[#0F172A] dark:text-[#F8FAFC] transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-[#F1F5F9] dark:disabled:bg-[#1E293B] ${className}`}
        {...props}
      >
        {options ? options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )) : children}
      </select>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export const SearchInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, onClear, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-xs rounded-lg bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#008000] focus:ring-2 focus:ring-[#008000]/20 transition-all"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 text-[#94A3B8] hover:text-[#475569] dark:hover:text-[#F8FAFC]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
