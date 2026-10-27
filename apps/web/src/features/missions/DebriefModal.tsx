import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { Markdown } from '../../ui/Markdown.tsx';
import { Modal } from '../../ui/Modal.tsx';

export function DebriefModal() {
  const modal = useGame((s) => s.modal);
  const setModal = useGame((s) => s.setModal);
  const toMenu = useGame((s) => s.toMenu);
  const nextOperation = useGame((s) => s.nextOperation);
  const upcoming = useGame((s) => s.upcoming);
  const mode = useGame((s) => s.mode);
  const openBanc = useGame((s) => s.openBanc);
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
    ...(spec.questions.length ? [{ label: 'Conclusions erronées', value: String(progress.wrongAnswers ?? 0) }] : []),
  ];
  const decisions = mission.decisions();
  const next = upcoming();
  const actOver = !next || next.act !== spec.act;

  return (
    <Modal
      open={modal === 'debrief'}
      onClose={() => setModal(null)}
      eyebrow={mode === 'banc' ? 'Banc · exercice réussi' : 'Débrief · opération accomplie'}
      title={spec.title}
      accent="trace"
      footer={
        <>
          <Button variant="ghost" onClick={() => setModal(null)}>
            Rester sur le poste
          </Button>
          {mode === 'banc' ? (
            <Button variant="primary" onClick={openBanc} data-autofocus>
              Retour au Banc
            </Button>
          ) : next ? (
            <Button variant="primary" onClick={nextOperation} data-autofocus>
              {actOver ? 'Acte suivant' : 'Opération suivante'} : {next.title}
            </Button>
          ) : (
            <Button variant="primary" onClick={toMenu} data-autofocus>
              Retour au menu
            </Button>
          )}
        </>
      }
    >
      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-5">
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
      {decisions.length > 0 && (
        <section className="mt-8 border-t border-line pt-5">
          <div className="eyebrow mb-3">Tes décisions et leurs conséquences</div>
          {decisions.map(({ choice, option }) => (
            <div key={choice.id} className="mb-4 border-l-2 border-echo-line pl-4">
              <p className="text-sm font-medium text-fg">{option.label}</p>
              <Markdown source={option.consequence} className="text-sm [&_p]:text-sm" />
            </div>
          ))}
          <p className="font-mono text-xs text-fg-subtle tabular">
            Intégrité {engine.campaign.integrity} · Initiative {engine.campaign.initiative}
          </p>
        </section>
      )}
      {!next && mode === 'campagne' && (
        <p className="mt-6 rounded-md border border-echo-line bg-echo-soft px-4 py-3 text-sm text-fg">
          Fin des opérations disponibles pour l'instant. La suite arrive dans une prochaine version — ton journal et tes
          décisions sont conservés.
        </p>
      )}
      {optionalDone < optional.length && (
        <p className="mt-6 text-sm text-fg-subtle">
          Il reste un objectif optionnel. Tu peux rester sur le poste pour le chercher.
        </p>
      )}
    </Modal>
  );
}
