import type { Engine } from '../engine.ts';
import {
  accent,
  blank,
  concept,
  danger,
  host as hostSpan,
  line,
  muted,
  plain,
  subtle,
  success,
  table,
  warning,
} from '../output.ts';
import type { Command } from '../shell/command.ts';
import { parseArgs } from '../shell/tokenize.ts';
import type { Host, Line, Service } from '../types.ts';
import { canReach, cidrContains, findHost, netmaskOf } from '../world.ts';

/** Deterministic pseudo-latency (ms) so outputs are stable across runs and tests. */
function latency(ip: string, seq = 0): number {
  let h = 2166136261;
  for (const ch of `${ip}#${seq}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return 0.3 + ((h >>> 0) % 900) / 100;
}

function formatClock(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
}

export const ifconfig: Command = {
  name: 'ifconfig',
  aliases: ['ip'],
  category: 'reseau',
  summary: 'affiche les interfaces réseau et ton adresse IP',
  usage: 'ifconfig',
  description:
    "Liste les interfaces réseau de la machine courante.\n`lo` est l'interface de bouclage (la machine se parle à elle-même).\n`eth0`, `eth1`… sont les interfaces physiques : `inet` est ton adresse IPv4, `netmask` délimite ton réseau local.",
  concepts: ['reseau.adresse-ip'],
  run({ engine }) {
    const h = engine.host();
    const out: Line[] = [
      line(accent('lo'), plain(': flags=73<UP,LOOPBACK,RUNNING>  mtu 65536')),
      line(plain('        inet '), plain('127.0.0.1'), plain('  netmask 255.0.0.0')),
      blank(),
    ];
    h.networks.forEach((netId, i) => {
      const net = engine.state.world.networks[netId];
      if (!net) return;
      // Multi-homed hosts: first interface carries the host IP, others derive one in their CIDR.
      const ip = i === 0 || cidrContains(net.cidr, h.ip) ? h.ip : deriveIp(net.cidr, h.ip);
      out.push(
        line(
          accent(`eth${i}`),
          plain(': flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500'),
          net.label ? subtle(`   # ${net.label}`) : plain(''),
        ),
        line(plain('        inet '), success(ip), plain(`  netmask ${netmaskOf(net.cidr)}`), subtle(`  (${net.cidr})`)),
        blank(),
      );
    });
    return out;
  },
};

/** Keeps the host part of `ip` inside `cidr` (for secondary interfaces). */
function deriveIp(cidr: string, ip: string): string {
  const base = (cidr.split('/')[0] ?? '').split('.');
  const parts = ip.split('.');
  const bits = Number(cidr.split('/')[1] ?? 24);
  const keep = Math.ceil(bits / 8);
  return [...base.slice(0, keep), ...parts.slice(keep)].join('.');
}

export const ping: Command = {
  name: 'ping',
  category: 'reseau',
  summary: 'teste si une machine répond (ICMP)',
  usage: 'ping [-c n] <hôte>',
  description:
    "Envoie des paquets ICMP « echo request » et attend les « echo reply ».\nUne absence de réponse ne prouve PAS que la machine est éteinte : un pare-feu peut bloquer l'ICMP.",
  examples: ['ping banc-01', 'ping -c 2 10.7.1.10'],
  concepts: ['reseau.ping-icmp', 'reseau.adresse-ip'],
  complete: 'host',
  run({ argv, engine }) {
    const { _, flags } = parseArgs(argv, ['c']);
    const target = _[0];
    if (!target) return [line(subtle('usage : ping [-c n] <hôte>'))];
    const count = Math.max(1, Math.min(10, Number(flags.c) || 4));
    const h = findHost(engine.state.world, target);
    if (!h) return [line(danger(`ping: ${target}: Name or service not known`))];

    const reachable = canReach(engine.host(), h) && h.icmp;
    engine.advance(count * 1000);
    engine.emit('host.pinged', { hostId: h.id, ip: h.ip, reachable });
    const out: Line[] = [line(plain(`PING ${h.hostname} (${h.ip}) 56(84) bytes of data.`))];

    if (!canReach(engine.host(), h)) {
      out.push(line(danger(`From ${engine.host().ip} icmp_seq=1 Destination Host Unreachable`)));
    } else if (reachable) {
      engine.discover(h);
      for (let i = 1; i <= count; i++) {
        out.push(
          line(
            plain(`64 bytes from ${h.hostname} (${h.ip}): icmp_seq=${i} ttl=64 time=`),
            success(`${latency(h.ip, i).toFixed(2)} ms`),
          ),
        );
      }
    }
    const received = reachable ? count : 0;
    out.push(
      blank(),
      line(subtle(`--- ${h.hostname} ping statistics ---`)),
      line(
        plain(`${count} packets transmitted, ${received} received, `),
        received ? success('0% packet loss') : danger('100% packet loss'),
      ),
    );
    if (!received && canReach(engine.host(), h)) {
      out.push(
        line(
          muted('› Aucune réponse ICMP. Éteinte… ou simplement filtrée par un pare-feu ? '),
          concept('Ping & ICMP', 'reseau.ping-icmp'),
        ),
      );
    }
    return out;
  },
};

