import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx.ts';
import { Kbd } from './Kbd.tsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-signal text-void hover:bg-signal-strong font-medium',
  secondary: 'bg-raised text-fg border border-line-strong hover:border-signal-line shadow-inset',
  ghost: 'text-fg-muted hover:text-fg hover:bg-raised',
  danger: 'bg-danger-soft text-danger-strong border border-danger-line hover:bg-danger/20',
};

const SIZES: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-[34px] px-3.5 text-sm gap-2',
  lg: 'h-[42px] px-5 text-base gap-2.5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  kbd?: string;
}

export function Button({ variant = 'secondary', size = 'md', icon, kbd, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex select-none items-center justify-center rounded-sm transition-colors duration-(--duration-fast) ease-(--ease-out)',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {kbd && <Kbd className={variant === 'primary' ? 'ml-1 border-void/20 bg-void/10 text-void' : 'ml-1'}>{kbd}</Kbd>}
    </button>
  );
}
