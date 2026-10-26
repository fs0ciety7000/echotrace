import type { ReactNode } from 'react';
import { cx } from './cx.ts';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs border border-line-strong bg-raised px-1 font-mono text-[11px] leading-none text-fg-muted shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
