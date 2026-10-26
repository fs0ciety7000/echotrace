import { blank, command, concept, heading, line, muted, plain, subtle, table } from '../output.ts';
import { CATEGORY_LABELS, type Command, type CommandCategory } from '../shell/command.ts';
import type { Line } from '../types.ts';

export const help: Command = {
  name: 'help',
  category: 'base',
  summary: 'liste les commandes disponibles',
  usage: 'help [commande]',
  complete: 'command',
  concepts: ['systeme.shell'],
  run({ argv, engine }) {
    if (argv[0]) return man.run({ argv, stdin: null, engine });
    const out: Line[] = [line(heading('COMMANDES DISPONIBLES')), blank()];
    const byCat = new Map<CommandCategory, Command[]>();
    for (const c of engine.registry.all()) {
      if (c.hidden) continue;
      byCat.set(c.category, [...(byCat.get(c.category) ?? []), c]);
    }
    for (const [cat, cmds] of byCat) {
      out.push(line(subtle(CATEGORY_LABELS[cat].toUpperCase())));
      out.push(...table(cmds.map((c) => [plain('  '), command(c.name, `man ${c.name}`), muted(c.summary)])));
      out.push(blank());
    }
    out.push(
      line(
        subtle('Astuces : '),
        plain('Tab'),
        subtle(' complète, '),
        plain('↑ ↓'),
        subtle(" parcourent l'historique, "),
        command('man <commande>'),
        subtle(' détaille.'),
      ),
    );
    return out;
  },
};

export const man: Command = {
  name: 'man',
  category: 'base',
  summary: "affiche le manuel d'une commande",
  usage: 'man <commande>',
  complete: 'command',
  run({ argv, engine }) {
    const name = argv[0];
    if (!name) return [line(plain('Quelle page de manuel veux-tu ? ex. '), command('man nmap'))];
    const cmd = engine.registry.get(name);
    if (!cmd) return [line(plain(`Pas d'entrée de manuel pour ${name}`))];
    const out: Line[] = [
      line(heading(cmd.name.toUpperCase()), subtle(`  —  ${cmd.summary}`)),
      blank(),
      line(subtle('SYNOPSIS')),
      line(plain('  '), command(cmd.usage, cmd.name)),
    ];
    if (cmd.aliases?.length) out.push(line(subtle('  alias : '), plain(cmd.aliases.join(', '))));
    if (cmd.description) {
      out.push(blank(), line(subtle('DESCRIPTION')));
      for (const l of cmd.description.split('\n')) out.push(line(plain(`  ${l}`)));
    }
    if (cmd.examples?.length) {
      out.push(blank(), line(subtle('EXEMPLES')));
      for (const ex of cmd.examples) out.push(line(plain('  '), command(ex)));
    }
    const concepts = (cmd.concepts ?? []).filter((c) => engine.concepts.has(c));
    if (concepts.length) {
      out.push(blank(), line(subtle('FICHES LIÉES')));
      out.push(
        line(
          plain('  '),
          ...concepts.flatMap((c, i) => [...(i ? [plain('  ')] : []), concept(engine.concepts.get(c)?.title ?? c, c)]),
        ),
      );
    }
    return out;
  },
};

export const clear: Command = {
  name: 'clear',
  aliases: ['cls'],
  category: 'base',
  summary: "efface l'écran",
  usage: 'clear',
  run: () => ({ lines: [], clear: true }),
};

export const echoCmd: Command = {
  name: 'echo',
  category: 'base',
  summary: 'affiche du texte',
  usage: 'echo <texte…>',
  run: ({ argv }) => [line(plain(argv.join(' ')))],
};

export const whoami: Command = {
  name: 'whoami',
  category: 'base',
  summary: "affiche l'utilisateur courant",
  usage: 'whoami',
  run: ({ engine }) => [line(plain(engine.state.session.user))],
};

export const hostname: Command = {
  name: 'hostname',
  category: 'base',
  summary: 'affiche le nom de la machine courante',
  usage: 'hostname',
  run: ({ engine }) => [line(plain(engine.host().hostname))],
};

export const history: Command = {
  name: 'history',
  category: 'base',
  summary: 'historique des commandes',
  usage: 'history',
  run: ({ engine }) => table(engine.state.session.history.map((h, i) => [subtle(String(i + 1).padStart(4)), plain(h)])),
};

export const baseCommands = [help, man, clear, echoCmd, whoami, hostname, history];
