import { validateMission } from './content/parse.ts';
import type { HostSpec, MissionSpec } from './content/schema.ts';

/**
 * Le Banc — generated exercises. A seed deterministically builds a small network with
 * an outdated service, a beacon and a noisy login source; the player maps, finds, contains.
 * Pure: same seed + level ⇒ same mission (no Math.random, no clock).
 */

export type SandboxLevel = 1 | 2 | 3;

export const SANDBOX_LEVELS: Record<SandboxLevel, { label: string; hosts: number; summary: string }> = {
  1: { label: 'Initiation', hosts: 4, summary: '4 machines, inventaire fourni.' },
  2: { label: 'Standard', hosts: 6, summary: '6 machines, un flux légitime pour brouiller les pistes.' },
  3: { label: 'Avancé', hosts: 8, summary: '8 machines, inventaire à reconstituer, journaux bruités.' },
};

export interface Sandbox {
  seed: string;
  level: SandboxLevel;
  mission: MissionSpec;
  /** A command sequence that solves the exercise (used by tests). */
  solution: string[];
}

export const SANDBOX_MISSION_ID = 'banc-sandbox';

/** Seeds are short, case-insensitive codes the player can share. */
export function normalizeSeed(seed: string): string {
  return seed
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 16);
}

function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for level generation. */
function rngFrom(seed: number) {
  let a = seed;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)] as T;
  const shuffle = <T>(xs: readonly T[]): T[] => {
    const out = [...xs];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  };
  return { next, int, pick, shuffle };
}

const NAMES = [
  'atlas',
  'borea',
  'cedre',
  'dune',
  'ecume',
  'fjord',
  'givre',
  'houle',
  'jade',
  'krill',
  'lagune',
  'mistral',
  'nacre',
  'orage',
  'pollen',
  'quartz',
  'ressac',
  'silex',
  'toundra',
  'ubac',
  'volcan',
] as const;

const ROLES = [
  { role: 'web', port: 80, name: 'http', product: 'nginx', version: '1.26.2', daemon: 'nginx: master process' },
  {
    role: 'fichiers',
    port: 445,
    name: 'microsoft-ds',
    product: 'Samba smbd',
    version: '4.19.5',
    daemon: '/usr/sbin/smbd',
  },
  {
    role: 'base',
    port: 5432,
    name: 'postgresql',
    product: 'PostgreSQL',
    version: '16.4',
    daemon: 'postgres -D /var/lib/postgresql',
  },
  {
    role: 'courrier',
    port: 25,
    name: 'smtp',
    product: 'Postfix smtpd',
    version: '3.8.6',
    daemon: '/usr/lib/postfix/sbin/master',
  },
  {
    role: 'supervision',
    port: 443,
    name: 'https',
    product: 'Vigie Console',
    version: '5.2.0',
    daemon: '/opt/vigie/console',
  },
  { role: 'annuaire', port: 389, name: 'ldap', product: 'OpenLDAP slapd', version: '2.6.8', daemon: '/usr/sbin/slapd' },
  { role: 'impression', port: 631, name: 'ipp', product: 'CUPS', version: '2.4.10', daemon: '/usr/sbin/cupsd' },
  { role: 'sauvegarde', port: 873, name: 'rsync', product: 'rsyncd', version: '3.3.0', daemon: 'rsync --daemon' },
] as const;

/** The fictional product the internal advisory flags, with a fixed and an outdated version. */
const ADVISORIES = [
  { product: 'Lumen HTTPd', port: 8080, name: 'http-alt', fixed: '3.2.1', old: ['2.9.4', '3.0.7', '3.1.2'] },
  { product: 'Portique SSO', port: 8443, name: 'https-alt', fixed: '7.4.0', old: ['6.8.2', '7.1.5', '7.3.9'] },
  { product: 'Relais Admin', port: 9090, name: 'http-admin', fixed: '12.0.3', old: ['10.4.1', '11.2.0', '11.9.8'] },
] as const;

const BEACONS = ['/var/tmp/.cache/updsvc', '/dev/shm/.syncd', '/var/tmp/.font-unix/fcache', '/tmp/.X11-lock/xsess'];
const EXTERNAL_NETS = ['203.0.113', '198.51.100'] as const;
const WORDS = ['ardoise', 'boussole', 'chalumeau', 'dynamo', 'escabeau', 'falaise', 'girouette', 'hublot'];
const MONTH_DAY = 'Mar 22';

const pad = (n: number) => String(n).padStart(2, '0');

