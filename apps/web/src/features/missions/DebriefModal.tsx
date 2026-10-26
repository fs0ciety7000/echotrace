import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { Markdown } from '../../ui/Markdown.tsx';
import { Modal } from '../../ui/Modal.tsx';

export function DebriefModal() {
  const modal = useGame((s) => s.modal);
  const setModal = useGame((s) => s.setModal);
  const toMenu = useGame((s) => s.toMenu);
  const engine = useGame((s) => s.engine);
  useGame((s) => s.rev);
  const mission = engine?.mission;
  if (!engine || !mission) return null;

  const { progress, spec } = mission;
  const minutes = Math.round(((progress.completedAt ?? engine.state.clock) - progress.startedAt) / 60_000);
  const optional = spec.objectives.filter((o) => o.optional);
  const optionalDone = optional.filter((o) => progress.completed.includes(o.id)).length;
  const stats = [
    { label: 'Temps simulé', value: `${minutes} min` },
    { label: 'Exposition', value: `${engine.state.exposure}/100` },
    { label: 'Indices', value: String(progress.hintsUsed.length) },
    { label: 'Bonus', value: `${optionalDone}/${optional.length}` },
  ];

  return (
    <Modal
      open={modal === 'debrief'}
      onClose={() => setModal(null)}
      eyebrow="Débrief · opération accomplie"
      title={spec.title}
      accent="trace"
      footer={
        <>
          <Button variant="ghost" onClick={() => setModal(null)}>
            Rester sur le poste
          </Button>
          <Button variant="primary" onClick={toMenu} data-autofocus>
            Retour au menu
          </Button>
        </>
      }
    >
      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3">
            <dt className="eyebrow">{s.label}</dt>
            <dd className="tabular mt-1 font-mono text-lg text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mb-3 eyebrow">Question de l'opération</div>
      <p className="mb-5 text-base text-fg">{spec.question}</p>
      <Markdown source={spec.debrief} />
      {optionalDone < optional.length && (
        <p className="mt-6 text-sm text-fg-subtle">
          Il reste un objectif optionnel. Tu peux rester sur le poste pour le chercher.
        </p>
      )}
    </Modal>
  );
}
