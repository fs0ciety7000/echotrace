import { blank, concept, danger, line, muted, plain, subtle, success } from '../output.ts';
import type { Command } from '../shell/command.ts';
import type { Line } from '../types.ts';
import { getNode } from '../vfs.ts';
import { canReach, findHost } from '../world.ts';

const MAX_ATTEMPTS = 3;

export const ssh: Command = {
  name: 'ssh',
  category: 'acces',
  summary: 'ouvre une session sur une machine distante',
  usage: 'ssh [utilisateur@]hôte',
  description:
    'Se connecte à un serveur SSH (port 22) avec un compte et un mot de passe.\nToute connexion — réussie ou non — est journalisée côté serveur (souvent /var/log/auth.log).\n`exit` ferme la session et te ramène à la machine précédente.',
  examples: ['ssh stagiaire@banc-01'],
  concepts: ['systeme.ssh'],
  complete: 'host',
  run({ argv, engine }) {
    const target = argv.find((a) => !a.startsWith('-'));
    if (!target) return [line(subtle(`usage : ${ssh.usage}`))];
    const at = target.indexOf('@');
    const user = at >= 0 ? target.slice(0, at) : engine.state.session.user;
    const hostQuery = at >= 0 ? target.slice(at + 1) : target;
    const h = findHost(engine.state.world, hostQuery);
    if (!h) return [line(danger(`ssh: Could not resolve hostname ${hostQuery}: Name or service not known`))];

    const me = engine.host();
    const service = h.services.find((s) => s.port === 22 && s.name === 'ssh');
    if (!canReach(me, h)) return [line(danger(`ssh: connect to host ${h.hostname} port 22: No route to host`))];
    if (service?.state !== 'open') {
      engine.advance(20_000);
      return [
        line(
          danger(
            `ssh: connect to host ${h.hostname} port 22: ${service ? 'Connection timed out' : 'Connection refused'}`,
          ),
        ),
      ];
    }
    if (h.id === me.id && user === engine.state.session.user) {
      return [line(muted('Tu es déjà connecté·e à cette machine avec ce compte.'))];
    }

    const account = h.accounts.find((a) => a.user === user);
    let attempts = 0;
    const askPassword = (): void =>
      engine.ask({ label: `${user}@${h.hostname}'s password: `, secret: true }, (input) => {
        attempts += 1;
        if (!account || account.password === null || account.password !== input) {
          engine.emit('auth.failed', { hostId: h.id, user });
          if (account?.password === null)
            return [line(danger(`${user}@${h.hostname}: Permission denied (publickey).`))];
          if (attempts < MAX_ATTEMPTS) {
            askPassword();
            return [line(danger('Permission denied, please try again.'))];
          }
          return [
            line(danger(`${user}@${h.hostname}: Permission denied (publickey,password).`)),
            line(
              muted('› Chaque échec laisse une ligne « Failed password » dans les journaux du serveur. '),
              concept('Journaux', 'forensique.logs'),
            ),
          ];
        }

        const s = engine.state.session;
        s.stack.push({ hostId: s.hostId, user: s.user, cwd: s.cwd });
        s.hostId = h.id;
        s.user = user;
        s.cwd = account.home;
        engine.knowledgeOf(h.id).accessed = true;
        engine.discover(h);
        engine.emit('session.opened', { hostId: h.id, user });

        const out: Line[] = [];
        const motd = getNode(h.fs, '/etc/motd');
        if (motd?.kind === 'file') {
          out.push(
            ...motd.content
              .replace(/\n$/, '')
              .split('\n')
              .map((l) => line(plain(l))),
            blank(),
          );
        } else {
          out.push(line(plain(`Welcome to ${h.os}`)), blank());
        }
        out.push(
          line(
            subtle('Last login: '),
            plain(new Date(engine.state.clock - 86_400_000).toUTCString()),
            subtle(` from ${me.ip}`),
          ),
        );
        return out;
      });

    askPassword();
    return [];
  },
};

export const exit: Command = {
  name: 'exit',
  aliases: ['logout'],
  category: 'acces',
  summary: 'ferme la session distante courante',
  usage: 'exit',
  run({ engine }) {
    const s = engine.state.session;
    const prev = s.stack.pop();
    if (!prev) return [line(muted('Tu es sur ton poste ECHO : aucune session distante à fermer.'))];
    const closed = engine.host();
    engine.emit('session.closed', { hostId: closed.id, user: s.user });
    s.hostId = prev.hostId;
    s.user = prev.user;
    s.cwd = prev.cwd;
    return [line(plain('logout')), line(success(`Connection to ${closed.hostname} closed.`))];
  },
};

export const accessCommands = [ssh, exit];