export function generateSandbox(rawSeed: string, level: SandboxLevel = 2): Sandbox {
  const seed = normalizeSeed(rawSeed) || 'BANC';
  const r = rngFrom(hashSeed(`${seed}#${level}`));
  const count = SANDBOX_LEVELS[level].hosts;
  const subnet = `10.7.${r.int(20, 220)}`;
  const cidr = `${subnet}.0/24`;
  const names = r.shuffle(NAMES).slice(0, count);
  const roles = r.shuffle(ROLES).slice(0, count);
  const octets = r.shuffle(Array.from({ length: 200 }, (_, i) => i + 10)).slice(0, count);
  const advisory = r.pick(ADVISORIES);
  const auditPw = `${r.pick(WORDS)}-${r.int(10, 99)}`;
  const adminPw = `${r.pick(WORDS)}-${r.int(100, 999)}`;

  // Distinct roles for the three findings: outdated service, beacon, noisy login target.
  const order = r.shuffle(Array.from({ length: count }, (_, i) => i));
  const [iObsolete, iBeacon, iTarget, iDecoy] = [order[0] ?? 0, order[1] ?? 1, order[2] ?? 2, order[3] ?? 3];
  const ext = r.pick(EXTERNAL_NETS);
  const c2 = `${ext}.${r.int(10, 250)}`;
  const c2Port = r.pick([443, 8443, 8080, 4443]);
  const interval = r.pick([60, 120, 300, 600]);
  const beaconPath = r.pick(BEACONS);
  const attackerNet = ext === '203.0.113' ? '198.51.100' : '203.0.113';
  const attacker = `${attackerNet}.${r.int(10, 250)}`;
  const mirror = `192.0.2.${r.int(10, 250)}`;

  const hostname = (i: number) => `${names[i]}.banc.lan`;
  const ipOf = (i: number) => `${subnet}.${octets[i]}`;

  const hosts: HostSpec[] = names.map((name, i) => {
    const role = roles[i] as (typeof ROLES)[number];
    const services: HostSpec['services'] = [
      { port: 22, proto: 'tcp', name: 'ssh', product: 'OpenSSH', version: '9.6p1', state: 'open' },
      { port: role.port, proto: 'tcp', name: role.name, product: role.product, version: role.version, state: 'open' },
    ];
    if (i === iObsolete || r.next() < 0.35) {
      const version = i === iObsolete ? r.pick(advisory.old) : advisory.fixed;
      services.push({
        port: advisory.port,
        proto: 'tcp',
        name: advisory.name,
        product: advisory.product,
        version,
        state: 'open',
      });
    }
    const processes: HostSpec['processes'] = [
      { pid: 1, user: 'root', cmd: '/sbin/init' },
      { pid: r.int(300, 600), user: 'root', cmd: '/usr/sbin/sshd -D' },
      { pid: r.int(600, 900), user: 'root', cmd: '/usr/sbin/cron -f' },
      { pid: r.int(900, 1400), user: role.role === 'base' ? 'postgres' : 'root', cmd: role.daemon },
    ];
    const connections: HostSpec['connections'] = [
      { proto: 'tcp', local: '0.0.0.0:22', remote: '0.0.0.0:*', state: 'LISTEN', pid: processes[1]?.pid },
      { proto: 'tcp', local: `0.0.0.0:${role.port}`, remote: '0.0.0.0:*', state: 'LISTEN', pid: processes[3]?.pid },
    ];
    if (i === iBeacon) {
      const pid = r.int(2000, 4000);
      processes.push({ pid, user: 'www-data', cmd: `${beaconPath} -i ${interval}` });
      connections.push({
        proto: 'tcp',
        local: `${ipOf(i)}:${r.int(40000, 60000)}`,
        remote: `${c2}:${c2Port}`,
        state: 'ESTABLISHED',
        pid,
      });
    }
    if (level >= 2 && i === iDecoy) {
      const pid = r.int(2000, 4000);
      processes.push({ pid, user: 'root', cmd: '/usr/bin/miroir-maj --source depot.banc.example' });
      connections.push({
        proto: 'tcp',
        local: `${ipOf(i)}:${r.int(40000, 60000)}`,
        remote: `${mirror}:443`,
        state: 'ESTABLISHED',
        pid,
      });
    }
    const accounts: HostSpec['accounts'] = [{ user: 'audit', password: auditPw }];
    const files: Record<string, string> = {
      '/etc/motd': `${hostname(i)} — serveur ${role.role} du Banc. Exercice généré.\n`,
    };
    if (i === iTarget) {
      accounts.push({ user: 'admin-banc', password: adminPw });
      files['/var/log/auth.log'] = authLog(hostname(i).split('.')[0] as string, attacker, level, r);
    } else {
      files['/var/log/auth.log'] =
        `${MONTH_DAY} 07:${pad(r.int(0, 59))}:${pad(r.int(0, 59))} ${name} sshd[${r.int(400, 900)}]: Server listening on 0.0.0.0 port 22.\n`;
    }
    return {
      id: name,
      hostname: hostname(i),
      ip: ipOf(i),
      os: r.pick(['Debian GNU/Linux 12', 'Ubuntu 24.04 LTS', 'Rocky Linux 9']),
      networks: ['banc'],
      icmp: true,
      services,
      accounts,
      files,
      processes,
      connections,
      documents: {},
      firewall: [],
    };
  });

  const inventory =
    level === 1
      ? ['', 'Inventaire :', ...names.map((_, i) => `  ${hostname(i).padEnd(22)} ${ipOf(i)}`)].join('\n')
      : `\nInventaire : non fourni. Le réseau de l'exercice est ${cidr}.`;
  const allowed =
    level >= 2
      ? `\nFlux sortants autorisés : ${mirror}:443 (miroir de mises à jour du Banc). Tout autre flux sortant est anormal.`
      : '';

  const workstation: HostSpec = {
    id: 'echo-ws',
    hostname: 'echo-ws',
    ip: '10.7.0.7',
    os: 'EchoOS 4.2 (Linux 6.8)',
    networks: ['echo-lan', 'banc'],
    icmp: true,
    services: [],
    accounts: [{ user: 'operateur-7', password: null }],
    files: {
      '/home/operateur-7/consignes.txt': [
        `LE BANC — exercice généré · graine ${seed} · niveau ${SANDBOX_LEVELS[level].label}`,
        `Réseau de l'exercice : ${cidr} (tout y est autorisé).`,
        `Compte de lecture sur toutes les machines : audit / ${auditPw}`,
        `${hostname(iTarget)} signale des échecs de connexion SSH en rafale.`,
        `Compte d'administration (pare-feu) sur ${hostname(iTarget)} : admin-banc / ${adminPw}`,
        inventory,
        allowed,
        '',
        `Avis interne : ${advisory.product}, toute version antérieure à ${advisory.fixed} doit être corrigée.`,
        '',
        'Mission : trouve la machine à corriger, la machine qui chante et sa destination,',
        "la source qui s'acharne sur les connexions SSH — puis bloque-la au plus juste.",
      ].join('\n'),
    },
    processes: [],
    connections: [],
    documents: {},
    firewall: [],
  };

  const target = names[iTarget] as string;
  const mission = validateMission(
    {
      id: SANDBOX_MISSION_ID,
      title: `Exercice généré · ${seed}`,
      act: 'banc',
      order: 99,
      from: 'Dr Noor Haddad',
      summary: `${SANDBOX_LEVELS[level].label} · ${SANDBOX_LEVELS[level].summary}`,
      question: "Comment passer d'un réseau inconnu à une mesure de défense ciblée ?",
      concepts: [
        'reconnaissance.scan-de-ports',
        'reconnaissance.empreinte-service',
        'reseau.beacon',
        'forensique.force-brute',
        'defense.filtrage',
      ],
      briefing: [
        `Exercice généré par le Banc — graine **${seed}**, niveau **${SANDBOX_LEVELS[level].label}**.`,
        '',
        "Un petit réseau t'attend. Tout est dans `~/consignes.txt`. Pas d'histoire ici : seulement la méthode.",
        'Cartographier, trouver ce qui cloche, comprendre, contenir au plus juste.',
        '',
        '— Noor',
      ].join('\n'),
      debrief: [
        "**On passe d'un réseau inconnu à une mesure ciblée en enchaînant des preuves** : une carte (scan),",
        'des versions comparées à un avis, des processus et des connexions qui ne collent pas aux flux',
        'autorisés, un journal qui désigne une source. La mesure finale — une seule règle — découle de tout ça.',
        '',
        'Rejoue avec une autre graine : le réseau change, la méthode reste.',
      ].join('\n'),
      scenario: {
        clock: '2031-03-22T10:00:00Z',
        start: { host: 'echo-ws', user: 'operateur-7' },
        known: level === 1 ? ['echo-ws', ...names] : ['echo-ws'],
        networks: [
          { id: 'echo-lan', cidr: '10.7.0.0/24', label: 'réseau interne ECHO' },
          { id: 'banc', cidr, label: 'le Banc (exercice généré)' },
        ],
        hosts: [workstation, ...hosts],
        domains: [],
      },
      objectives: [
        {
          id: 'consignes',
          label: 'Lire les consignes',
          on: 'file.read',
          where: { path: '/home/operateur-7/consignes.txt' },
          hint: '`cat consignes.txt`',
        },
        {
          id: 'report-obsolete',
          label: 'Rapport : la machine à corriger',
          requires: ['consignes'],
          on: 'finding.confirmed',
          where: { questionId: 'obsolete' },
          hint: "Un scan de versions sur tout le réseau, puis compare à l'avis interne.",
          concepts: ['reconnaissance.empreinte-service', 'defense.gestion-correctifs'],
        },
        {
          id: 'report-chant',
          label: 'Rapport : la machine qui chante',
          requires: ['consignes'],
          on: 'finding.confirmed',
          where: { questionId: 'chant' },
          hint: 'Avec le compte audit, regarde les processus et les connexions établies de chaque machine.',
          concepts: ['reseau.beacon'],
        },
        {
          id: 'report-destination',
          label: 'Rapport : sa destination',
          requires: ['report-chant'],
          on: 'finding.confirmed',
          where: { questionId: 'destination' },
        },
        {
          id: 'report-source',
          label: "Rapport : la source qui s'acharne",
          requires: ['consignes'],
          on: 'finding.confirmed',
          where: { questionId: 'source' },
          hint: 'La machine signalée dans les consignes garde un journal des connexions SSH.',
          concepts: ['forensique.force-brute'],
        },
        {
          id: 'bloquer',
          label: 'Bloquer cette source au plus juste',
          requires: ['report-source'],
          on: 'firewall.changed',
          where: { hostId: target, action: 'block', target: attacker },
          hint: "Sur la machine visée, avec le compte d'administration : une seule adresse.",
          concepts: ['defense.filtrage'],
        },
      ],
      questions: [
        {
          id: 'obsolete',
          prompt: `Quelle machine fait tourner une version de ${advisory.product} à corriger ?`,
          accept: [names[iObsolete] as string, hostname(iObsolete), ipOf(iObsolete)],
          hint: "Compare chaque version relevée au seuil de l'avis.",
          explain: `Version antérieure à ${advisory.fixed} : à corriger en priorité.`,
        },
        {
          id: 'chant',
          prompt: "Quelle machine entretient une connexion sortante qui n'est pas autorisée ?",
          accept: [names[iBeacon] as string, hostname(iBeacon), ipOf(iBeacon)],
          hint: 'Un flux autorisé est listé dans les consignes ; le chant, non.',
          explain: `Un programme caché (${beaconPath}) relancé toutes les ${interval} s.`,
        },
        {
          id: 'destination',
          prompt: 'Vers quelle adresse extérieure ?',
          requires: ['chant'],
          accept: [c2, `${c2}:${c2Port}`],
          explain: 'Un indicateur à partager — et à bloquer en sortie, dans la vraie vie.',
        },
        {
          id: 'source',
          prompt: "Quelle adresse multiplie les échecs d'authentification SSH ?",
          accept: [attacker],
          hint: '`grep Failed` sur le bon journal.',
          explain: 'Des échecs en rafale, sur plusieurs comptes : une tentative de force brute.',
        },
      ],
      messages: [],
      choices: [],
    },
    `sandbox:${seed}`,
  );

  const solution = [
    'cat consignes.txt',
    `nmap -sV ${cidr}`,
    `report obsolete ${names[iObsolete]}`,
    `ssh audit@${hostname(iBeacon)}`,
    auditPw,
    'ps aux',
    'netstat -tunap',
    `report chant ${names[iBeacon]}`,
    `report destination ${c2}`,
    'exit',
    `ssh admin-banc@${hostname(iTarget)}`,
    adminPw,
    'grep Failed /var/log/auth.log',
    `report source ${attacker}`,
    `fw block ${attacker}`,
  ];

  return { seed, level, mission, solution };
}

