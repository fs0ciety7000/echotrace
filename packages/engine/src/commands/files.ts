import { accent, danger, line, path, plain, subtle, table } from '../output.ts';
import type { Command } from '../shell/command.ts';
import { parseArgs } from '../shell/tokenize.ts';
import type { Line, Span } from '../types.ts';
import { getNode, listDir } from '../vfs.ts';

export const pwd: Command = {
  name: 'pwd',
  category: 'fichiers',
  summary: 'affiche le répertoire courant',
  usage: 'pwd',
  concepts: ['systeme.fichiers'],
  run: ({ engine }) => [line(path(engine.state.session.cwd))],
};

export const ls: Command = {
  name: 'ls',
  category: 'fichiers',
  summary: "liste le contenu d'un répertoire",
  usage: 'ls [-a] [-l] [chemin]',
  description:
    'Sans argument, liste le répertoire courant.\n-a affiche aussi les fichiers cachés (qui commencent par un point).\n-l affiche le détail : permissions, propriétaire, taille.',
  examples: ['ls', 'ls -la /var/log'],
  concepts: ['systeme.fichiers'],
  complete: 'path',
  run({ argv, engine }) {
    const { _, flags } = parseArgs(argv);
    const target = engine.resolve(_[0] ?? '.');
    const node = getNode(engine.host().fs, target);
    if (!node) return [line(danger(`ls: cannot access '${_[0]}': No such file or directory`))];
    engine.emit('dir.listed', { hostId: engine.host().id, path: target });
    if (node.kind === 'file') return [line(path(_[0] as string, target))];

    const entries = listDir(node, flags.a === true);
    const owner = target.startsWith(engine.home()) ? engine.state.session.user : 'root';
    if (flags.l) {
      return table(
        entries.map(([name, child]) => {
          const full = target === '/' ? `/${name}` : `${target}/${name}`;
          const isDir = child.kind === 'dir';
          return [
            subtle(isDir ? 'drwxr-xr-x' : '-rw-r--r--'),
            subtle(owner),
            subtle(owner),
            plain(String(isDir ? 4096 : child.content.length).padStart(5)),
            path(isDir ? `${name}/` : name, full),
          ];
        }),
        1,
      );
    }
    if (entries.length === 0) return [];
    const spans: Span[] = [];
    entries.forEach(([name, child], i) => {
      const full = target === '/' ? `/${name}` : `${target}/${name}`;
      if (i > 0) spans.push(plain('  '));
      spans.push(child.kind === 'dir' ? path(`${name}/`, full) : { t: name, s: 'plain', ref: full });
    });
    return [spans];
  },
};

export const cd: Command = {
  name: 'cd',
  category: 'fichiers',
  summary: 'change de répertoire',
  usage: 'cd [chemin]',
  description: 'Sans argument, retourne dans ton répertoire personnel (~).\n`cd ..` remonte d’un niveau.',
  concepts: ['systeme.fichiers'],
  complete: 'path',
  run({ argv, engine }) {
    const target = engine.resolve(argv[0] ?? '~');
    const node = getNode(engine.host().fs, target);
    if (!node) return [line(danger(`cd: ${argv[0]}: No such file or directory`))];
    if (node.kind !== 'dir') return [line(danger(`cd: ${argv[0]}: Not a directory`))];
    engine.state.session.cwd = target;
    return [];
  },
};

export const cat: Command = {
  name: 'cat',
  category: 'fichiers',
  summary: "affiche le contenu d'un fichier",
  usage: 'cat <fichier…>',
  examples: ['cat bienvenue.txt', 'cat /etc/hostname'],
  concepts: ['systeme.fichiers'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    if (argv.length === 0) return stdin ?? [line(subtle('usage : cat <fichier…>'))];
    const out: Line[] = [];
    for (const arg of argv) {
      const target = engine.resolve(arg);
      const node = getNode(engine.host().fs, target);
      if (!node) out.push(line(danger(`cat: ${arg}: No such file or directory`)));
      else if (node.kind === 'dir') out.push(line(danger(`cat: ${arg}: Is a directory`)));
      else {
        const content = node.content.endsWith('\n') ? node.content.slice(0, -1) : node.content;
        for (const l of content.split('\n')) out.push(line(plain(l)));
        engine.emit('file.read', { hostId: engine.host().id, path: target });
      }
    }
    return out;
  },
};

function highlight(text: string, pattern: string, ignoreCase: boolean): Span[] {
  if (!pattern) return [plain(text)];
  const hay = ignoreCase ? text.toLowerCase() : text;
  const needle = ignoreCase ? pattern.toLowerCase() : pattern;
  const spans: Span[] = [];
  let from = 0;
  let idx = hay.indexOf(needle, from);
  while (idx >= 0) {
    if (idx > from) spans.push(plain(text.slice(from, idx)));
    spans.push(accent(text.slice(idx, idx + pattern.length)));
    from = idx + pattern.length;
    idx = hay.indexOf(needle, from);
  }
  if (from < text.length) spans.push(plain(text.slice(from)));
  return spans;
}

export const grep: Command = {
  name: 'grep',
  category: 'fichiers',
  summary: 'filtre les lignes contenant un motif',
  usage: 'grep [-i] [-v] [-n] <motif> [fichier…]',
  description:
    "Affiche les lignes qui contiennent <motif> (recherche littérale).\n-i ignore la casse · -v inverse (lignes qui NE contiennent PAS) · -n numérote.\nSans fichier, lit l'entrée standard : cat auth.log | grep Failed",
  examples: ['grep Failed /var/log/auth.log', 'cat notes.txt | grep -i mot'],
  concepts: ['forensique.logs'],
  complete: 'path',
  run({ argv, stdin, engine }) {
    const { _, flags } = parseArgs(argv);
    const [pattern, ...files] = _;
    if (pattern === undefined) return [line(subtle('usage : grep [-i] [-v] [-n] <motif> [fichier…]'))];
    const ignoreCase = flags.i === true;
    const invert = flags.v === true;
    const sources: { name: string; lines: string[] }[] = [];
    const errors: Line[] = [];
    if (files.length === 0) {
      sources.push({ name: '', lines: (stdin ?? []).map((l) => l.map((s) => s.t).join('')) });
    }
    for (const f of files) {
      const target = engine.resolve(f);
      const node = getNode(engine.host().fs, target);
      if (!node) errors.push(line(danger(`grep: ${f}: No such file or directory`)));
      else if (node.kind === 'dir') errors.push(line(danger(`grep: ${f}: Is a directory`)));
      else {
        sources.push({ name: f, lines: node.content.replace(/\n$/, '').split('\n') });
        engine.emit('file.read', { hostId: engine.host().id, path: target });
      }
    }
    const out: Line[] = [...errors];
    const multi = sources.length > 1;
    for (const src of sources) {
      src.lines.forEach((text, i) => {
        const hit = (ignoreCase ? text.toLowerCase() : text).includes(ignoreCase ? pattern.toLowerCase() : pattern);
        if (hit === invert) return;
        const prefix: Span[] = [];
        if (multi) prefix.push({ t: src.name, s: 'echo' }, subtle(':'));
        if (flags.n) prefix.push(accent(String(i + 1)), subtle(':'));
        out.push([...prefix, ...(invert ? [plain(text)] : highlight(text, pattern, ignoreCase))]);
      });
    }
    return out;
  },
};

export const fileCommands = [pwd, ls, cd, cat, grep];
