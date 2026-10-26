import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { cx } from './cx.ts';
import { Kbd } from './Kbd.tsx';

const ACCENT = { signal: 'before:bg-signal', echo: 'before:bg-echo', trace: 'before:bg-trace' };

export interface DrawerProps {
  label: string;
  eyebrow: ReactNode;
  onClose: () => void;
  /** Header content under the eyebrow row (title, meta…). */
  header?: ReactNode;
  children: ReactNode;
  accent?: keyof typeof ACCENT;
}

/** Elevation level 3 side sheet (glass), closed with Escape. Used for fiches and comms. */
export function Drawer({ label, eyebrow, onClose, header, children, accent = 'echo' }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('dialog[open]') && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Hand the keyboard back to the terminal when the sheet goes away.
  useEffect(() => () => document.querySelector<HTMLElement>('[data-terminal-input]')?.focus(), []);

  return (
    <aside
      aria-label={label}
      className={cx(
        'glass fixed top-3 right-3 bottom-3 z-30 flex w-[min(460px,calc(100%-1.5rem))] animate-rise flex-col overflow-hidden rounded-lg shadow-modal',
        'before:absolute before:inset-x-0 before:top-0 before:h-px before:opacity-70',
        ACCENT[accent],
      )}
    >
      <header className="border-b border-line px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {eyebrow}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center gap-2 text-fg-subtle hover:text-fg"
            aria-label="Fermer le panneau"
          >
            <Kbd>Échap</Kbd>
            <X size={16} />
          </button>
        </div>
        {header}
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </aside>
  );
}
