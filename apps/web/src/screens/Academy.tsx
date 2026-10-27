import { SANDBOX_LEVELS, SANDBOX_MISSION_ID, type SandboxLevel } from '@echotrace/engine';
import { ArrowLeft, CheckCircle2, Dices, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { conceptById, missions } from '../content/index.ts';
import { useGame } from '../state/game.ts';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { cx } from '../ui/cx.ts';
import { Logo } from '../ui/Logo.tsx';

const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** UI-side randomness only: the engine turns the seed into a network deterministically. */
function randomSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => SEED_ALPHABET[b % SEED_ALPHABET.length]).join('');
}

/** Le Banc: short, replayable exercises outside the campaign. Only the journal remembers them. */
export function Academy() {
  const toMenu = useGame((s) => s.toMenu);
  const startBanc = useGame((s) => s.startBanc);
  const bancDone = useGame((s) => s.bancDone);
  const modules = missions.filter((m) => m.act === 'banc').sort((a, b) => a.order - b.order);

  return (
    <main className="relative flex h-full flex-col overflow-y-auto bg-void">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-(image:--gradient-horizon)" />
      <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 px-6 md:px-8">
        <Logo size="sm" />
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={toMenu} className="ml-auto">
          Menu principal
        </Button>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-6 pb-16 md:px-8">
        <p className="eyebrow mb-3 flex items-center gap-2">
          <GraduationCap size={14} /> ECHO · cyber range interne
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] md:text-[34px]">Le Banc</h1>
        <p className="mt-3 max-w-2xl text-base text-fg-muted">
          Des exercices courts, rejouables, sans conséquence sur la campagne. Tout y est autorisé — c'est l'endroit pour
          essayer, se tromper et recommencer. Ton journal, lui, retient ce que tu apprends.
        </p>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {modules.map((m, i) => {
            const done = bancDone.includes(m.id);
            return (
              <li key={m.id} className="flex flex-col rounded-md border border-line bg-surface p-5 shadow-inset">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-fg-subtle">Module {String(i + 1).padStart(2, '0')}</span>
                  {done && (
                    <Badge tone="trace" className="ml-auto">
                      <CheckCircle2 size={12} /> fait
                    </Badge>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-medium text-fg">{m.title}</h2>
                <p className="mt-1.5 flex-1 text-sm text-fg-muted">{m.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.concepts.map((c) => (
                    <span
                      key={c}
                      className="rounded-xs border border-echo-line bg-echo-soft px-1.5 py-px text-[11px] text-echo-strong"
                    >
                      {conceptById.get(c)?.title ?? c}
                    </span>
                  ))}
                </div>
                <Button variant={done ? 'secondary' : 'primary'} className="mt-5" onClick={() => startBanc(m.id)}>
                  {done ? 'Refaire' : 'Commencer'}
                </Button>
              </li>
            );
          })}
        </ol>

        <SandboxCard done={bancDone.includes(SANDBOX_MISSION_ID)} />
      </section>
    </main>
  );
}

function SandboxCard({ done }: { done: boolean }) {
  const startSandbox = useGame((s) => s.startSandbox);
  const [seed, setSeed] = useState(randomSeed);
  const [level, setLevel] = useState<SandboxLevel>(2);
  const levels = Object.entries(SANDBOX_LEVELS) as [string, (typeof SANDBOX_LEVELS)[SandboxLevel]][];

  return (
    <section
      aria-labelledby="sandbox-title"
      className="mt-6 rounded-md border border-echo-line bg-surface p-5 shadow-inset md:p-6"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-fg-subtle">Sandbox</span>
        {done && (
          <Badge tone="trace" className="ml-auto">
            <CheckCircle2 size={12} /> déjà réussi
          </Badge>
        )}
      </div>
      <h2 id="sandbox-title" className="mt-2 text-lg font-medium text-fg">
        Exercice généré
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
        Un réseau construit à partir d'une graine : une machine à corriger, une machine qui chante, une source qui
        s'acharne. La même graine redonne toujours le même réseau — partage-la pour comparer vos méthodes.
      </p>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
        <fieldset>
          <legend className="eyebrow mb-2">Niveau</legend>
          <div className="flex overflow-hidden rounded-sm border border-line-strong">
            {levels.map(([key, l]) => {
              const value = Number(key) as SandboxLevel;
              const active = value === level;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  title={l.summary}
                  onClick={() => setLevel(value)}
                  className={cx(
                    'h-9 px-3 text-sm transition-colors duration-(--duration-fast) not-last:border-r not-last:border-line-strong',
                    active ? 'bg-echo-soft text-echo-strong' : 'bg-raised text-fg-muted hover:text-fg',
                  )}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="sandbox-seed" className="eyebrow mb-2 block">
            Graine
          </label>
          <div className="flex gap-2">
            <input
              id="sandbox-seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value.toUpperCase().slice(0, 16))}
              spellCheck={false}
              autoComplete="off"
              className="h-9 w-40 rounded-sm border border-line-strong bg-raised px-2 font-mono text-sm tracking-wider text-fg"
            />
            <Button
              variant="ghost"
              icon={<Dices size={14} />}
              onClick={() => setSeed(randomSeed())}
              aria-label="Graine au hasard"
            >
              Au hasard
            </Button>
          </div>
        </div>

        <Button
          variant="primary"
          className="md:ml-auto"
          disabled={!seed.trim()}
          onClick={() => startSandbox(seed, level)}
        >
          Générer et commencer
        </Button>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">{SANDBOX_LEVELS[level].summary}</p>
    </section>
  );
}
