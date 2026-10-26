import type { ReactNode } from 'react';
import { cx } from './cx.ts';

export type Tone = 'neutral' | 'signal' | 'trace' | 'echo' | 'warn' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'bg-raised text-fg-muted border-line',
  signal: 'bg-signal-soft text-signal-strong border-signal-line',
  trace: 'bg-trace-soft text-trace-strong border-trace-line',
  echo: 'bg-echo-soft text-echo-strong border-echo-line',
  warn: 'bg-warn-soft text-warn-strong border-warn-line',
  danger: 'bg-danger-soft text-danger-strong border-danger-line',
};

export const DOT: Record<Tone, string> = {
  neutral: 'bg-fg-subtle',
  signal: 'bg-signal',
  trace: 'bg-trace',
  echo: 'bg-echo',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-px font-mono text-xs',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  tone = 'signal',
  pulse = false,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-block size-1.5 shrink-0 rounded-full',
        DOT[tone],
        pulse && 'animate-pulse-signal',
        className,
      )}
    />
  );
}
