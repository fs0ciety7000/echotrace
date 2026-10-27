import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { conceptById, missions } from '../content/index.ts';
import { useGame } from '../state/game.ts';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Logo } from '../ui/Logo.tsx';

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
      </section>
    </main>
  );
}
