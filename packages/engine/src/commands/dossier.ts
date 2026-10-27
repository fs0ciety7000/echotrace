import { dossierProgressOf, solidity, unlockedItems } from '../dossier.ts';
import {
  blank,
  command,
  concept,
  echo,
  heading,
  line,
  muted,
  plain,
  subtle,
  success,
  table,
  warning,
} from '../output.ts';
import type { Command } from '../shell/command.ts';
import type { Line } from '../types.ts';

export const dossier: Command = {
  name: 'dossier',
  category: 'echo',
  summary: "consulte et complète le graphe d'enquête",
  usage: 'dossier · dossier relations · dossier relier <pièce> <pièce> <relation>',
  description: [
    'Le Dossier rassemble les pièces de l’enquête (personnes, organisations, infrastructures, artefacts).',
    'Relier deux pièces, c’est affirmer un lien : il n’est confirmé que si tes preuves l’établissent.',
    'La solidité mesure la part des liens établis par des moyens recevables.',
  ].join('\n'),
  examples: ['dossier', 'dossier relations', 'dossier relier edge-sync sso-legacy même certificat'],
  concepts: ['reconnaissance.pivot'],
  run({ argv, engine }) {
    const spec = engine.dossier;
    if (!spec) return [line(muted('Le Dossier n’est pas disponible ici.'))];
    const ctx = engine.dossierContext();
    const progress = dossierProgressOf(engine.campaign);
    const [sub, a, b, ...rel] = argv;

    if (sub === 'relations') {
      return [line(heading('RELATIONS POSSIBLES')), ...spec.relations.map((r) => line(plain(`  ${r}`)))];
    }

    if (sub === 'relier') {
      if (!a || !b || rel.length === 0) return [line(subtle(`usage : dossier relier <pièce> <pièce> <relation>`))];
      const r = engine.linkDossier(a, b, rel.join(' '));
      if (!r) return [];
      if (r.ok) {
        return [
          line(
            success(r.already ? '✓ Déjà établi : ' : '✓ Lien établi : '),
            plain(`${r.link.from} — ${r.link.relation} → ${r.link.to}`),
          ),
          line(muted(`  Preuve : ${r.link.evidence}`)),
          ...(r.link.admissible
            ? []
            : [
                line(
                  warning(
                    '  ⚠ Repose sur des documents obtenus hors des voies légales : il éclaire, il ne prouve pas.',
                  ),
                ),
              ]),
        ];
      }
      switch (r.reason) {
        case 'unknown':
          return [line(muted('Pièce inconnue ou pas encore au dossier. Tape '), command('dossier'), muted('.'))];
        case 'same':
          return [line(muted('Une pièce ne se relie pas à elle-même.'))];
        case 'relation':
          return [line(muted('Relation inconnue. Tape '), command('dossier relations'), muted('.'))];
        default:
          return [
            line(warning('✗ Rien dans tes preuves n’établit ce lien.'), muted(' Une intuition n’est pas une preuve.')),
          ];
      }
    }

    const items = unlockedItems(spec, ctx);
    const s = solidity(spec, progress, ctx);
    const confirmed = spec.links.filter((l) => progress.links.includes(l.id));
    const out: Line[] = [
      line(heading('DOSSIER'), subtle(`  solidité ${s.score} % · ${s.confirmed}/${s.available} liens établis`)),
      blank(),
      line(subtle('PIÈCES')),
      ...table(items.map((i) => [plain('  '), echo(i.id), muted(i.type), plain(i.label)])),
      blank(),
      line(subtle('LIENS ÉTABLIS')),
      ...(confirmed.length
        ? confirmed.map((l) =>
            line(
              plain('  '),
              plain(`${l.from} — ${l.relation} → ${l.to}`),
              ...(l.admissible ? [] : [warning('  (non recevable)')]),
            ),
          )
        : [line(muted('  aucun pour l’instant'))]),
      blank(),
      line(
        subtle('Relier : '),
        command('dossier relier <pièce> <pièce> <relation>'),
        muted('  · '),
        concept('Pivot', 'reconnaissance.pivot'),
      ),
    ];
    return out;
  },
};

export const dossierCommands = [dossier];
