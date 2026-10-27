import { campaignOrder, dossierProgressOf, mastery, solidity } from '@echotrace/engine';
import { useEffect, useRef } from 'react';
import { concepts, dossier, endings, getMission, missions } from '../content/index.ts';
import { useGame } from '../state/game.ts';
import { Button } from '../ui/Button.tsx';
import { cx } from '../ui/cx.ts';
import { Logo } from '../ui/Logo.tsx';
import { Markdown } from '../ui/Markdown.tsx';

/** Tone of each ending, as design-system tokens. */
const TONE: Record<string, { text: string; line: string }> = {
  lumiere: { text: 'text-signal', line: 'border-signal-line' },
  echo: { text: 'text-echo', line: 'border-echo-line' },
  silence: { text: 'text-danger', line: 'border-danger-line' },
  bruit: { text: 'text-warn', line: 'border-warn-line' },
};

export function Ending() {
  const engine = useGame((s) => s.engine);
  const toMenu = useGame((s) => s.toMenu);
  const newGame = useGame((s) => s.newGame);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => title.current?.focus(), []);

  const ending = endings.endings.find((e) => e.id === engine?.campaign.ending);
  if (!engine || !ending) return null;

  const { campaign } = engine;
  const tone = TONE[ending.id] ?? { text: 'text-fg', line: 'border-line' };
  const solid = solidity(dossier, dossierProgressOf(campaign), engine.dossierContext());
  const mastered = concepts.filter((c) => mastery(engine.journal[c.id]) === 3).length;
  const stats = [
    { label: 'Intégrité', value: String(campaign.integrity) },
    { label: 'Initiative', value: String(campaign.initiative) },
    { label: 'Solidité du Dossier', value: `${solid.score} %` },
    { label: 'Fiches maîtrisées', value: `${mastered}/${concepts.length}` },
  ];
  const path = campaignOrder(missions).flatMap(
    (m) =>
      getMission(m.id)?.choices.flatMap((c) => {
        const picked = campaign.decisions[`${m.id}/${c.id}`];
        const option = c.options.find((o) => o.id === picked);
        return option ? [{ key: `${m.id}/${c.id}`, mission: m.title, label: option.label }] : [];
      }) ?? [],
  );

  return (
    <main className="relative h-full overflow-y-auto bg-void">
      <div
        aria-hidden
        className="dot-grid pointer-events-none fixed inset-0 [mask-image:radial-gradient(ellipse_at_50%_20%,black,transparent_70%)]"
      />
      <article className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Logo size="sm" />
        <p className="eyebrow mt-12">Épilogue · fin de la campagne</p>
        <h1
          ref={title}
          tabIndex={-1}
          className={cx('mt-3 text-5xl font-semibold tracking-tight outline-none', tone.text)}
        >
          {ending.title}
        </h1>
        <p className="mt-3 text-lg text-fg">{ending.tagline}</p>

        <div className={cx('mt-10 border-l-2 pl-5', tone.line)}>
          <Markdown source={ending.text} />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-4 py-3">
              <dt className="eyebrow">{s.label}</dt>
              <dd className="tabular mt-1 font-mono text-lg text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>

        {path.length > 0 && (
          <section className="mt-10">
            <h2 className="eyebrow mb-3">Ton chemin</h2>
            <ol className="space-y-2">
              {path.map((p) => (
                <li key={p.key} className="flex gap-3 text-sm">
                  <span className="w-36 shrink-0 font-mono text-xs leading-5 text-fg-subtle">{p.mission}</span>
                  <span className="text-fg-muted">{p.label}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="mt-10 text-sm text-fg-subtle">
          Il existe quatre fins. Elles dépendent de tes décisions, de ton Intégrité et de ce que ton Dossier peut
          prouver. Ton journal d'apprentissage est conservé d'une partie à l'autre.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" onClick={toMenu}>
            Retour au menu
          </Button>
          <Button variant="ghost" onClick={newGame}>
            Nouvelle campagne
          </Button>
        </div>
      </article>
    </main>
  );
}
