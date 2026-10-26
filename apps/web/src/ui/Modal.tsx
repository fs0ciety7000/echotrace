import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { cx } from './cx.ts';
import { Kbd } from './Kbd.tsx';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  accent?: 'signal' | 'echo' | 'trace';
}

const ACCENT = { signal: 'before:bg-signal', echo: 'before:bg-echo', trace: 'before:bg-trace' };

/** Elevation level 4: glass, veil, focus trap via native <dialog>. */
export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  width = 'max-w-3xl',
  accent = 'signal',
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal() focuses the first focusable (the close button); prefer the primary action.
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cx(
        'glass m-auto w-[calc(100%-2rem)] overflow-hidden rounded-lg p-0 text-fg shadow-modal backdrop:bg-void/70 backdrop:backdrop-blur-[2px]',
        'relative before:absolute before:inset-x-0 before:top-0 before:h-px before:opacity-70',
        ACCENT[accent],
        open && 'animate-rise',
        width,
      )}
    >
      <header className="flex items-start gap-4 border-b border-line px-6 pt-5 pb-4">
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex items-center gap-2 rounded-sm p-1 text-fg-subtle hover:text-fg"
          aria-label="Fermer"
        >
          <Kbd>Échap</Kbd>
          <X size={16} />
        </button>
      </header>
      <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
      {footer && (
        <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>
      )}
    </dialog>
  );
}
