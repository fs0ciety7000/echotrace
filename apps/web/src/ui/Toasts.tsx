import { BookOpen, CheckCircle2, Radar, TriangleAlert } from 'lucide-react';
import { useGame } from '../state/game.ts';
import { cx } from './cx.ts';

const TONE = {
  signal: { bar: 'before:bg-signal', icon: <Radar size={16} className="text-signal" /> },
  trace: { bar: 'before:bg-trace', icon: <CheckCircle2 size={16} className="text-trace" /> },
  echo: { bar: 'before:bg-echo', icon: <BookOpen size={16} className="text-echo" /> },
  warn: { bar: 'before:bg-warn', icon: <TriangleAlert size={16} className="text-warn" /> },
};

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  const setComms = useGame((s) => s.setComms);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-10 z-40 flex w-[340px] flex-col gap-2">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          onClick={() => {
            dismiss(t.id);
            if (t.action === 'comms') setComms(true);
          }}
          className={cx(
            'glass pointer-events-auto relative flex animate-rise items-start gap-3 overflow-hidden rounded-md py-3 pr-4 pl-4 text-left shadow-float',
            'before:absolute before:inset-y-0 before:left-0 before:w-0.5',
            TONE[t.tone].bar,
          )}
        >
          <span className="mt-0.5">{TONE[t.tone].icon}</span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-fg">{t.title}</span>
            {t.body && <span className="block truncate text-xs text-fg-muted">{t.body}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
