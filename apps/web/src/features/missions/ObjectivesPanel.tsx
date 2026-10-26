import { useGame } from '../../state/game.ts';
import { cx } from '../../ui/cx.ts';

export function ObjectivesList() {
  const engine = useGame((s) => s.engine);
  useGame((s) => s.rev);
  const mission = engine?.mission;
  if (!mission) return <p className="px-4 py-3 text-fg-subtle">Aucune opération en cours.</p>;
  const objectives = mission.objectives().filter((o) => o.state !== 'locked');
  const lockedCount = mission.objectives().length - objectives.length;

  return (
    <ol className="flex flex-col gap-0.5 px-2 py-2">
      {objectives.map((o) => {
        const done = o.state === 'done';
        return (
          <li
            key={o.id}
            className={cx('flex animate-rise items-start gap-2.5 rounded-sm px-2 py-1.5', !done && 'bg-signal-soft/40')}
          >
            <span aria-hidden className={cx('mt-px font-mono', done ? 'text-trace' : 'text-signal')}>
              {o.optional ? '◇' : '◆'}
            </span>
            <span className={cx('flex-1 text-sm', done ? 'text-fg-subtle' : 'text-fg')}>
              {o.label}
              {o.optional && <span className="ml-1.5 text-xs text-fg-subtle">optionnel</span>}
            </span>
            {done && (
              <span className="font-mono text-xs text-trace">
                ✓<span className="sr-only"> accompli</span>
              </span>
            )}
          </li>
        );
      })}
      {lockedCount > 0 && (
        <li className="px-2 py-1.5 font-mono text-xs text-fg-faint">
          + {lockedCount} objectif{lockedCount > 1 ? 's' : ''} verrouillé{lockedCount > 1 ? 's' : ''}
        </li>
      )}
    </ol>
  );
}

/** Pending decision banner + the report questions of the mission. */
export function CaseFile() {
  const engine = useGame((s) => s.engine);
  const setModal = useGame((s) => s.setModal);
  const setDraft = useGame((s) => s.setDraft);
  useGame((s) => s.rev);
  const mission = engine?.mission;
  if (!mission) return null;
  const pending = mission.pendingChoice();
  const questions = mission.questions();
  if (!pending && questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-line px-2 py-2">
      {pending && (
        <button
          type="button"
          onClick={() => setModal('choice')}
          className="flex animate-rise items-center gap-2 rounded-sm border border-echo-line bg-echo-soft px-3 py-2 text-left text-sm text-echo-strong hover:bg-echo/20"
        >
          <span aria-hidden className="size-1.5 animate-pulse-signal rounded-full bg-echo" />
          Décision en attente — {pending.from}
        </button>
      )}
      {questions.length > 0 && (
        <div>
          <div className="eyebrow px-2 py-1">Rapport</div>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  disabled={q.state !== 'open'}
                  onClick={() => setDraft(`report ${q.id} `)}
                  title={q.state === 'open' ? `Préparer : report ${q.id} <réponse>` : undefined}
                  className={cx(
                    'flex w-full items-start gap-2 rounded-sm px-2 py-1 text-left text-xs',
                    q.state === 'open' ? 'text-fg hover:bg-raised' : 'text-fg-subtle',
                  )}
                >
                  <span aria-hidden className={cx('font-mono', q.state === 'confirmed' ? 'text-trace' : 'text-signal')}>
                    {q.state === 'confirmed' ? '✓' : q.state === 'open' ? '?' : '·'}
                  </span>
                  <span className="flex-1">{q.state === 'locked' ? 'Question verrouillée' : q.prompt}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
