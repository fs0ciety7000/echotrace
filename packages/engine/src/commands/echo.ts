import { CONCEPT_CATEGORIES } from '../content/schema.ts';
import { mastery } from '../journal.ts';
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

const CATEGORY_TITLES: Record<(typeof CONCEPT_CATEGORIES)[number], string> = {
  reseau: 'Réseau',
  systeme: 'Système',
  reconnaissance: 'Reconnaissance',
  forensique: 'Forensique',
  defense: 'Défense',
  ethique: 'Éthique & droit',
};

const masteryDots = (m: number): string => '●'.repeat(m) + '○'.repeat(3 - m);

export const objectives: Command = {
  name: 'objectives',
  aliases: ['obj'],
  category: 'echo',
  summary: "affiche les objectifs de l'opération en cours",
  usage: 'objectives',
  run({ engine }) {
    const m = engine.mission;
    if (!m) return [line(muted('Aucune opération en cours.'))];
    const out: Line[] = [line(heading(m.spec.title.toUpperCase()), subtle(`  ·  ${m.spec.summary}`)), blank()];
    for (const o of m.objectives()) {
      if (o.state === 'locked') continue;
      const glyph = o.optional ? '◇' : '◆';
      out.push(
        o.state === 'done'
          ? line(success(`${glyph} `), muted(o.label), success('  ✓'))
          : line({ t: `${glyph} `, s: 'accent' }, plain(o.label), ...(o.optional ? [subtle('  (optionnel)')] : [])),
      );
    }
    if (m.progress.status === 'completed')
      out.push(blank(), line(success('Opération accomplie.'), muted(' Le débrief est disponible.')));
    else out.push(blank(), line(subtle('Bloqué·e ? '), command('hint')));
    return out;
  },
};

export const hint: Command = {
  name: 'hint',
  aliases: ['indice'],
  category: 'echo',
  summary: "demande un indice à Noor pour l'objectif courant",
  usage: 'hint',
  run({ engine }) {
    const m = engine.mission;
    const o = m?.current();
    if (!m || !o) return [line(muted('Rien à débloquer pour le moment.'))];
    if (!m.progress.hintsUsed.includes(o.id)) m.progress.hintsUsed.push(o.id);
    engine.emit('hint.requested', { missionId: m.spec.id, objectiveId: o.id });
    return [
      line(
        echo('Noor › '),
        plain(
          o.hint ?? 'Relis le briefing et tape help : la réponse est souvent dans une commande que tu connais déjà.',
        ),
      ),
    ];
  },
};

export const journal: Command = {
  name: 'journal',
  category: 'echo',
  summary: "ouvre ton journal d'apprentissage",
  usage: 'journal',
  description: 'Liste les fiches rencontrées et ta maîtrise : ●○○ rencontrée · ●●○ étudiée · ●●● validée par quiz.',
  run({ engine }) {
    const ids = Object.keys(engine.journal).filter((id) => engine.concepts.has(id));
    const out: Line[] = [
      line(heading("JOURNAL D'APPRENTISSAGE"), subtle(`  ${ids.length}/${engine.concepts.size} fiches`)),
      blank(),
    ];
    if (ids.length === 0)
      return [...out, line(muted('Vide pour l’instant. Chaque commande utilisée y dépose des fiches.'))];
    for (const cat of CONCEPT_CATEGORIES) {
      const inCat = ids.filter((id) => engine.concepts.get(id)?.category === cat);
      if (!inCat.length) continue;
      out.push(line(subtle(CATEGORY_TITLES[cat].toUpperCase())));
      out.push(
        ...table(
          inCat.map((id) => {
            const m = mastery(engine.journal[id]);
            return [
              plain('  '),
              { t: masteryDots(m), s: m >= 2 ? 'echo' : 'subtle' },
              concept(engine.concepts.get(id)?.title ?? id, id),
            ];
          }),
        ),
        blank(),
      );
    }
    out.push(line(subtle('Clique une fiche ou tape '), command('learn <id>'), subtle(' pour l’étudier.')));
    return out;
  },
};

