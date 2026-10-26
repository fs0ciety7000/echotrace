import { mastery } from '@echotrace/engine';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { CATEGORY_TITLES, conceptById } from '../../content/index.ts';
import { useGame } from '../../state/game.ts';
import { Kbd } from '../../ui/Kbd.tsx';
import { Markdown } from '../../ui/Markdown.tsx';
import { MasteryMeter } from './MasteryMeter.tsx';

/** Side sheet showing a learning fiche. Opening it counts as studying it. */
export function ConceptDrawer() {
  const id = useGame((s) => s.openConcept);
  const show = useGame((s) => s.showConcept);
  const engine = useGame((s) => s.engine);
  useGame((s) => s.rev);
  const concept = id ? conceptById.get(id) : undefined;

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && show(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, show]);

  if (!concept) return null;
  const m = mastery(engine?.journal[concept.id]);

  return (
    <aside
      aria-label={`Fiche : ${concept.title}`}
      className="glass fixed top-3 right-3 bottom-3 z-30 flex w-[min(460px,calc(100%-1.5rem))] animate-rise flex-col overflow-hidden rounded-lg shadow-modal before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-echo before:opacity-70"
    >
      <header className="border-b border-line px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="eyebrow text-echo-strong!">{CATEGORY_TITLES[concept.category]}</span>
          <button
            type="button"
            onClick={() => show(null)}
            className="ml-auto flex items-center gap-2 text-fg-subtle hover:text-fg"
            aria-label="Fermer la fiche"
          >
            <Kbd>Échap</Kbd>
            <X size={16} />
          </button>
        </div>
        <h2 className="mt-2 text-xl font-semibold">{concept.title}</h2>
        <code className="font-mono text-xs text-fg-subtle">learn {concept.id}</code>
        <p className="mt-1.5 text-sm text-fg-muted">{concept.summary}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-fg-subtle">
          <MasteryMeter value={m} />
          <span>{['inconnue', 'rencontrée', 'étudiée', 'validée'][m]}</span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">
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
      </div>
    </aside>
  );
}