function authLog(host: string, attacker: string, level: SandboxLevel, r: ReturnType<typeof rngFrom>): string {
  const lines: [string, string][] = [];
  const at = (h: number, m: number, s: number) => `${MONTH_DAY} ${pad(h)}:${pad(m)}:${pad(s)}`;
  lines.push([at(7, 2, 11), `sshd[${r.int(400, 900)}]: Server listening on 0.0.0.0 port 22.`]);
  lines.push([
    at(8, 15, r.int(0, 59)),
    `sshd[${r.int(1000, 1200)}]: Accepted password for audit from 10.7.0.7 port ${r.int(40000, 60000)} ssh2`,
  ]);
  if (level === 3)
    lines.push([
      at(8, 14, r.int(0, 59)),
      `sshd[${r.int(1000, 1200)}]: Failed password for audit from 10.7.0.7 port ${r.int(40000, 60000)} ssh2`,
    ]);
  const tries = 4 + level * 2;
  const users = ['root', 'admin', 'backup', 'test'];
  const start = r.int(2, 4);
  for (let k = 0; k < tries; k++) {
    lines.push([
      at(start, 10 + k, r.int(0, 59)),
      `sshd[${2000 + k}]: Failed password for ${users[k % users.length]} from ${attacker} port ${r.int(40000, 60000)} ssh2`,
    ]);
  }
  return `${lines
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([t, msg]) => `${t} ${host} ${msg}`)
    .join('\n')}\n`;
}