function parsePorts(spec: string | true | undefined): number[] | null {
  if (typeof spec !== 'string') return null;
  const ports: number[] = [];
  for (const part of spec.split(',')) {
    const [a, b] = part.split('-').map(Number);
    if (a === undefined || Number.isNaN(a)) continue;
    if (b === undefined) ports.push(a);
    else for (let p = a; p <= Math.min(b, 65535); p++) ports.push(p);
  }
  return ports;
}

function scanHost(engine: Engine, h: Host, opts: { versions: boolean; ports: number[] | null }): Line[] {
  const services = h.services.filter((s) => !opts.ports || opts.ports.includes(s.port)).sort((a, b) => a.port - b.port);
  const open = services.filter((s) => s.state === 'open').map((s) => s.port);
  const k = engine.knowledgeOf(h.id);
  k.ports = [...new Set([...k.ports, ...open])].sort((a, b) => a - b);
  if (opts.versions) k.fingerprinted = true;
  engine.discover(h);
  engine.emit('host.scanned', { hostId: h.id, ip: h.ip, ports: open, versions: opts.versions });

  const out: Line[] = [
    line(plain('Nmap scan report for '), hostSpan(h.hostname, h.id), plain(` (${h.ip})`)),
    line(plain(`Host is up (${(latency(h.ip) / 1000).toFixed(4)}s latency).`)),
  ];
  const scanned = opts.ports?.length ?? 1000;
  const closed = Math.max(0, scanned - services.length);
  if (services.length === 0) {
    out.push(line(plain(`All ${scanned} scanned ports on ${h.hostname} are in ignored states.`)));
    return out;
  }
  if (closed > 0) out.push(line(subtle(`Not shown: ${closed} closed tcp ports (reset)`)));
  const rows = [[subtle('PORT'), subtle('STATE'), subtle('SERVICE'), ...(opts.versions ? [subtle('VERSION')] : [])]];
  for (const s of services) rows.push(serviceRow(s, opts.versions));
  out.push(...table(rows));
  return out;
}

function serviceRow(s: Service, versions: boolean) {
  const version = [s.product, s.version].filter(Boolean).join(' ');
  return [
    plain(`${s.port}/${s.proto}`),
    s.state === 'open' ? success('open') : warning('filtered'),
    accent(s.name),
    ...(versions ? [plain(version || '—')] : []),
  ];
}

