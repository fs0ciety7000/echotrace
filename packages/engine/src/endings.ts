import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { CampaignState } from './campaign.ts';
import { ContentError } from './content/parse.ts';

/**
 * Campaign endings (content/fins.yaml). Conditions are evaluated in order;
 * the first ending whose conditions all hold wins, `fallback` otherwise.
 */

const ConditionSchema = z.object({
  /** Options of the final decision that lead here. */
  decision: z.array(z.string()).optional(),
  minIntegrity: z.number().int().optional(),
  maxIntegrity: z.number().int().optional(),
  minInitiative: z.number().int().optional(),
  minSolidity: z.number().int().optional(),
  maxSolidity: z.number().int().optional(),
});

export const EndingSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  /** One line under the title. */
  tagline: z.string(),
  /** Markdown epilogue. */
  text: z.string(),
  when: ConditionSchema.default({}),
});

export const EndingsSchema = z.object({
  /** `missionId/choiceId` of the decision that closes the campaign. */
  decision: z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/),
  endings: z.array(EndingSchema).min(1),
  fallback: z.string(),
});

export type EndingsSpec = z.infer<typeof EndingsSchema>;
export type Ending = z.infer<typeof EndingSchema>;

export function parseEndings(yamlText: string, source = 'fins.yaml'): EndingsSpec {
  const r = EndingsSchema.safeParse(parseYaml(yamlText));
  if (!r.success)
    throw new ContentError(
      source,
      `\n${r.error.issues.map((i) => `  • ${i.path.join('.')} — ${i.message}`).join('\n')}`,
    );
  if (!r.data.endings.some((e) => e.id === r.data.fallback))
    throw new ContentError(source, `fallback « ${r.data.fallback} » inconnu`);
  return r.data;
}

export interface EndingInputs {
  campaign: CampaignState;
  /** Dossier solidity (0–100) at the time of the final decision. */
  solidity: number;
}

export function matches(e: Ending, spec: EndingsSpec, { campaign, solidity }: EndingInputs): boolean {
  const w = e.when;
  const decided = campaign.decisions[spec.decision];
  if (w.decision && (!decided || !w.decision.includes(decided))) return false;
  if (w.minIntegrity !== undefined && campaign.integrity < w.minIntegrity) return false;
  if (w.maxIntegrity !== undefined && campaign.integrity > w.maxIntegrity) return false;
  if (w.minInitiative !== undefined && campaign.initiative < w.minInitiative) return false;
  if (w.minSolidity !== undefined && solidity < w.minSolidity) return false;
  if (w.maxSolidity !== undefined && solidity > w.maxSolidity) return false;
  return true;
}

/** Null until the closing decision has been taken. */
export function computeEnding(spec: EndingsSpec, inputs: EndingInputs): Ending | null {
  if (!inputs.campaign.decisions[spec.decision]) return null;
  return (
    spec.endings.find((e) => matches(e, spec, inputs)) ?? (spec.endings.find((e) => e.id === spec.fallback) as Ending)
  );
}
