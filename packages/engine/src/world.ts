import type { ScenarioSpec } from './content/schema.ts';
import { ipToInt } from './content/schema.ts';
import type { EngineState, Host, HostKnowledge, World } from './types.ts';
import { buildFs, ensureDir } from './vfs.ts';

export function homeOf(user: string): string {
  return user === 'root' ? '/root' : `/home/${user}`;
}

/** Turns a validated scenario into a fresh, serialisable engine state. */
export function buildState(spec: ScenarioSpec): EngineState {
  const world: World = { hosts: {}, networks: {} };
  for (const n of spec.networks) world.networks[n.id] = { ...n };
  for (const h of spec.hosts) {
    const fs = buildFs(h.files);
    const accounts = h.accounts.map((a) => ({
      user: a.user,
      password: a.password,
      home: a.home ?? homeOf(a.user),
    }));
    for (const a of accounts) ensureDir(fs, a.home);
    world.hosts[h.id] = {
      id: h.id,
      hostname: h.hostname,
      ip: h.ip,
      os: h.os,
      networks: [...h.networks],
      icmp: h.icmp,
      services: h.services.map((s) => ({ ...s })),
      accounts,
      fs,
    };
  }

  const startHost = world.hosts[spec.start.host] as Host;
  const account = startHost.accounts.find((a) => a.user === spec.start.user);
  const cwd = spec.start.cwd ?? account?.home ?? homeOf(spec.start.user);

  const knowledge: Record<string, HostKnowledge> = {};
  for (const id of [spec.start.host, ...spec.known]) {
    knowledge[id] = { discovered: true, ports: [], fingerprinted: false, accessed: id === spec.start.host };
  }

  return {
    world,
    session: { hostId: spec.start.host, user: spec.start.user, cwd, stack: [], history: [] },
    knowledge,
    clock: Date.parse(spec.clock),
    exposure: 0,
  };
}

/** Finds a host by id, hostname, short hostname or IP. */
export function findHost(world: World, query: string): Host | undefined {
  const q = query.toLowerCase();
  return Object.values(world.hosts).find(
    (h) => h.id === q || h.ip === q || h.hostname.toLowerCase() === q || h.hostname.split('.')[0] === q,
  );
}

export function canReach(from: Host, to: Host): boolean {
  if (from.id === to.id) return true;
  return from.networks.some((n) => to.networks.includes(n));
}

export function cidrContains(cidr: string, ip: string): boolean {
  const [base, bitsRaw] = cidr.split('/');
  const b = ipToInt(base ?? '');
  const n = ipToInt(ip);
  const bits = Number(bitsRaw ?? 32);
  if (b === null || n === null || Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  const size = 2 ** (32 - bits);
  const start = Math.floor(b / size) * size;
  return n >= start && n < start + size;
}

export function netmaskOf(cidr: string): string {
  const bits = Number(cidr.split('/')[1] ?? 32);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return [24, 16, 8, 0].map((s) => (mask >>> s) & 255).join('.');
}