export const nmap: Command = {
  name: 'nmap',
  category: 'reseau',
  summary: 'découvre les machines et les services exposés',
  usage: 'nmap [-sn] [-sV] [-Pn] [-p ports] <cible|réseau/cidr>',
  description: [
    'Scanner réseau (simulation pédagogique de Nmap).',
    '  -sn   découverte d’hôtes uniquement (« ping sweep »), sans scanner les ports',
    '  -sV   interroge les services ouverts pour identifier logiciel et version',
    '  -Pn   saute la découverte : considère l’hôte comme actif même s’il ne répond pas au ping',
    '  -p    restreint les ports : -p 22,80 ou -p 1-1024',
    'La cible peut être un hôte (banc-01, 10.7.1.10) ou un réseau en notation CIDR (10.7.1.0/24).',
    'Attention : un scan est bruyant. Il augmente ton exposition et n’est légitime que sur un périmètre autorisé.',
  ].join('\n'),
  examples: ['nmap banc-01', 'nmap -sV 10.7.1.10', 'nmap -sn 10.7.1.0/24', 'nmap -Pn 10.7.0.66'],
  concepts: ['reconnaissance.scan-de-ports', 'reseau.port', 'ethique.autorisation'],
  complete: 'host',
  run({ argv, engine }) {
    const { _, flags } = parseArgs(argv, ['p'], ['sn', 'sV', 'Pn', 'sS', 'sT']);
    const target = _[0];
    if (!target) return [line(subtle(`usage : ${nmap.usage}`))];
    const versions = flags.sV === true;
    const pingOnly = flags.sn === true;
    const skipDiscovery = flags.Pn === true;
    const ports = parsePorts(flags.p);
    if (versions) engine.encounter('reconnaissance.empreinte-service', 'nmap');

    const out: Line[] = [
      line(plain(`Starting Nmap 7.95 ( simulation ECHO ) at ${formatClock(engine.state.clock)} UTC`)),
    ];
    const me = engine.host();
    let targets: Host[];
    let isRange = false;
    if (target.includes('/')) {
      isRange = true;
      targets = Object.values(engine.state.world.hosts).filter((h) => cidrContains(target, h.ip));
    } else {
      const h = findHost(engine.state.world, target);
      if (!h) {
        out.push(
          line(danger(`Failed to resolve "${target}".`)),
          line(plain('Nmap done: 0 IP addresses (0 hosts up) scanned')),
        );
        return out;
      }
      targets = [h];
    }
    targets.sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }));

    let up = 0;
    let silent = 0;
    for (const h of targets) {
      if (!canReach(me, h)) continue;
      if (!h.icmp && !skipDiscovery) {
        silent += 1;
        continue;
      }
      up += 1;
      if (pingOnly) {
        engine.discover(h);
        out.push(
          line(plain('Nmap scan report for '), hostSpan(h.hostname, h.id), plain(` (${h.ip})`)),
          line(plain('Host is up.')),
        );
      } else {
        out.push(...scanHost(engine, h, { versions, ports }));
        if (versions) out.push(...bannerHints(h));
      }
      out.push(blank());
    }

    if (!isRange && up === 0) {
      out.push(line(warning('Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn')));
    }
    const total = isRange ? 2 ** (32 - Number(target.split('/')[1] ?? 32)) : 1;
    const seconds = pingOnly ? 1.2 + total * 0.01 : 2 + up * (versions ? 8 : 1.5);
    engine.advance(Math.round(seconds * 1000));
    out.push(
      line(
        plain(
          `Nmap done: ${total} IP address${total > 1 ? 'es' : ''} (${up} host${up > 1 ? 's' : ''} up) scanned in ${seconds.toFixed(2)} seconds`,
        ),
      ),
    );
    if (isRange && silent > 0 && !skipDiscovery) {
      out.push(
        line(
          muted(
            `› ${silent === 1 ? 'Une adresse' : `${silent} adresses`} du réseau ne répond pas aux sondes de découverte. Rien ne prouve qu'il n'y a personne.`,
          ),
        ),
      );
    }
    out.push(
      line(
        muted('› '),
        concept('Ports', 'reseau.port'),
        muted(' · '),
        concept('Scan de ports', 'reconnaissance.scan-de-ports'),
        ...(versions ? [muted(' · '), concept('Empreinte de service', 'reconnaissance.empreinte-service')] : []),
      ),
    );
    return out;
  },
};

function bannerHints(h: Host): Line[] {
  return h.services
    .filter((s) => s.state === 'open' && s.banner)
    .map((s) => line(subtle(`|_ ${s.port}/${s.proto} banner: `), muted(s.banner as string)));
}

export const networkCommands = [ifconfig, ping, nmap];
