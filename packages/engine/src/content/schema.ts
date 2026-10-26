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

export const QuizQuestionSchema = z
  .object({
    q: z.string().min(5),
    choices: z.array(z.string().min(1)).min(2).max(4),
    /** Index of the correct choice (choices are shuffled at display). */
    answer: z.number().int().min(0),
    /** Shown after answering, right or wrong: this is where the learning happens. */
    explain: z.string().min(10),
  })
  .refine((q) => q.answer < q.choices.length, { message: 'answer hors des choix' });

export const ConceptMetaSchema = z.object({
  id: z.string().regex(/^[a-z]+(\.[a-z0-9-]+)+$/, 'id attendu : categorie.nom-du-concept'),
  title: z.string().min(1),
  category: z.enum(CONCEPT_CATEGORIES),
  summary: z.string().min(10).max(240),
  related: z.array(z.string()).default([]),
  quiz: z.array(QuizQuestionSchema).default([]),
});

export type ConceptMeta = z.infer<typeof ConceptMetaSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
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
  /** Certificate presented by a TLS service (openssl s_client, curl -v). */
  tls: z
    .object({
      subject: z.string(),
      issuer: z.string(),
      notBefore: z.string(),
      notAfter: z.string(),
      san: z.array(z.string()).default([]),
      /** SHA-256 fingerprint, colon-separated hex. A pivot for threat intelligence. */
      sha256: z.string().regex(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/, 'empreinte SHA-256 attendue (AA:BB:…, 32 octets)'),
    })
    .optional(),
  /** Response of an HTTP(S) service (curl). */
  http: z
    .object({
      status: z.number().int().default(200),
      headers: z.record(z.string(), z.string()).default({}),
      body: z.string().default(''),
    })
    .optional(),
});

export const AccountSchema = z.object({
  user: z.string().regex(/^[a-z_][a-z0-9_-]*$/),
  password: z.string().nullable().default(null),
  home: z.string().optional(),
});

const SocketAddr = z.string().refine(
  (a) => {
    const i = a.lastIndexOf(':');
    const ip = a.slice(0, i);
    return i > 0 && /^(\d+|\*)$/.test(a.slice(i + 1)) && (ip === '0.0.0.0' || ip === '*' || isSafeIp(ip));
  },
  { message: 'adresse ip:port attendue (IP privée/documentation, 0.0.0.0 ou *)' },
);

export const ConnectionSchema = z.object({
  proto: z.enum(['tcp', 'udp']).default('tcp'),
  local: SocketAddr,
  remote: SocketAddr.default('0.0.0.0:*'),
  state: z.enum(['LISTEN', 'ESTABLISHED', 'SYN_SENT', 'TIME_WAIT', 'CLOSE_WAIT']).default('ESTABLISHED'),
  pid: z.number().int().positive().optional(),
  program: z.string().optional(),
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
  /** Running processes (ps). */
  processes: z.array(z.object({ pid: z.number().int().positive(), user: z.string(), cmd: z.string() })).default([]),
  /** Network sockets (netstat / ss). */
  connections: z.array(ConnectionSchema).default([]),
});

export const NetworkSpecSchema = z.object({
  id: z.string(),
  cidr: z.string(),
  label: z.string().optional(),
});

export const DnsRecordSchema = z.object({
  /** Relative name: `@` for the apex, or a label like `vpn`. */
  name: z.string(),
  type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT']),
  value: z.string(),
  ttl: z.number().int().positive().default(3600),
});

export const DomainSpecSchema = z.object({
  name: SafeHostname,
  registrar: z.string().default('Registrar Fictif SAS'),
  registrant: z.string().default('REDACTED FOR PRIVACY'),
  created: z.string().default('2019-04-02'),
  expires: z.string().default('2032-04-02'),
  nameservers: z.array(SafeHostname).default([]),
  abuse: z.string().optional(),
  records: z.array(DnsRecordSchema).default([]),
  /** Misconfiguration lesson: the nameserver answers zone transfers (AXFR) to anyone. */
  axfr: z.boolean().default(false),
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
  /** Public DNS / whois data reachable with dig and whois. */
  domains: z.array(DomainSpecSchema).default([]),
});

export type ScenarioSpec = z.infer<typeof ScenarioSchema>;
export type DomainSpec = z.infer<typeof DomainSpecSchema>;
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
    'concept.mastered',
    'dns.queried',
    'dns.axfr',
    'whois.queried',
    'http.requested',
    'tls.inspected',
    'process.listed',
    'connections.listed',
    'finding.confirmed',
    'choice.made',
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

/** Deductions the player submits with `report <id> <answer>`. */
export const QuestionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  prompt: z.string(),
  /** Accepted answers, compared case-insensitively after trimming. */
  accept: z.array(z.string().min(1)).min(1),
  /** Shown on a wrong answer: points to the evidence, never gives the answer. */
  hint: z.string().optional(),
  /** Shown once confirmed: why this answer is the right one. */
  explain: z.string().optional(),
  requires: z.array(z.string()).default([]),
});

export const ChoiceOptionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  description: z.string(),
  /** Gauge deltas, applied once (gauges are clamped to 0–100). */
  effects: z
    .object({ integrity: z.number().int().default(0), initiative: z.number().int().default(0) })
    .default({ integrity: 0, initiative: 0 }),
  /** Markdown shown in the debrief: what this decision caused. */
  consequence: z.string(),
});

/** A narrative decision, offered when its trigger fires. */
export const ChoiceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  from: z.string(),
  prompt: z.string(),
  on: MessageSchema.shape.on,
  where: TriggerSchema.shape.where,
  options: z.array(ChoiceOptionSchema).min(2).max(3),
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
  questions: z.array(QuestionSchema).default([]),
  choices: z.array(ChoiceSchema).default([]),
});

export type MissionSpec = z.infer<typeof MissionSchema>;
export type ObjectiveSpec = z.infer<typeof ObjectiveSchema>;
export type MessageSpec = z.infer<typeof MessageSchema>;
export type QuestionSpec = z.infer<typeof QuestionSchema>;
export type ChoiceSpec = z.infer<typeof ChoiceSchema>;
