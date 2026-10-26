import { line, muted, plain, subtle, table, warning } from '../output.ts';
import type { Command } from '../shell/command.ts';

export const ps: Command = {
  name: 'ps',
  category: 'base',
  summary: 'liste les processus en cours',
  usage: 'ps [aux]',
  description:
    'Affiche les programmes qui tournent sur la machine courante, avec leur utilisateur et leur ligne de commande.\nUn nom anodin peut cacher un programme indésirable : regarde aussi le chemin et les arguments.',
  examples: ['ps aux', 'ps aux | grep update'],
  concepts: ['forensique.persistance'],
  run({ engine }) {
    const h = engine.host();
    engine.emit('process.listed', { hostId: h.id });
    const procs = h.processes ?? [];
    if (procs.length === 0) return [line(muted('(aucun processus notable)'))];
    return table([
      [subtle('USER'), subtle('PID'), subtle('COMMAND')],
      ...procs.map((p) => [plain(p.user), plain(String(p.pid)), plain(p.cmd)]),
    ]);
  },
};

export const netstat: Command = {
  name: 'netstat',
  aliases: ['ss'],
  category: 'reseau',
  summary: 'liste les connexions réseau de la machine',
  usage: 'netstat [-tunap]',
  description:
    'Montre les ports en écoute (LISTEN) et les connexions établies (ESTABLISHED), avec le programme responsable.\nUne connexion sortante régulière vers une adresse inconnue mérite toujours une explication.',
  examples: ['netstat -tunap'],
  concepts: ['reseau.beacon'],
  run({ engine }) {
    const h = engine.host();
    engine.emit('connections.listed', { hostId: h.id });
    const conns = h.connections ?? [];
    if (conns.length === 0) return [line(muted('(aucune connexion)'))];
    const procs = h.processes ?? [];
    return table([
      [subtle('Proto'), subtle('Local Address'), subtle('Foreign Address'), subtle('State'), subtle('PID/Program')],
      ...conns.map((c) => {
        const prog =
          c.program ??
          procs
            .find((p) => p.pid === c.pid)
            ?.cmd.split(' ')[0]
            ?.split('/')
            .pop() ??
          '-';
        return [
          plain(c.proto),
          plain(c.local),
          plain(c.remote),
          c.state === 'ESTABLISHED' ? warning(c.state) : plain(c.state),
          plain(c.pid ? `${c.pid}/${prog}` : '-'),
        ];
      }),
    ]);
  },
};

export const systemCommands = [ps, netstat];