/** Very small Markdown → spans renderer for the terminal (headings, bullets, emphasis stripped). */
function markdownToLines(md: string): Line[] {
  return md.split('\n').map((raw) => {
    const l = raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    if (/^#{1,6}\s/.test(l)) return line(heading(l.replace(/^#+\s*/, '').toUpperCase()));
    if (/^\s*[-*]\s/.test(l)) return line(plain(l.replace(/^(\s*)[-*]\s/, '$1  • ')));
    if (/^>\s?/.test(l)) return line(echo('│ '), muted(l.replace(/^>\s?/, '')));
    return line(plain(l));
  });
}

export const learn: Command = {
  name: 'learn',
  aliases: ['fiche'],
  category: 'echo',
  summary: 'étudie une fiche du journal',
  usage: 'learn <id-de-fiche>',
  examples: ['learn reseau.port'],
  complete: 'concept',
  run({ argv, engine }) {
    const id = argv[0];
    if (!id) return journal.run({ argv: [], stdin: null, engine });
    const c = engine.concepts.get(id);
    if (!c) return [line(muted(`Aucune fiche « ${id} ». Tape `), command('journal'), muted(' pour la liste.'))];
    engine.study(id);
    return [
      line(echo(CATEGORY_TITLES[c.category].toUpperCase()), subtle(` · ${c.id}`)),
      line(heading(c.title)),
      line(muted(c.summary)),
      blank(),
      ...markdownToLines(c.body),
    ];
  },
};

const formatTime = (ms: number): string => new Date(ms).toISOString().slice(11, 16);

export const mail: Command = {
  name: 'mail',
  aliases: ['messages'],
  category: 'echo',
  summary: 'lit les messages de la cellule',
  usage: 'mail [n]',
  description:
    'Sans argument, liste les messages reçus (● = non lu).\n`mail 2` affiche le message n°2 et le marque comme lu.',
  run({ argv, engine }) {
    const m = engine.mission;
    const inbox = m?.inbox() ?? [];
    if (!m || inbox.length === 0) return [line(muted('Aucun message.'))];
    const n = argv[0] === undefined ? null : Number(argv[0]);
    if (n === null) {
      return [
        line(heading('MESSAGERIE ECHO'), subtle(`  ${m.unreadCount()} non lu(s)`)),
        blank(),
        ...table(
          inbox.map((msg, i) => [
            msg.read ? subtle(' ') : { t: '●', s: 'accent' },
            command(String(i + 1), `mail ${i + 1}`),
            subtle(formatTime(msg.at)),
            echo(msg.from),
            msg.read ? muted(msg.subject ?? firstLine(msg.body)) : plain(msg.subject ?? firstLine(msg.body)),
          ]),
        ),
      ];
    }
    const msg = Number.isInteger(n) ? inbox[n - 1] : undefined;
    if (!msg) return [line(muted(`Pas de message n°${argv[0]}. Tape `), command('mail'), muted('.'))];
    m.markRead(msg.id);
    return [
      line(subtle('De : '), echo(msg.from), subtle(`  ·  ${formatTime(msg.at)} UTC`)),
      ...(msg.subject ? [line(subtle('Objet : '), plain(msg.subject))] : []),
      blank(),
      ...markdownToLines(msg.body.trim()),
    ];
  },
};

function firstLine(body: string): string {
  const l = body.trim().split('\n')[0] ?? '';
  return l.length > 60 ? `${l.slice(0, 57)}…` : l;
}

export const report: Command = {
  name: 'report',
  aliases: ['rapport'],
  category: 'echo',
  summary: "soumet une conclusion d'enquête",
  usage: 'report [id réponse…]',
  description:
    "Sans argument, liste les questions de l'opération et leur état.\n`report entree 198.51.100.77` soumet une réponse : elle doit découler des preuves, pas d'une supposition.",
  run({ argv, engine }) {
    const m = engine.mission;
    const questions = m?.questions() ?? [];
    if (!m || questions.length === 0) return [line(muted('Pas de rapport attendu pour cette opération.'))];
    const [id, ...rest] = argv;
    if (!id) {
      return [
        line(
          heading("RAPPORT D'ENQUÊTE"),
          subtle(`  ${questions.filter((q) => q.state === 'confirmed').length}/${questions.length} conclusions`),
        ),
        blank(),
        ...questions.map((q) =>
          q.state === 'confirmed'
            ? line(success('✓ '), subtle(`${q.id.padEnd(12)} `), muted(q.prompt))
            : q.state === 'open'
              ? line({ t: '◆ ', s: 'accent' }, plain(`${q.id.padEnd(12)} `), plain(q.prompt))
              : line(subtle(`· ${q.id.padEnd(12)} (verrouillée)`)),
        ),
        blank(),
        line(subtle('Soumettre : '), command('report <id> <réponse>')),
      ];
    }
    if (rest.length === 0) return [line(muted(`Il manque la réponse : report ${id} <réponse>`))];
    const r = m.submit(id, rest.join(' '));
    if (r.ok) return [line(success('✓ Conclusion confirmée. ')), ...(r.explain ? [line(muted(r.explain))] : [])];
    switch (r.reason) {
      case 'unknown':
        return [line(muted(`Pas de question « ${id} ». Tape `), command('report'), muted('.'))];
      case 'locked':
        return [line(muted('Cette question dépend d’une autre conclusion. Avance dans l’ordre.'))];
      case 'already':
        return [line(muted('Déjà établi.'))];
      default:
        return [
          line(warning('✗ Ce n’est pas cohérent avec les preuves.')),
          ...(r.hint ? [line(echo('Noor › '), plain(r.hint))] : []),
        ];
    }
  },
};

export const echoCommands = [objectives, hint, report, mail, journal, learn];
