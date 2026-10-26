import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';
import { type Concept, ConceptMetaSchema, MissionSchema, type MissionSpec } from './schema.ts';

export class ContentError extends Error {
  readonly source: string;

  constructor(source: string, message: string) {
    super(`${source}: ${message}`);
    this.source = source;
  }
}

function formatZod(error: z.ZodError): string {
  return error.issues.map((i) => `  • ${i.path.join('.') || '(racine)'} — ${i.message}`).join('\n');
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseConcept(markdown: string, source = 'concept'): Concept {
  const match = FRONTMATTER.exec(markdown);
  if (!match) throw new ContentError(source, 'frontmatter YAML manquant (--- … ---)');
  const meta = ConceptMetaSchema.safeParse(parseYaml(match[1] as string));
  if (!meta.success) throw new ContentError(source, `\n${formatZod(meta.error)}`);
  return { ...meta.data, body: (match[2] as string).trim() };
}

export function parseMission(yamlText: string, source = 'mission'): MissionSpec {
  const result = MissionSchema.safeParse(parseYaml(yamlText));
  if (!result.success) throw new ContentError(source, `\n${formatZod(result.error)}`);
  const mission = result.data;

  // Cross-reference checks the schema cannot express.
  const issues: string[] = [];
  const hostIds = new Set(mission.scenario.hosts.map((h) => h.id));
  const netIds = new Set(mission.scenario.networks.map((n) => n.id));
  const objIds = new Set(mission.objectives.map((o) => o.id));
  if (!hostIds.has(mission.scenario.start.host)) {
    issues.push(`scenario.start.host « ${mission.scenario.start.host} » inconnu`);
  }
  for (const h of mission.scenario.hosts) {
    for (const n of h.networks) if (!netIds.has(n)) issues.push(`hôte ${h.id} : réseau « ${n} » inconnu`);
  }
  for (const k of mission.scenario.known) if (!hostIds.has(k)) issues.push(`known : hôte « ${k} » inconnu`);
  for (const o of mission.objectives) {
    for (const r of o.requires) if (!objIds.has(r)) issues.push(`objectif ${o.id} : requires « ${r} » inconnu`);
  }
  const msgIds = new Set<string>();
  for (const m of mission.messages) {
    if (msgIds.has(m.id)) issues.push(`message « ${m.id} » dupliqué`);
    msgIds.add(m.id);
    const ref = m.where.objectiveId;
    if (m.on === 'objective.completed' && (typeof ref !== 'string' || !objIds.has(ref))) {
      issues.push(`message ${m.id} : where.objectiveId « ${String(ref)} » inconnu`);
    }
  }
  if (issues.length) throw new ContentError(source, `\n${issues.map((i) => `  • ${i}`).join('\n')}`);
  return mission;
}

/** Checks that every concept id referenced by missions exists. */
export function checkConceptRefs(missions: MissionSpec[], concepts: Concept[]): string[] {
  const ids = new Set(concepts.map((c) => c.id));
  const missing: string[] = [];
  for (const m of missions) {
    const refs = [...m.concepts, ...m.objectives.flatMap((o) => o.concepts)];
    for (const r of refs) if (!ids.has(r)) missing.push(`${m.id} → concept « ${r} » introuvable`);
  }
  for (const c of concepts) {
    for (const r of c.related) if (!ids.has(r)) missing.push(`${c.id} → related « ${r} » introuvable`);
  }
  return missing;
}
