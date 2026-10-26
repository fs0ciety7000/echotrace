import type { ReactNode } from 'react';
import { cx } from './cx.ts';

export interface PanelProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Elevation level 1 container with the standard 40px header. */
export function Panel({ eyebrow, title, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={cx('flex min-h-0 flex-col overflow-hidden rounded-md border border-line bg-surface', className)}
    >
      {(eyebrow || title || actions) && (
        <header className="flex h-10 shrink-0 items-center gap-3 border-b border-line px-4">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {title && <span className="truncate text-sm font-medium text-fg">{title}</span>}
          {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
        </header>
      )}
      <div className={cx('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
