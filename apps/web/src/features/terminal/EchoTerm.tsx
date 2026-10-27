import type { Line, Span } from '@echotrace/engine';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type TermEntry, useGame } from '../../state/game.ts';
import { cx } from '../../ui/cx.ts';

const STYLE: Record<NonNullable<Span['s']>, string> = {
  plain: 'text-fg',
  muted: 'text-fg-muted',
  subtle: 'text-fg-subtle',
  accent: 'text-signal',
  success: 'text-trace',
  warning: 'text-warn',
  danger: 'text-danger',
  echo: 'text-echo',
  heading: 'font-semibold tracking-[0.04em] text-fg',
  concept:
    'text-echo-strong underline decoration-echo-line decoration-dotted underline-offset-[3px] hover:decoration-echo cursor-pointer',
  path: 'text-signal-strong',
  host: 'text-signal',
  command:
    'text-fg underline decoration-line-strong underline-offset-[3px] hover:text-signal hover:decoration-signal-line cursor-pointer',
};

function SpanView({
  span,
  onConcept,
  onCommand,
}: {
  span: Span;
  onConcept: (id: string) => void;
  onCommand: (c: string) => void;
}) {
  const cls = STYLE[span.s ?? 'plain'];
  if (span.s === 'concept' && span.ref) {
    return (
      <button type="button" className={cls} onClick={() => onConcept(span.ref as string)}>
        {span.t}
      </button>
    );
  }
  if (span.s === 'command' && span.ref) {
    return (
      <button
        type="button"
        className={cls}
        onClick={() => onCommand(span.ref as string)}
        title="Insérer dans le terminal"
      >
        {span.t}
      </button>
    );
  }
  return <span className={cls}>{span.t}</span>;
}

const LineView = ({
  line,
  onConcept,
  onCommand,
}: {
  line: Line;
  onConcept: (id: string) => void;
  onCommand: (c: string) => void;
}) => (
  <div className="min-h-(--term-leading) whitespace-pre-wrap break-words">
    {line.map((s, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: spans are immutable once printed
      <SpanView key={i} span={s} onConcept={onConcept} onCommand={onCommand} />
    ))}
  </div>
);

const EntryView = memo(function EntryView({
  entry,
  onConcept,
  onCommand,
}: {
  entry: TermEntry;
  onConcept: (id: string) => void;
  onCommand: (c: string) => void;
}) {
  return (
    <div>
      {entry.prompt && (
        <div className="whitespace-pre-wrap break-words">
          {entry.prompt.map((s, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static prompt spans
            <SpanView key={i} span={s} onConcept={onConcept} onCommand={onCommand} />
          ))}
          <span className="text-fg">{entry.input}</span>
        </div>
      )}
      {entry.lines.map((l, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: output lines are immutable
        <LineView key={i} line={l} onConcept={onConcept} onCommand={onCommand} />
      ))}
    </div>
  );
});

/**
 * EchoTerm — DOM terminal rendering structured engine output (see ADR-0002).
 * A visually hidden <input> owns the keyboard; the visible line draws a block cursor.
 */
export function EchoTerm({ className }: { className?: string }) {
  const engine = useGame((s) => s.engine);
  const scrollback = useGame((s) => s.scrollback);
  const draft = useGame((s) => s.draft);
  const setDraft = useGame((s) => s.setDraft);
  const run = useGame((s) => s.run);
  const interrupt = useGame((s) => s.interrupt);
  const showConcept = useGame((s) => s.showConcept);
  useGame((s) => s.rev);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);
  const [focused, setFocused] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const historyIndex = useRef<number | null>(null);
  const savedDraft = useRef('');

  const pending = engine?.pendingPrompt() ?? null;
  const history = engine?.state.session.history ?? [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever output or suggestions change
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scrollback, options]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the visual cursor in sync when the draft is replaced from outside (clickable commands).
  useEffect(() => {
    const el = inputRef.current;
    if (el && document.activeElement !== el) setCursor(draft.length);
  }, [draft]);

  const insertCommand = (cmd: string) => {
    setDraft(cmd);
    setCursor(cmd.length);
    inputRef.current?.focus();
  };

  const syncCursor = () => setCursor(inputRef.current?.selectionStart ?? draft.length);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!engine) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      historyIndex.current = null;
      setOptions([]);
      run(draft);
      setCursor(0);
    } else if (e.key === 'Tab') {
      // Shift+Tab, or Tab on an empty line, leaves the terminal: completion must never trap the keyboard.
      if (e.shiftKey || (!draft && !pending)) return;
      e.preventDefault();
      if (pending) return;
      const c = engine.complete(draft);
      setDraft(c.input);
      setCursor(c.input.length);
      setOptions(c.options);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (pending || history.length === 0) return;
      e.preventDefault();
      const up = e.key === 'ArrowUp';
      let idx = historyIndex.current;
      if (idx === null) {
        if (!up) return;
        savedDraft.current = draft;
        idx = history.length;
      }
      idx = Math.max(0, Math.min(history.length, idx + (up ? -1 : 1)));
      historyIndex.current = idx === history.length ? null : idx;
      const value = idx === history.length ? savedDraft.current : (history[idx] ?? '');
      setDraft(value);
      setCursor(value.length);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setOptions([]);
      interrupt();
      setCursor(0);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      run('clear');
    } else {
      requestAnimationFrame(syncCursor);
    }
  };

  const prompt: Line = pending ? [{ t: pending.label, s: 'muted' }] : (engine?.prompt() ?? []);
  const visible = pending?.secret ? '' : draft;
  const pos = Math.min(cursor, visible.length);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard input is owned by the inner <input>
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus convenience only
    <div
      className={cx(
        'relative flex h-full min-h-0 flex-col bg-deep font-mono text-(length:--term-size) leading-(--term-leading)',
        className,
      )}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Sortie du terminal"
        className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-2"
      >
        {scrollback.map((entry) => (
          <EntryView key={entry.id} entry={entry} onConcept={showConcept} onCommand={insertCommand} />
        ))}

        <div className="relative whitespace-pre-wrap break-words">
          {prompt.map((s, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: prompt spans
            <SpanView key={i} span={s} onConcept={showConcept} onCommand={insertCommand} />
          ))}
          <span className="text-fg">{visible.slice(0, pos)}</span>
          <span
            aria-hidden
            className={cx(
              'inline-block min-w-[0.6em] text-void',
              focused
                ? 'animate-blink bg-signal'
                : 'bg-transparent outline outline-1 -outline-offset-1 outline-signal-line',
            )}
          >
            {visible[pos] ?? ' '}
          </span>
          <span className="text-fg">{visible.slice(pos + 1)}</span>
        </div>

        {options.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-4 text-fg-muted">
            {options.map((o) => (
              <span key={o}>{o}</span>
            ))}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        data-terminal-input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setCursor(e.target.selectionStart ?? e.target.value.length);
          historyIndex.current = null;
        }}
        onKeyDown={onKeyDown}
        onKeyUp={syncCursor}
        onSelect={syncCursor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type={pending?.secret ? 'password' : 'text'}
        aria-label={pending ? pending.label : 'Ligne de commande'}
        aria-describedby="term-keys"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="absolute bottom-0 left-0 h-px w-px opacity-0"
      />
      <p id="term-keys" className="sr-only">
        Entrée exécute. Tab complète ; sur une ligne vide, Tab passe à la zone suivante. Flèches haut et bas :
        historique.
      </p>
    </div>
  );
}
