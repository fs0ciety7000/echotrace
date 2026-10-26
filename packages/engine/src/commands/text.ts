import { line, plain, subtle } from '../output.ts';
import type { Command } from '../shell/command.ts';
import { parseArgs } from '../shell/tokenize.ts';
import { plainLines, readInput } from './input.ts';

const count = (v: string | true | undefined, fallback: number): number => {
  const n = typeof v === 'string' ? Number.parseInt(v, 10) : Number.NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const head: Command = {
  name: 'head',
  category: 'fichiers',
  summary: 'affiche le début d’un fichier',
  usage: 'head [-n N] [fichier…]',
  description: 'Affiche les N premières lignes (10 par défaut). Lit l’entrée standard sans fichier.',
  examples: ['head -n 5 /var/log/vpn.log', 'sort ips.txt | head -n 3'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv, ['n']);
    const input = readInput(engine, 'head', _, stdin);
    return [...input.errors, ...plainLines(input.lines.slice(0, count(flags.n, 10)))];
  },
};

export const tail: Command = {
  name: 'tail',
  category: 'fichiers',
  summary: 'affiche la fin d’un fichier',
  usage: 'tail [-n N] [fichier…]',
  description:
    'Affiche les N dernières lignes (10 par défaut) — utile pour les événements les plus récents d’un journal.',
  examples: ['tail -n 20 /var/log/auth.log'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv, ['n']);
    const input = readInput(engine, 'tail', _, stdin);
    const n = count(flags.n, 10);
    return [...input.errors, ...plainLines(n === 0 ? [] : input.lines.slice(-n))];
  },
};

export const wc: Command = {
  name: 'wc',
  category: 'fichiers',
  summary: 'compte lignes, mots et caractères',
  usage: 'wc [-l] [fichier…]',
  description: '-l ne compte que les lignes. Combiné à grep : `grep Failed auth.log | wc -l` compte les échecs.',
  examples: ['grep Failed /var/log/auth.log | wc -l'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv);
    const input = readInput(engine, 'wc', _, stdin);
    const lines = input.lines.filter((l, i) => !(i === input.lines.length - 1 && l === ''));
    const words = lines.reduce((n, l) => n + l.split(/\s+/).filter(Boolean).length, 0);
    const chars = lines.reduce((n, l) => n + l.length + 1, 0);
    const label = _.length === 1 ? ` ${_[0]}` : '';
    const value = flags.l
      ? `${lines.length}`
      : `${String(lines.length).padStart(7)} ${String(words).padStart(7)} ${String(chars).padStart(7)}`;
    return [...input.errors, line(plain(value + label))];
  },
};

/** Leading number of a line (after optional spaces), for `sort -n`. */
const leadingNumber = (l: string): number => Number.parseFloat(l.trim().split(/\s+/)[0] ?? '') || 0;

export const sort: Command = {
  name: 'sort',
  category: 'fichiers',
  summary: 'trie des lignes',
  usage: 'sort [-n] [-r] [-u] [fichier…]',
  description:
    '-n tri numérique · -r ordre inverse · -u supprime les doublons.\nClassique : `… | sort | uniq -c | sort -rn` classe les valeurs par fréquence.',
  examples: ['cut -d " " -f 11 vpn.log | sort | uniq -c | sort -rn'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv);
    const input = readInput(engine, 'sort', _, stdin);
    let lines = [...input.lines];
    if (flags.n) lines.sort((a, b) => leadingNumber(a) - leadingNumber(b) || a.localeCompare(b));
    else lines.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    if (flags.r) lines.reverse();
    if (flags.u) lines = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);
    return [...input.errors, ...plainLines(lines)];
  },
};

export const uniq: Command = {
  name: 'uniq',
  category: 'fichiers',
  summary: 'fusionne les lignes identiques consécutives',
  usage: 'uniq [-c] [fichier…]',
  description:
    'Ne fusionne que les doublons **adjacents** : on trie d’abord (`sort | uniq`).\n-c préfixe chaque ligne par son nombre d’occurrences.',
  examples: ['sort ips.txt | uniq -c'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv);
    const input = readInput(engine, 'uniq', _, stdin);
    const groups: { value: string; n: number }[] = [];
    for (const l of input.lines) {
      const last = groups[groups.length - 1];
      if (last && last.value === l) last.n += 1;
      else groups.push({ value: l, n: 1 });
    }
    return [
      ...input.errors,
      ...plainLines(groups.map((g) => (flags.c ? `${String(g.n).padStart(7)} ${g.value}` : g.value))),
    ];
  },
};

export const cut: Command = {
  name: 'cut',
  category: 'fichiers',
  summary: 'extrait des colonnes',
  usage: 'cut -d <séparateur> -f <n[,m]> [fichier…]',
  description:
    'Découpe chaque ligne selon <séparateur> et garde les champs demandés (numérotés à partir de 1).\nAttention : deux espaces consécutifs créent un champ vide.',
  examples: ['cut -d " " -f 1,2 auth.log', 'cut -d , -f 3 export.csv'],
  concepts: ['forensique.pipelines'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv, ['d', 'f']);
    if (typeof flags.f !== 'string') return [line(subtle(`usage : ${cut.usage}`))];
    const delim = typeof flags.d === 'string' ? flags.d.slice(0, 1) || '\t' : '\t';
    const fields = flags.f
      .split(',')
      .flatMap((p) => {
        const [a, b] = p.split('-').map((x) => Number.parseInt(x, 10));
        if (a === undefined || Number.isNaN(a)) return [];
        if (b === undefined) return p.includes('-') ? Array.from({ length: 50 }, (_x, i) => a + i) : [a];
        return Array.from({ length: Math.max(0, b - a + 1) }, (_x, i) => a + i);
      })
      .filter((n) => n >= 1);
    const input = readInput(engine, 'cut', _, stdin);
    return [
      ...input.errors,
      ...plainLines(
        input.lines.map((l) => {
          const parts = l.split(delim);
          if (parts.length === 1) return l; // like cut: lines without the delimiter pass through
          return fields
            .filter((f) => f <= parts.length)
            .map((f) => parts[f - 1])
            .join(delim);
        }),
      ),
    ];
  },
};

export const textCommands = [head, tail, wc, sort, uniq, cut];
