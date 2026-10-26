import type { MessageView } from '@echotrace/engine';
import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../../state/game.ts';
import { cx } from '../../ui/cx.ts';
import { Drawer } from '../../ui/Drawer.tsx';
import { Typewriter, typingDuration } from '../../ui/Typewriter.tsx';

export function initials(name: string): string {
  if (name === 'inconnu') return '◇';
  return name
    .split(/[\s-]+/)
    .filter((w) => /^[A-Z]/.test(w) && w !== 'Dr')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function Message({ msg, animate, delayMs }: { msg: MessageView; animate: boolean; delayMs: number }) {
  const unknown = msg.from === 'inconnu';
  return (
    <article className={cx('relative border-l-2 py-1 pl-4', unknown ? 'border-danger-line' : 'border-echo-line')}>
      <header className="mb-2 flex items-center gap-2.5">
        <span
          className={cx(
            'flex size-7 items-center justify-center rounded-full border font-mono text-[10px]',
            unknown
              ? 'border-danger-line bg-danger-soft text-danger-strong'
              : 'border-echo-line bg-echo-soft text-echo-strong',
          )}
        >
          {initials(msg.from)}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cx('block text-sm font-medium', unknown ? 'font-mono text-danger-strong' : 'text-fg')}>
            {msg.from}
          </span>
          {msg.subject && <span className="block truncate text-xs text-fg-subtle">{msg.subject}</span>}
        </span>
        <time className="tabular font-mono text-[11px] text-fg-subtle">
          {new Date(msg.at).toISOString().slice(11, 16)}
        </time>
      </header>
      <div className={unknown ? 'font-mono [&_p]:text-danger-strong/90' : ''}>
        <Typewriter source={msg.body.trim()} animate={animate} delayMs={delayMs} />
      </div>
    </article>
  );
}

const PAUSE_BETWEEN_MS = 500;

/** Unread messages type one after another: each waits for the previous ones. */
function withDelays(inbox: MessageView[], animated: Set<string>) {
  let elapsed = 0;
  return inbox.map((msg) => {
    if (!animated.has(msg.id)) return { msg, delay: 0 };
    const delay = elapsed;
    elapsed += typingDuration(msg.body.trim()) + PAUSE_BETWEEN_MS;
    return { msg, delay };
  });
}

/** Message thread from the cell. Unread messages are typed out once, then marked read. */
export function CommsDrawer() {
  const open = useGame((s) => s.commsOpen);
  const setComms = useGame((s) => s.setComms);
  const markRead = useGame((s) => s.markMessagesRead);
  const mission = useGame((s) => s.engine?.mission);
  useGame((s) => s.rev);
  const close = useCallback(() => setComms(false), [setComms]);
  const endRef = useRef<HTMLDivElement>(null);

  const inbox = mission?.inbox() ?? [];
  // Snapshot which messages were unread when this render started, so typing survives the read flag flipping.
  const animateIds = useRef(new Set<string>());
  for (const m of inbox) if (!m.read) animateIds.current.add(m.id);

  useEffect(() => {
    if (open) markRead();
    else animateIds.current.clear();
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the newest message when one arrives
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [open, inbox.length]);

  if (!open || !mission) return null;

  return (
    <Drawer
      label="Messages"
      onClose={close}
      accent="signal"
      eyebrow={<span className="eyebrow">Comms · canal chiffré ECHO</span>}
      header={<h2 className="mt-2 text-xl font-semibold">Messages</h2>}
    >
      {inbox.length === 0 ? (
        <p className="text-sm text-fg-subtle">Aucun message pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {withDelays(inbox, animateIds.current).map(({ msg, delay }) => (
            <Message key={msg.id} msg={msg} animate={animateIds.current.has(msg.id)} delayMs={delay} />
          ))}
        </div>
      )}
      <div ref={endRef} />
    </Drawer>
  );
}
