import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = 'primary',
  className,
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary: 'bg-amber-600 text-slate-950 hover:bg-amber-500 shadow-md shadow-amber-500/20',
    secondary: 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700',
    outline: 'border-2 border-amber-500 text-amber-500 bg-transparent hover:bg-amber-100',
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantStyles[variant]} ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
Button.displayName = 'Button';