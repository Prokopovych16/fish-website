'use client';

import { clsx } from 'clsx';
import { Shine } from '../shared/interactive';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    const base =
      'group relative inline-flex items-center justify-center overflow-hidden font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

    const sizes = {
      sm: 'rounded-lg px-4 py-2 text-xs',
      md: 'rounded-lg px-5 py-2.5 text-sm',
      lg: 'rounded-lg px-6 py-3 text-base',
    };

    const variants = {
      primary:
        'bg-dark text-white shadow-[0_10px_30px_rgba(22,24,28,0.18)] hover:-translate-y-0.5 hover:bg-dark-700 hover:shadow-[0_14px_36px_rgba(22,24,28,0.26)]',
      secondary: 'border border-dark/15 bg-white text-dark hover:border-dark hover:bg-dark hover:text-white',
      ghost: 'bg-white/10 text-white hover:bg-white/20',
      outline: 'border border-white/40 text-white bg-transparent hover:bg-white/10',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {variant === 'primary' && <Shine />}
        <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
