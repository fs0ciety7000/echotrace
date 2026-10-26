import type { QuizQuestion } from '@echotrace/engine';
import { Check, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/Button.tsx';
import { cx } from '../../ui/cx.ts';
import { Kbd } from '../../ui/Kbd.tsx';
import { Markdown } from '../../ui/Markdown.tsx';

interface Shuffled {
  q: QuizQuestion;
  /** Original choice indexes in display order. */
  order: number[];
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/**
 * Mini-quiz of a fiche. Every answer is explained, right or wrong.
 * Passing requires a perfect run; retries reshuffle the choices.
 */
export function Quiz({
  questions,
  onPass,
  onExit,
}: {
  questions: QuizQuestion[];
  onPass: () => void;
  onExit: () => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reshuffle on each new attempt
  const deck: Shuffled[] = useMemo(
    () => questions.map((q) => ({ q, order: shuffle(q.choices.map((_, i) => i)) })),
    [questions, attempt],
  );
  const finished = index >= deck.length;
  const current = deck[index];
  const passed = finished && score === deck.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: onPass is reported once when a perfect run ends
  useEffect(() => {
    if (passed) onPass();
  }, [passed]);

  const choose = (original: number) => {
    if (picked !== null || !current) return;
    setPicked(original);
    if (original === current.q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };
  const retry = () => {
    setAttempt((a) => a + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || document.querySelector('dialog[open]')) return;
      const n = Number(e.key);
      if (current && picked === null && n >= 1 && n <= current.order.length) choose(current.order[n - 1] as number);
      else if (e.key === 'Enter' && picked !== null) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (finished) {
    return (
      <div className="rounded-md border border-line bg-raised/40 p-5" role="status">
        <div className="eyebrow mb-2">Résultat</div>
        <p className="font-mono text-2xl text-fg tabular">
          {score}/{deck.length}
        </p>
        {passed ? (
          <p className="mt-2 text-sm text-trace-strong">Fiche validée. Maîtrise maximale.</p>
        ) : (
          <p className="mt-2 text-sm text-fg-muted">
            Il faut un sans-faute pour valider la fiche. Relis les explications et retente : l'ordre des réponses
            change.
          </p>
        )}
        <div className="mt-4 flex gap-2">
          {!passed && (
            <Button variant="primary" icon={<RotateCcw size={14} />} onClick={retry}>
              Recommencer
            </Button>
          )}
          <Button variant="ghost" onClick={onExit}>
            Revenir à la fiche
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const correct = picked !== null && picked === current.q.answer;

  return (
    <div className="rounded-md border border-line bg-raised/40 p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="eyebrow">
          Question {index + 1}/{deck.length}
        </span>
        <span className="ml-auto flex gap-1" aria-hidden>
          {deck.map((d, i) => (
            <span
              key={d.q.q}
              className={cx(
                'h-1 w-5 rounded-full',
                i < index ? 'bg-echo' : i === index ? 'bg-signal' : 'bg-line-strong',
              )}
            />
          ))}
        </span>
      </div>
      <Markdown source={current.q.q} className="text-fg [&_p]:text-fg" />

      <ol className="mt-4 flex flex-col gap-2">
        {current.order.map((original, i) => {
          const isAnswer = original === current.q.answer;
          const isPicked = original === picked;
          const revealed = picked !== null;
          return (
            <li key={original}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(original)}
                className={cx(
                  'flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left text-sm transition-colors duration-(--duration-fast)',
                  !revealed && 'border-line-strong bg-surface text-fg hover:border-signal-line hover:bg-signal-soft',
                  revealed && isAnswer && 'border-trace-line bg-trace-soft text-fg',
                  revealed && isPicked && !isAnswer && 'border-danger-line bg-danger-soft text-fg',
                  revealed && !isAnswer && !isPicked && 'border-line text-fg-subtle',
                )}
              >
                <Kbd className="mt-px">{i + 1}</Kbd>
                <span className="flex-1">{current.q.choices[original]}</span>
                {revealed && isAnswer && <Check size={16} className="mt-0.5 text-trace" />}
                {revealed && isPicked && !isAnswer && <X size={16} className="mt-0.5 text-danger" />}
              </button>
            </li>
          );
        })}
      </ol>

      {picked !== null && (
        <div className="mt-4 animate-rise border-l-2 border-echo-line pl-4" aria-live="polite">
          <p className={cx('mb-1 text-sm font-medium', correct ? 'text-trace-strong' : 'text-danger-strong')}>
            {correct ? 'Exact.' : 'Pas tout à fait.'}
          </p>
          <Markdown source={current.q.explain} className="text-sm [&_p]:text-sm" />
          <div className="mt-3">
            <Button variant="secondary" size="sm" kbd="↵" onClick={next}>
              {index + 1 < deck.length ? 'Question suivante' : 'Voir le résultat'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
