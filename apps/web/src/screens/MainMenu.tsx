import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { concepts } from '../content/index.ts';
import { useGame } from '../state/game.ts';
import { StatusDot } from '../ui/Badge.tsx';
import { cx } from '../ui/cx.ts';
import { Kbd } from '../ui/Kbd.tsx';
import { Logo } from '../ui/Logo.tsx';

interface Item {
  id: string;
  label: string;
  meta?: string;
  disabled?: boolean;
  action: () => void;
}

export function MainMenu() {
  const { hasSave, saveSummary, lastSavedAt, newGame, continueGame, setModal, openBanc } = useGame();
  const [active, setActive] = useState(0);

  const items: Item[] = [
    ...(hasSave
      ? [{ id: 'continue', label: 'Continuer', meta: saveSummary ?? undefined, action: () => void continueGame() }]
      : []),
    {
      id: 'new',
      label: hasSave ? 'Nouvelle opération' : 'Commencer',
      meta: hasSave ? 'Le journal est conservé' : 'Prologue',
      action: newGame,
    },
    { id: 'academy', label: 'Le Banc — Académie', meta: 'Exercices', action: openBanc },
    { id: 'settings', label: 'Paramètres', action: () => setModal('settings') },
  ];

  // No dependency array: items are rebuilt each render and the listener must see the latest ones.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => {
          let next = i;
          do next = (next + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          while (items[next]?.disabled);
          return next;
        });
      } else if (e.key === 'Enter') {
        // Without this, the browser's default Enter action lands on whatever the action just focused
        // (the briefing's autofocused button) and immediately closes it.
        e.preventDefault();
        const item = items[active];
        if (item && !item.disabled) item.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="relative flex h-full flex-col overflow-hidden bg-void">
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-(image:--gradient-horizon)" />

      <header className="relative z-10 flex h-14 items-center gap-3 px-8 text-xs text-fg-subtle">
        <Logo size="sm" />
        <span className="ml-auto font-mono">v0.1 · FR</span>
        <button
          type="button"
          onClick={() => setModal('settings')}
          className="rounded-sm p-1.5 hover:bg-raised hover:text-fg"
          aria-label="Paramètres"
        >
          <Settings size={16} />
        </button>
      </header>

      <section className="relative z-10 flex flex-1 flex-col justify-center px-6 md:px-24">
        <p className="eyebrow mb-6 flex items-center gap-2">
          <StatusDot tone="signal" pulse /> {'ECHO-NET // nœud 07 · connexion chiffrée'}
        </p>
        <Logo size="display" />
        <p className="mt-5 max-w-md text-base text-fg-muted">
          Tout laisse un écho. Rejoins la cellule, suis les traces, comprends ce que tu vois.
        </p>

        <nav aria-label="Menu principal" className="mt-12 w-full max-w-sm">
          <ul className="overflow-hidden rounded-md border border-line bg-surface/70 backdrop-blur-sm">
            {items.map((item, i) => (
              <li key={item.id} className="border-line not-last:border-b">
                <button
                  type="button"
                  disabled={item.disabled}
                  onMouseEnter={() => !item.disabled && setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={item.action}
                  className={cx(
                    'group relative flex h-12 w-full items-center gap-3 px-4 text-left transition-colors duration-(--duration-fast)',
                    'disabled:cursor-not-allowed disabled:text-fg-faint',
                    i === active && !item.disabled ? 'bg-raised text-fg' : 'text-fg-muted',
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      'absolute inset-y-2 left-0 w-0.5 rounded-full bg-signal transition-opacity',
                      i === active && !item.disabled ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span
                    className={cx(
                      'font-mono text-signal',
                      i === active && !item.disabled ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    ▸
                  </span>
                  <span className="text-base">{item.label}</span>
                  {item.meta && <span className="ml-auto font-mono text-xs text-fg-subtle">{item.meta}</span>}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> naviguer <Kbd>↵</Kbd> valider
          </p>
        </nav>
      </section>

      <footer className="relative z-10 flex h-10 items-center gap-6 border-t border-line px-8 font-mono text-xs text-fg-subtle">
        <span className="flex items-center gap-2">
          <StatusDot tone="trace" pulse /> ECHO-NET en ligne
        </span>
        <span className="hidden sm:inline">⟶ {concepts.length} fiches au journal</span>
        {lastSavedAt && (
          <span className="hidden md:inline">
            Dernière session :{' '}
            {new Date(lastSavedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )}
        <span className="ml-auto hidden sm:inline">Simulation pédagogique · aucune cible réelle</span>
      </footer>
    </main>
  );
}
