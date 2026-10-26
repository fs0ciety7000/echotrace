import { CONCEPT_CATEGORIES, mastery } from '@echotrace/engine';
import { BookOpen, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_TITLES, concepts } from '../../content/index.ts';
import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { cx } from '../../ui/cx.ts';
import { Markdown } from '../../ui/Markdown.tsx';
import { Panel } from '../../ui/Panel.tsx';
import { MasteryMeter } from './MasteryMeter.tsx';
import { Quiz } from './Quiz.tsx';

const MASTERY_LABELS = ['inconnue', 'rencontrée', 'étudiée', 'validée'];

/** Full learning journal: every fiche by category, mastery stats, reading and quizzes. */
export function JournalView() {
  const engine = useGame((s) => s.engine);
  const selection = useGame((s) => s.journalSelection);
  const openInJournal = useGame((s) => s.openInJournal);
  const passQuiz = useGame((s) => s.passQuiz);
  useGame((s) => s.rev);
  const [quizFor, setQuizFor] = useState<string | null>(null);
  // Below md the journal shows either the list or the fiche, like a mail client.
  const [listOpen, setListOpen] = useState(selection === null);
  if (!engine) return null;

  const levels = concepts.map((c) => mastery(engine.journal[c.id]));
  const count = (min: number) => levels.filter((m) => m >= min).length;
  const points = levels.reduce<number>((a, b) => a + b, 0);
  const maxPoints = concepts.length * 3;
  const selected =
    concepts.find((c) => c.id === selection && mastery(engine.journal[c.id]) > 0) ??
    concepts.find((c) => mastery(engine.journal[c.id]) > 0);

  const select = (id: string) => {
    setQuizFor(null);
    setListOpen(false);
    openInJournal(id);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
      <div className={cx('min-h-0 flex-col', listOpen ? 'flex' : 'hidden md:flex')}>
        <Panel eyebrow="Journal d'apprentissage" className="min-h-0 flex-1" bodyClassName="overflow-y-auto">
          <div className="border-b border-line px-4 py-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl text-fg tabular">{Math.round((points / maxPoints) * 100)} %</span>
              <span className="text-xs text-fg-subtle">de maîtrise globale</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-strong">
              <div
                className="h-full rounded-full bg-(image:--gradient-echo) transition-[width] duration-(--duration-slow)"
                style={{ width: `${(points / maxPoints) * 100}%` }}
              />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] text-fg-subtle">
              {[1, 2, 3].map((lvl) => (
                <div key={lvl}>
                  <dt>{MASTERY_LABELS[lvl]}s</dt>
                  <dd className="text-sm text-fg tabular">
                    {count(lvl)}/{concepts.length}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <nav aria-label="Fiches" className="px-2 py-2">
            {CONCEPT_CATEGORIES.map((cat) => {
              const inCat = concepts.filter((c) => c.category === cat);
              if (inCat.length === 0) return null;
              const known = inCat.filter((c) => mastery(engine.journal[c.id]) > 0).length;
              return (
                <section key={cat} className="mb-2">
                  <h3 className="flex items-center px-2 py-1.5">
                    <span className="eyebrow text-echo!">{CATEGORY_TITLES[cat]}</span>
                    <span className="ml-auto font-mono text-[11px] text-fg-subtle tabular">
                      {known}/{inCat.length}
                    </span>
                  </h3>
                  <ul>
                    {inCat.map((c) => {
                      const m = mastery(engine.journal[c.id]);
                      if (m === 0) {
                        return (
                          <li key={c.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-fg-faint">
                            <Lock size={12} /> Fiche non découverte
                          </li>
                        );
                      }
                      const active = selected?.id === c.id;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => select(c.id)}
                            aria-current={active ? 'true' : undefined}
                            className={cx(
                              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                              active ? 'bg-raised text-fg' : 'text-fg-muted hover:bg-raised hover:text-fg',
                            )}
                          >
                            <span className="flex-1 truncate">{c.title}</span>
                            <MasteryMeter value={m} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </nav>
        </Panel>
      </div>

      <div className={cx('min-h-0 flex-col', listOpen ? 'hidden md:flex' : 'flex')}>
        <Panel
          eyebrow={selected ? CATEGORY_TITLES[selected.category] : 'Fiche'}
          actions={
            <button type="button" onClick={() => setListOpen(true)} className="text-xs text-signal md:hidden">
              ← Toutes les fiches
            </button>
          }
          className="min-h-0 flex-1"
          bodyClassName="overflow-y-auto"
        >
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-fg-subtle">
              <BookOpen size={28} />
              <p className="max-w-sm text-sm">
                Ton journal est vide. Chaque commande que tu utilises et chaque objectif accompli y dépose des fiches.
              </p>
            </div>
          ) : (
            <article className="mx-auto max-w-2xl px-6 py-6 md:px-10">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold tracking-[-0.01em]">{selected.title}</h2>
                <p className="mt-2 text-base text-fg-muted">{selected.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-fg-subtle">
                  <MasteryMeter value={mastery(engine.journal[selected.id])} />
                  <span>{MASTERY_LABELS[mastery(engine.journal[selected.id])]}</span>
                  <code className="font-mono">learn {selected.id}</code>
                  {selected.quiz.length > 0 && quizFor !== selected.id && (
                    <Button
                      size="sm"
                      variant={mastery(engine.journal[selected.id]) === 3 ? 'ghost' : 'primary'}
                      icon={<GraduationCap size={14} />}
                      onClick={() => setQuizFor(selected.id)}
                      className="ml-auto"
                    >
                      {mastery(engine.journal[selected.id]) === 3 ? 'Refaire le quiz' : 'Tester ma compréhension'}
                    </Button>
                  )}
                </div>
              </header>

              {quizFor === selected.id ? (
                <Quiz
                  key={selected.id}
                  questions={selected.quiz}
                  onPass={() => passQuiz(selected.id)}
                  onExit={() => setQuizFor(null)}
                />
              ) : (
                <>
                  <Markdown source={selected.body} />
                  {selected.related.length > 0 && (
                    <div className="mt-8 border-t border-line pt-4">
                      <div className="eyebrow mb-2">Fiches liées</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.related.map((r) => {
                          const rc = concepts.find((c) => c.id === r);
                          const known = mastery(engine.journal[r]) > 0;
                          return (
                            <button
                              key={r}
                              type="button"
                              disabled={!known}
                              onClick={() => select(r)}
                              className="rounded-xs border border-echo-line bg-echo-soft px-2 py-0.5 text-xs text-echo-strong hover:bg-echo/20 disabled:border-line disabled:bg-transparent disabled:text-fg-faint"
                            >
                              {known ? (rc?.title ?? r) : '???'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          )}
        </Panel>
      </div>
    </div>
  );
}
