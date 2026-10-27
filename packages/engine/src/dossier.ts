import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { CampaignState } from './campaign.ts';
import { ContentError } from './content/parse.ts';

/**
 * Le Dossier: the campaign-wide evidence graph. Missions unlock pieces; the
 * player links them. A link is confirmed only when the evidence gathered so far
 * supports it — the content lists every link that can be established.
 */

export const ITEM_TYPES = ['personne', 'organisation', 'groupe', 'infrastructure', 'artefact', 'evenement'] as const;

const UnlockSchema = z.object({
  mission: z.string(),
  /** Extra gate on earlier decisions: `missionId/choiceId: [options that unlock]`. */
  decision: z.record(z.string(), z.array(z.string())).default({}),
});

export const DossierItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(ITEM_TYPES),
  label: z.string(),
  detail: z.string().optional(),
  unlock: UnlockSchema,
});

export const DossierLinkSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  from: z.string(),
  to: z.string(),
  relation: z.string(),
  /** Shown once the player establishes the link: what proves it. */
  evidence: z.string(),
  weight: z.number().int().min(1).max(3).default(1),
  /** False for links resting on improperly obtained material: they inform, they don't prove. */
  admissible: z.boolean().default(true),
});

export const DossierSchema = z.object({
  relations: z.array(z.string()).min(1),
  items: z.array(DossierItemSchema).min(1),
  links: z.array(DossierLinkSchema),
});

export type DossierSpec = z.infer<typeof DossierSchema>;
export type DossierItem = z.infer<typeof DossierItemSchema>;
export type DossierLink = z.infer<typeof DossierLinkSchema>;

export interface DossierProgress {
  /** Confirmed link ids. */
  links: string[];
  /** Proposals the evidence did not support. */
  attempts: number;
}

export function parseDossier(yamlText: string, source = 'dossier.yaml'): DossierSpec {
  const result = DossierSchema.safeParse(parseYaml(yamlText));
  if (!result.success) {
    throw new ContentError(
      source,
      `\n${result.error.issues.map((i) => `  • ${i.path.join('.')} — ${i.message}`).join('\n')}`,
    );
  }
  const d = result.data;
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const it of d.items) {
    if (ids.has(it.id)) issues.push(`pièce « ${it.id} » dupliquée`);
    ids.add(it.id);
  }
  const seen = new Set<string>();
  for (const l of d.links) {
    if (!ids.has(l.from) || !ids.has(l.to)) issues.push(`lien ${l.id} : pièce inconnue`);
    if (!d.relations.includes(l.relation)) issues.push(`lien ${l.id} : relation « ${l.relation} » absente de la liste`);
    const key = `${[l.from, l.to].sort().join('|')}|${l.relation}`;
    if (seen.has(key)) issues.push(`lien ${l.id} : doublon (même paire, même relation)`);
    seen.add(key);
  }
  if (issues.length) throw new ContentError(source, `\n${issues.map((i) => `  • ${i}`).join('\n')}`);
  return d;
}

/** What the player has achieved so far, used to decide what is unlocked. */
export interface DossierContext {
  completed: string[];
  /** Mission in progress (its pieces are usable while playing it). */
  currentMission?: string;
  decisions: Record<string, string>;
}

export function isUnlocked(item: DossierItem, ctx: DossierContext): boolean {
  const { mission, decision } = item.unlock;
  const reached = ctx.completed.includes(mission) || ctx.currentMission === mission;
  return reached && Object.entries(decision).every(([key, options]) => options.includes(ctx.decisions[key] ?? ''));
}

export function unlockedItems(spec: DossierSpec, ctx: DossierContext): DossierItem[] {
  return spec.items.filter((i) => isUnlocked(i, ctx));
}

/** Links whose two pieces are unlocked: the ones that can currently be established. */
export function availableLinks(spec: DossierSpec, ctx: DossierContext): DossierLink[] {
  const ids = new Set(unlockedItems(spec, ctx).map((i) => i.id));
  return spec.links.filter((l) => ids.has(l.from) && ids.has(l.to));
}

export type ProposeResult =
  | { ok: true; link: DossierLink; already: boolean }
  | { ok: false; reason: 'unknown' | 'same' | 'relation' | 'unsupported' };

const norm = (s: string) => s.trim().toLowerCase().replace(/[’']/g, "'");

/** Checks a proposed link against the evidence; records it on success. */
export function proposeLink(
  spec: DossierSpec,
  progress: DossierProgress,
  ctx: DossierContext,
  a: string,
  b: string,
  relation: string,
): ProposeResult {
  const unlocked = new Set(unlockedItems(spec, ctx).map((i) => i.id));
  if (!unlocked.has(a) || !unlocked.has(b)) return { ok: false, reason: 'unknown' };
  if (a === b) return { ok: false, reason: 'same' };
  const rel = spec.relations.find((r) => norm(r) === norm(relation));
  if (!rel) return { ok: false, reason: 'relation' };
  const link = availableLinks(spec, ctx).find(
    (l) => l.relation === rel && ((l.from === a && l.to === b) || (l.from === b && l.to === a)),
  );
  if (!link) {
    progress.attempts += 1;
    return { ok: false, reason: 'unsupported' };
  }
  const already = progress.links.includes(link.id);
  if (!already) progress.links.push(link.id);
  return { ok: true, link, already };
}

export interface Solidity {
  /** 0–100: admissible weight established / admissible weight establishable now. */
  score: number;
  confirmed: number;
  available: number;
  /** Confirmed links that would not hold in court. */
  inadmissible: number;
}

export function solidity(spec: DossierSpec, progress: DossierProgress, ctx: DossierContext): Solidity {
  const avail = availableLinks(spec, ctx);
  const done = avail.filter((l) => progress.links.includes(l.id));
  const total = avail.filter((l) => l.admissible).reduce((n, l) => n + l.weight, 0);
  const got = done.filter((l) => l.admissible).reduce((n, l) => n + l.weight, 0);
  return {
    score: total ? Math.round((got / total) * 100) : 0,
    confirmed: done.length,
    available: avail.length,
    inadmissible: done.filter((l) => !l.admissible).length,
  };
}

export function dossierProgressOf(campaign: CampaignState): DossierProgress {
  campaign.dossier ??= { links: [], attempts: 0 };
  return campaign.dossier;
}
