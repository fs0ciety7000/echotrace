import { z } from 'zod';

/**
 * Content schemas. Authors write YAML/Markdown; everything is validated here
 * at load time and in CI (`pnpm content:check`). See docs/CONTENT_GUIDE.md.
 */

// --- Safety rails: fictional, non-routable addressing only ------------------

const SAFE_IPV4_RANGES: [string, number][] = [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['127.0.0.0', 8],
  ['192.0.2.0', 24], // TEST-NET-1 (RFC 5737)
  ['198.51.100.0', 24], // TEST-NET-2
  ['203.0.113.0', 24], // TEST-NET-3
];

export function ipToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function isSafeIp(ip: string): boolean {
  const n = ipToInt(ip);
  if (n === null) return false;
  return SAFE_IPV4_RANGES.some(([base, bits]) => {
    const b = ipToInt(base) as number;
    const size = 2 ** (32 - bits);
    return n >= b && n < b + size;
  });
}

const SAFE_TLDS = ['example', 'test', 'invalid', 'internal', 'lan', 'local'];

export function isSafeHostname(name: string): boolean {
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(name)) return false;
  if (!name.includes('.')) return true; // bare LAN hostname
  const tld = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  return SAFE_TLDS.includes(tld);
}

const SafeIp = z.string().refine(isSafeIp, {
  message: 'IP hors des plages autorisées (privées ou documentation RFC 5737)',
});
const SafeHostname = z.string().refine(isSafeHostname, {
  message: `nom d'hôte invalide ou TLD non réservé (${SAFE_TLDS.join(', ')})`,
});

// --- Concepts (learning journal) --------------------------------------------

export const CONCEPT_CATEGORIES = ['reseau', 'systeme', 'reconnaissance', 'forensique', 'defense', 'ethique'] as const;

export const ConceptMetaSchema = z.object({
  id: z.string().regex(/^[a-z]+(\.[a-z0-9-]+)+$/, 'id attendu : categorie.nom-du-concept'),
  title: z.string().min(1),
  category: z.enum(CONCEPT_CATEGORIES),
  summary: z.string().min(10).max(240),
  related: z.array(z.string()).default([]),
});

export type ConceptMeta = z.infer<typeof ConceptMetaSchema>;
export interface Concept extends ConceptMeta {
  /** Markdown body. */
  body: string;
}

// --- Scenario (initial world of a mission) -----------------------------------

export const ServiceSchema = z.object({
  port: z.number().int().min(1).max(65535),
  proto: z.enum(['tcp', 'udp']).default('tcp'),
  name: z.string(),
  product: z.string().optional(),
  version: z.string().optional(),
  banner: z.string().optional(),
  state: z.enum(['open', 'filtered']).default('open'),
});

export const AccountSchema = z.object({
  user: z.string().regex(/^[a-z_][a-z0-9_-]*$/),
  password: z.string().nullable().default(null),
  home: z.string().optional(),
});

export const HostSpecSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  hostname: SafeHostname,
  ip: SafeIp,
  os: z.string().default('Linux'),
  networks: z.array(z.string()).min(1),
  icmp: z.boolean().default(true),
  services: z.array(ServiceSchema).default([]),
  accounts: z.array(AccountSchema).default([]),
  /** Flat map `absolute/path → content`; a trailing `/` creates an empty dir. */
  files: z.record(z.string().startsWith('/'), z.string()).default({}),
});

export const NetworkSpecSchema = z.object({
  id: z.string(),
  cidr: z.string(),
  label: z.string().optional(),
});

export const ScenarioSchema = z.object({
  start: z.object({
    host: z.string(),
    user: z.string(),
    cwd: z.string().optional(),
  }),
  /** ISO date-time of the simulated clock at mission start. */
  clock: z.string().default('2031-03-14T21:00:00Z'),
  networks: z.array(NetworkSpecSchema).min(1),
  hosts: z.array(HostSpecSchema).min(1),
  /** Hosts already on the player's radar at start. */
  known: z.array(z.string()).default([]),
});

export type ScenarioSpec = z.infer<typeof ScenarioSchema>;
export type HostSpec = z.infer<typeof HostSpecSchema>;

// --- Missions ----------------------------------------------------------------

export const TriggerSchema = z.object({
  on: z.enum([
    'command.run',
    'dir.listed',
    'file.read',
    'host.discovered',
    'host.pinged',
    'host.scanned',
    'session.opened',
    'auth.failed',
    'concept.studied',
  ]),
  /** Shallow match on the event payload; array payload fields match by inclusion. */
  where: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

export const ObjectiveSchema = TriggerSchema.extend({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  optional: z.boolean().default(false),
  /** Objective stays locked (hidden) until these are completed. */
  requires: z.array(z.string()).default([]),
  hint: z.string().optional(),
  concepts: z.array(z.string()).default([]),
});

/** In-world messages (Noor, Mara…) delivered when their trigger fires. */
export const MessageSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  from: z.string(),
  subject: z.string().optional(),
  /** Short Markdown body. */
  body: z.string(),
  on: z.enum(['mission.started', 'objective.completed', 'mission.completed', ...TriggerSchema.shape.on.options]),
  where: TriggerSchema.shape.where,
});

export const MissionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  act: z.enum(['prologue', 'acte-1', 'acte-2', 'acte-3', 'banc', 'contrat']),
  order: z.number().int().default(0),
  summary: z.string(),
  /** The question the mission makes the player answer — the debrief answers it. */
  question: z.string(),
  briefing: z.string(),
  debrief: z.string(),
  from: z.string().default('Mara Okonkwo-Lind'),
  concepts: z.array(z.string()).default([]),
  scenario: ScenarioSchema,
  objectives: z.array(ObjectiveSchema).min(1),
  messages: z.array(MessageSchema).default([]),
});

export type MissionSpec = z.infer<typeof MissionSchema>;
export type ObjectiveSpec = z.infer<typeof ObjectiveSchema>;
export type MessageSpec = z.infer<typeof MessageSchema>;
