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
