import type { Engine } from '../engine.ts';
import { blank, concept, heading, line, muted, plain, subtle, success, table, warning } from '../output.ts';
import type { Command } from '../shell/command.ts';
import type { DnsRecord, Domain, Line } from '../types.ts';

/**
 * ECHO's simplified intel tools. Unlike nmap/ssh they do not imitate a real
 * tool's output: they summarise in French and explain what the data means.
 */

const zones = (engine: Engine): Domain[] => Object.values(engine.state.world.domains ?? {});

function zoneFor(engine: Engine, name: string): Domain | undefined {
  return zones(engine)
    .filter((d) => name === d.name || name.endsWith(`.${d.name}`))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

const relName = (d: Domain, name: string): string => (name === d.name ? '@' : name.slice(0, -(d.name.length + 1)));
const fullName = (d: Domain, rel: string): string => (rel === '@' ? d.name : `${rel}.${d.name}`);

type RecordType = DnsRecord['type'];
const TYPES: RecordType[] = ['A', 'CNAME', 'MX', 'NS', 'TXT', 'AAAA'];

const TYPE_HELP: Record<RecordType, string> = {
  A: 'adresse IPv4',
  AAAA: 'adresse IPv6',
  CNAME: 'alias vers un autre nom',
  MX: 'serveur de messagerie',
  NS: 'serveur de noms qui fait autorité',
  TXT: 'texte libre (souvent SPF, vérifications)',
};

/** Records for `name`/`type`, following one alias. Null when the name does not exist. */
export function lookup(engine: Engine, rawName: string, type: RecordType): DnsRecord[] | null {
  const name = rawName.toLowerCase().replace(/\.$/, '');
  const zone = zoneFor(engine, name);
  if (!zone) {
    const host = Object.values(engine.state.world.hosts).find((h) => h.hostname === name);
    return host && type === 'A' ? [{ name, type: 'A', value: host.ip, ttl: 300 }] : null;
  }
  const rel = relName(zone, name);
  const own = zone.records.filter((r) => r.name === rel);
  if (type === 'NS' && rel === '@' && !own.some((r) => r.type === 'NS')) {
    return zone.nameservers.map((value) => ({ name: rel, type: 'NS' as const, value, ttl: 86400 }));
  }
  const direct = own.filter((r) => r.type === type);
  if (direct.length) return direct;
  const alias = own.find((r) => r.type === 'CNAME');
  if (alias && type !== 'CNAME') return [alias, ...(lookup(engine, alias.value, type) ?? [])];
  return own.length || rel === '@' ? [] : null;
}

function discoverIp(engine: Engine, ip: string): void {
  const host = Object.values(engine.state.world.hosts).find((h) => h.ip === ip);
  if (host) engine.discover(host);
}

export const whois: Command = {
  name: 'whois',
  category: 'reseau',
  summary: "fiche d'enregistrement d'un nom de domaine",
  usage: 'whois <domaine>',
  description:
    'Interroge le registre public : qui a enregistré le domaine, quand, chez quel registrar, et quels serveurs de noms le gèrent.\nRecherche passive : aucune connexion à la cible.',
  examples: ['whois ch-vallon.example'],
  concepts: ['reconnaissance.whois'],
  run({ argv, engine }) {
    const name = argv[0]?.toLowerCase();
    if (!name) return [line(subtle(`usage : ${whois.usage}`))];
    const d = zones(engine).find((z) => z.name === name);
    engine.emit('whois.queried', { domain: name, found: Boolean(d) });
    if (!d)
      return [
        line(
          muted(
            `Aucun enregistrement pour « ${name} ». Vérifie l'orthographe — whois attend un domaine, pas un sous-domaine.`,
          ),
        ),
      ];
    return [
      line(heading(d.name.toUpperCase())),
      ...table([
        [subtle('Registrar'), plain(d.registrar)],
        [subtle('Titulaire'), plain(d.registrant)],
        [subtle('Créé le'), plain(d.created)],
        [subtle('Expire le'), plain(d.expires)],
        [subtle('Serveurs de noms'), plain(d.nameservers.join(', ') || '—')],
        [subtle('Contact abus'), plain(d.abuse ?? '—')],
      ]),
      blank(),
      line(
        muted('› Les serveurs de noms et le registrar sont des indices qu’on peut recouper d’un domaine à l’autre. '),
        concept('Whois', 'reconnaissance.whois'),
      ),
    ];
  },
};

export const dns: Command = {
  name: 'dns',
  category: 'reseau',
  summary: 'résout un nom de domaine (outil ECHO)',
  usage: 'dns <nom> [type] · dns audit <domaine>',
  description: [
    'Traduit un nom en adresse ou en information, et explique la réponse.',
    `Types : ${TYPES.join(', ')} (A par défaut).`,
    '`dns audit <domaine>` vérifie si les serveurs de noms divulguent toute la zone à n’importe qui —',
    'une erreur de configuration classique qui offre la carte complète des machines.',
    'Équivalents réels : dig, nslookup, host.',
  ].join('\n'),
  examples: ['dns ch-vallon.example', 'dns ch-vallon.example MX', 'dns audit ch-vallon.example'],
  concepts: ['reseau.dns'],
  run({ argv, engine }) {
    if (argv[0] === 'audit') return audit(engine, argv[1]?.toLowerCase());
    const name = argv[0]?.toLowerCase().replace(/\.$/, '');
    if (!name) return [line(subtle(`usage : ${dns.usage}`))];
    const type = (argv[1]?.toUpperCase() ?? 'A') as RecordType;
    if (!TYPES.includes(type)) return [line(muted(`Type inconnu « ${argv[1]} ». Types : ${TYPES.join(', ')}.`))];

    const records = lookup(engine, name, type);
    engine.emit('dns.queried', { name, type, found: Boolean(records?.length) });
    if (records === null) return [line(warning(`${name} : ce nom n'existe pas`), muted(' (NXDOMAIN)'))];
    if (records.length === 0) return [line(muted(`${name} existe, mais n'a pas d'enregistrement ${type}.`))];

    const out: Line[] = [];
    for (const r of records) {
      if (r.type === 'A') discoverIp(engine, r.value);
      out.push(line(plain(`${name}  →  `), success(r.value), subtle(`   ${r.type} · ${TYPE_HELP[r.type]}`)));
    }
    return out;
  },
};

function audit(engine: Engine, name: string | undefined): Line[] {
  if (!name) return [line(subtle('usage : dns audit <domaine>'))];
  const d = zones(engine).find((z) => z.name === name);
  if (!d) return [line(muted(`Pas de zone « ${name} » connue.`))];
  engine.emit('dns.axfr', { domain: name, success: d.axfr });
  if (!d.axfr) {
    return [
      line(success('✓ '), plain(`Les serveurs de noms de ${name} refusent de divulguer la zone complète.`)),
      line(muted('  Il faudra découvrir les machines autrement (recherches passives, documents, scan autorisé).')),
    ];
  }
  const names = [...new Set(d.records.map((r) => fullName(d, r.name)))].sort();
  for (const r of d.records) if (r.type === 'A') discoverIp(engine, r.value);
  return [
    line(
      warning('⚠ Mauvaise configuration : '),
      plain(`${d.nameservers[0] ?? 'le serveur de noms'} accepte de lister toute la zone.`),
    ),
    line(muted('  N’importe qui obtient ainsi l’inventaire des noms publiés, y compris ceux qu’on croyait discrets :')),
    ...names.map((n) => line(plain(`    ${n}`))),
    blank(),
    line(
      muted('› Correctif : limiter les transferts de zone aux seuls serveurs secondaires. '),
      concept('Transfert de zone', 'reconnaissance.transfert-zone'),
    ),
  ];
}

export const intelCommands = [whois, dns];
