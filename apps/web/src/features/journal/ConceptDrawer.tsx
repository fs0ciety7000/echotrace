import { mastery } from '@echotrace/engine';
import { useCallback } from 'react';
import { CATEGORY_TITLES, conceptById } from '../../content/index.ts';
import { useGame } from '../../state/game.ts';
import { Drawer } from '../../ui/Drawer.tsx';
import { Markdown } from '../../ui/Markdown.tsx';
import { MasteryMeter } from './MasteryMeter.tsx';

/** Side sheet showing a learning fiche. Opening it counts as studying it. */
export function ConceptDrawer() {
  const id = useGame((s) => s.openConcept);
  const show = useGame((s) => s.showConcept);
  const engine = useGame((s) => s.engine);
  useGame((s) => s.rev);
  const concept = id ? conceptById.get(id) : undefined;
  const close = useCallback(() => show(null), [show]);

  if (!concept) return null;
  const m = mastery(engine?.journal[concept.id]);

  return (
    <Drawer
      label={`Fiche : ${concept.title}`}
      onClose={close}
      eyebrow={<span className="eyebrow text-echo-strong!">{CATEGORY_TITLES[concept.category]}</span>}
      header={
        <>
          <h2 className="mt-2 text-xl font-semibold">{concept.title}</h2>
          <code className="font-mono text-xs text-fg-subtle">learn {concept.id}</code>
          <p className="mt-1.5 text-sm text-fg-muted">{concept.summary}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-fg-subtle">
            <MasteryMeter value={m} />
            <span>{['inconnue', 'rencontrée', 'étudiée', 'validée'][m]}</span>
          </div>
        </>
      }
    >
      <Markdown source={concept.body} />
      {concept.related.length > 0 && (
        <div className="mt-8 border-t border-line pt-4">
          <div className="eyebrow mb-2">Fiches liées</div>
          <div className="flex flex-wrap gap-1.5">
            {concept.related.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => show(r)}
                className="rounded-xs border border-echo-line bg-echo-soft px-2 py-0.5 text-xs text-echo-strong hover:bg-echo/20"
              >
                {conceptById.get(r)?.title ?? r}
              </button>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
