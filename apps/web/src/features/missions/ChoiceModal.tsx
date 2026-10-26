import { useState } from 'react';
import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { cx } from '../../ui/cx.ts';
import { Markdown } from '../../ui/Markdown.tsx';
import { Modal } from '../../ui/Modal.tsx';
import { initials } from '../comms/CommsDrawer.tsx';

/**
 * A narrative decision. Effects on the gauges are deliberately not shown
 * before choosing: the player weighs the situation, not the numbers.
 */
export function ChoiceModal() {
  const modal = useGame((s) => s.modal);
  const setModal = useGame((s) => s.setModal);
  const choose = useGame((s) => s.choose);
  const choice = useGame((s) => s.engine?.mission?.pendingChoice());
  useGame((s) => s.rev);
  const [selected, setSelected] = useState<string | null>(null);
  if (!choice) return null;

  return (
    <Modal
      open={modal === 'choice'}
      onClose={() => setModal(null)}
      eyebrow="Décision"
      title="Ta recommandation"
      accent="echo"
      width="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={() => setModal(null)}>
            Plus tard
          </Button>
          <Button
            variant="primary"
            disabled={!selected}
            data-autofocus
            onClick={() => {
              if (selected) choose(choice.id, selected);
              setSelected(null);
            }}
          >
            Recommander
          </Button>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-2.5 text-xs text-fg-subtle">
        <span className="flex size-7 items-center justify-center rounded-full border border-echo-line bg-echo-soft font-mono text-[10px] text-echo-strong">
          {initials(choice.from)}
        </span>
        <span>
          de <span className="text-fg">{choice.from}</span>
        </span>
      </div>
      <Markdown source={choice.prompt} />
      <fieldset className="mt-6 flex flex-col gap-2">
        <legend className="eyebrow mb-2">Options</legend>
        {choice.options.map((o) => (
          <label
            key={o.id}
            className={cx(
              'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 transition-colors duration-(--duration-fast)',
              selected === o.id
                ? 'border-echo-line bg-echo-soft'
                : 'border-line-strong bg-surface hover:border-echo-line',
            )}
          >
            <input
              type="radio"
              name="choice"
              value={o.id}
              checked={selected === o.id}
              onChange={() => setSelected(o.id)}
              className="mt-1 accent-(--color-echo)"
            />
            <span className="flex-1">
              <span className="block text-sm font-medium text-fg">{o.label}</span>
              <span className="mt-0.5 block text-sm text-fg-muted">{o.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="mt-4 text-xs text-fg-subtle">
        Pas de bonne réponse cachée : chaque option a un coût. Les conséquences apparaîtront au débrief.
      </p>
    </Modal>
  );
}
