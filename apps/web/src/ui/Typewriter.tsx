import { useEffect, useState } from 'react';
import { useSettings } from '../state/settings.ts';
import { Markdown } from './Markdown.tsx';

const MS_PER_CHAR = 18;

export function prefersReducedMotion(): boolean {
  return useSettings.getState().reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Types a narrative message out, then swaps to rendered Markdown.
 * Click (or any key) skips; reduced motion shows it at once.
 */
export function typingDuration(source: string): number {
  return toPlain(source).length * MS_PER_CHAR;
}

const toPlain = (source: string) => source.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');

/**
 * `delayMs` lets several messages type one after another; before it elapses
 * a "typing…" indicator is shown.
 */
export function Typewriter({ source, animate, delayMs = 0 }: { source: string; animate: boolean; delayMs?: number }) {
  const plain = toPlain(source);
  const [shown, setShown] = useState(animate && !prefersReducedMotion() ? -1 : plain.length);
  const done = shown >= plain.length;

  useEffect(() => {
    if (shown !== -1) return;
    const t = setTimeout(() => setShown(0), delayMs);
    const skip = () => setShown(plain.length);
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', skip);
    };
  }, [shown, delayMs, plain.length]);

  // Restart only when completion flips; `shown` then drives itself through the frame loop.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    if (done || shown === -1) return;
    const start = performance.now() - shown * MS_PER_CHAR;
    let frame = requestAnimationFrame(function tick(now) {
      const next = Math.min(plain.length, Math.floor((now - start) / MS_PER_CHAR));
      setShown(next);
      if (next < plain.length) frame = requestAnimationFrame(tick);
    });
    const skip = () => setShown(plain.length);
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', skip);
    };
  }, [done, shown === -1]);

  if (done) return <Markdown source={source} />;
  if (shown === -1) {
    return (
      <span className="inline-flex gap-1 py-2" role="status" aria-label="en train d'écrire">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-pulse-signal rounded-full bg-fg-subtle"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </span>
    );
  }
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: any key also skips (window listener)
    <div
      className="max-w-prose cursor-pointer whitespace-pre-wrap text-base text-fg-muted"
      onClick={() => setShown(plain.length)}
    >
      {plain.slice(0, shown)}
      <span aria-hidden className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-blink bg-signal" />
    </div>
  );
}
