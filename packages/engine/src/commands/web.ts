import type { Engine } from '../engine.ts';
import { blank, concept, danger, heading, line, muted, plain, subtle, success, table, warning } from '../output.ts';
import type { Command } from '../shell/command.ts';
import { parseArgs } from '../shell/tokenize.ts';
import type { Host, Line, Service } from '../types.ts';
import { canReach, findHost } from '../world.ts';

interface Target {
  host: Host;
  service: Service;
  port: number;
}

/** Resolves `host[:port]` to a reachable, open service. Returns an error line otherwise. */
function target(engine: Engine, cmd: string, hostPart: string, port: number): Target | Line {
  const host = findHost(engine.state.world, hostPart);
  if (!host) return line(danger(`${cmd}: impossible de résoudre « ${hostPart} »`));
  if (!canReach(engine.host(), host))
    return line(danger(`${cmd}: ${host.hostname} injoignable depuis ${engine.host().hostname}`));
  const service = host.services.find((s) => s.port === port && s.state === 'open');
  if (!service) return line(danger(`${cmd}: connexion refusée sur ${host.hostname}:${port}`));
  return { host, service, port };
}

const isLine = (t: Target | Line): t is Line => Array.isArray(t);

export const curl: Command = {
  name: 'curl',
  category: 'reseau',
  summary: 'envoie une requête HTTP et affiche la réponse',
  usage: 'curl [-I] <url>',
  description:
    'Récupère une page web. -I n’affiche que les en-têtes de réponse : le serveur y dévoile souvent son logiciel et sa version.\nURL : http://hôte[:port]/chemin ou https://…',
  examples: ['curl -I https://vpn.ch-vallon.example', 'curl http://banc-01/'],
  concepts: ['reseau.http'],
  complete: 'host',
  run({ argv, engine }) {
    const { _, flags } = parseArgs(argv);
    const raw = _[0];
    if (!raw) return [line(subtle(`usage : ${curl.usage}`))];
    const m = /^(https?):\/\/([^/:]+)(?::(\d+))?(\/.*)?$/.exec(raw.includes('://') ? raw : `http://${raw}`);
    if (!m) return [line(danger(`curl: URL invalide « ${raw} »`))];
    const [, scheme, hostPart, portRaw, pathRaw] = m as unknown as [string, string, string, string?, string?];
    const port = portRaw ? Number(portRaw) : scheme === 'https' ? 443 : 80;
    const path = pathRaw ?? '/';
    const t = target(engine, 'curl', hostPart, port);
    if (isLine(t)) return [t];
    engine.advance(1500);
    const res = t.service.http ?? { status: 200, headers: {}, body: '' };
    engine.emit('http.requested', { hostId: t.host.id, port, path, status: res.status });

    const head: Line[] = [
      line(plain('HTTP/1.1 '), res.status < 400 ? success(String(res.status)) : warning(String(res.status))),
      ...Object.entries(res.headers).map(([k, v]) => line(subtle(`${k}: `), plain(v))),
    ];
    if (flags.I) return head;
    return res.body
      ? res.body
          .replace(/\n$/, '')
          .split('\n')
          .map((l) => line(plain(l)))
      : head;
  },
};

export const cert: Command = {
  name: 'cert',
  category: 'reseau',
  summary: 'inspecte le certificat TLS d’un service (outil ECHO)',
  usage: 'cert <hôte>[:port]',
  description: [
    'Affiche le certificat présenté par un service chiffré (port 443 par défaut) et explique ses champs.',
    'L’empreinte SHA-256 identifie un certificat de façon unique : la retrouver sur deux serveurs',
    'différents est un « écho » — un indice fort qu’ils sont opérés par la même main.',
    'Équivalent réel : openssl s_client puis openssl x509 -fingerprint.',
  ].join('\n'),
  examples: ['cert vpn.ch-vallon.example', 'cert 203.0.113.200:8443'],
  concepts: ['reseau.certificat-tls'],
  complete: 'host',
  run({ argv, engine }) {
    const raw = argv[0];
    if (!raw) return [line(subtle(`usage : ${cert.usage}`))];
    const [hostPart, portRaw] = raw.split(':') as [string, string?];
    const t = target(engine, 'cert', hostPart, portRaw ? Number(portRaw) : 443);
    if (isLine(t)) return [t];
    const c = t.service.tls;
    if (!c) return [line(warning(`${t.host.hostname}:${t.port} ne présente pas de certificat (service non chiffré).`))];
    engine.emit('tls.inspected', { hostId: t.host.id, port: t.port, sha256: c.sha256 });
    const selfSigned = c.subject === c.issuer;
    return [
      line(heading(`CERTIFICAT · ${t.host.hostname}:${t.port}`)),
      ...table([
        [subtle('Sujet'), plain(c.subject), muted('à qui le certificat a été délivré')],
        [
          subtle('Émetteur'),
          plain(c.issuer),
          muted(selfSigned ? 'identique au sujet : auto-signé' : 'l’autorité qui l’a signé'),
        ],
        [subtle('Valide'), plain(`${c.notBefore} → ${c.notAfter}`), muted('')],
        [subtle('Noms (SAN)'), plain(c.san.join(', ') || '—'), muted('domaines couverts')],
      ]),
      line(subtle('SHA-256  '), success(c.sha256)),
      blank(),
      ...(selfSigned ? [line(warning('⚠ Auto-signé : aucun tiers ne garantit l’identité du serveur.'))] : []),
      line(
        muted('› Note l’empreinte : on peut la rechercher ailleurs. '),
        concept('Certificat TLS', 'reseau.certificat-tls'),
      ),
    ];
  },
};

export const webCommands = [curl, cert];
