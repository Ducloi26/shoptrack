import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`input-wrapper ${fullWidth ? 'input-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="input-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={`input-control ${icon ? `input-has-icon input-icon-${iconPosition}` : ''}`}>
          {icon && iconPosition === 'left' && (
            <span className="input-icon-el input-icon-left" aria-hidden="true">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input ${error ? 'input-error' : ''} ${className}`}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="input-icon-el input-icon-right" aria-hidden="true">{icon}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="input-error-msg" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="input-hint">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ============================================
// Select — dropdown dùng cùng design system
// ============================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; color?: string }>;
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  fullWidth = true,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
          {props.required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="input-error-msg" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
}
