import { conceptById } from '../../content/index.ts';
import { useGame } from '../../state/game.ts';
import { Button } from '../../ui/Button.tsx';
import { Markdown } from '../../ui/Markdown.tsx';
import { Modal } from '../../ui/Modal.tsx';

const ACT_LABEL: Record<string, string> = {
  prologue: 'Prologue',
  'acte-1': 'Acte I — Résonance',
  'acte-2': 'Acte II — Interférences',
  'acte-3': 'Acte III — Silence radio',
  banc: 'Le Banc',
  contrat: 'Contrat Lanterne',
};

export function BriefingModal() {
  const modal = useGame((s) => s.modal);
  const setModal = useGame((s) => s.setModal);
  const showConcept = useGame((s) => s.showConcept);
  const spec = useGame((s) => s.engine?.mission?.spec);
  if (!spec) return null;
  const close = () => setModal(null);

  return (
    <Modal
      open={modal === 'briefing'}
      onClose={close}
      eyebrow={`Opération · ${ACT_LABEL[spec.act] ?? spec.act}`}
      title={spec.title}
      footer={
        <Button variant="primary" onClick={close} kbd="↵" data-autofocus>
          Commencer
        </Button>
      }
    >
      <div className="grid gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs text-fg-subtle">
            <span className="flex size-6 items-center justify-center rounded-full border border-echo-line bg-echo-soft font-mono text-[10px] text-echo-strong">
              {spec.from
                .split(' ')
                .filter((w) => /^[A-Z]/.test(w) && w !== 'Dr')
                .map((w) => w[0])
                .join('')}
            </span>
            <span>
              de <span className="text-fg">{spec.from}</span>
            </span>
          </div>
          <Markdown source={spec.briefing} />
        </div>
        <aside className="space-y-5 border-line md:border-l md:pl-6">
          <div>
            <div className="eyebrow mb-1.5">Question de l'opération</div>
            <p className="text-sm text-fg">{spec.question}</p>
          </div>
          <div>
            <div className="eyebrow mb-1.5">Concepts</div>
            <div className="flex flex-wrap gap-1.5">
              {spec.concepts.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => showConcept(c)}
                  className="rounded-xs border border-echo-line bg-echo-soft px-1.5 py-px text-xs text-echo-strong hover:bg-echo/20"
                >
                  {conceptById.get(c)?.title ?? c}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
