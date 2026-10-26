import { cx } from './cx.ts';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'display'; className?: string }) {
  if (size === 'display') {
    return (
      <h1
        className={cx('flex flex-wrap items-baseline font-mono font-semibold text-display text-fg', className)}
        aria-label="Echo Trace"
      >
        <span className="tracking-[0.18em]">ECHO</span>
        <span className="ml-[0.35em] tracking-[0.18em] text-fg-muted">TRACE</span>
        <span
          aria-hidden
          className="ml-1 inline-block h-[0.82em] w-[0.42em] translate-y-[0.06em] animate-blink rounded-[2px] bg-(image:--gradient-echo)"
        />
      </h1>
    );
  }
  return (
    <span
      className={cx(
        'inline-flex items-center font-mono font-semibold text-fg',
        size === 'sm' ? 'text-sm' : 'text-base',
        className,
      )}
    >
      E<span aria-hidden className="ml-px inline-block h-[0.9em] w-[0.4em] rounded-[1px] bg-(image:--gradient-echo)" />
    </span>
  );
}
