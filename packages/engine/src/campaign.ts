import type { MissionSpec } from './content/schema.ts';
import type { DossierProgress } from './dossier.ts';

/** What persists across missions: progression, moral gauges and every decision taken. */
export interface CampaignState {
  completed: string[];
  /** Respect of the ECHO doctrine, legality, proportionality (0–100). */
  integrity: number;
  /** Efficiency, risk-taking, grey shortcuts (0–100). */
  initiative: number;
  /** `missionId/choiceId` → optionId. Later missions can react to them. */
  decisions: Record<string, string>;
  /** Evidence graph progress (added with the Dossier; absent in older saves). */
  dossier?: DossierProgress;
}

export const GAUGE_START = 50;

export function newCampaign(): CampaignState {
  return { completed: [], integrity: GAUGE_START, initiative: GAUGE_START, decisions: {} };
}

export const clampGauge = (v: number): number => Math.max(0, Math.min(100, v));

const CAMPAIGN_ACTS = ['prologue', 'acte-1', 'acte-2', 'acte-3'];

/** Campaign missions in play order (side content — Banc, contrats — excluded). */
export function campaignOrder(missions: MissionSpec[]): MissionSpec[] {
  return missions
    .filter((m) => CAMPAIGN_ACTS.includes(m.act))
    .sort((a, b) => CAMPAIGN_ACTS.indexOf(a.act) - CAMPAIGN_ACTS.indexOf(b.act) || a.order - b.order);
}

/** The next campaign mission not completed yet, or undefined when the campaign is over. */
export function nextMission(missions: MissionSpec[], campaign: CampaignState): MissionSpec | undefined {
  return campaignOrder(missions).find((m) => !campaign.completed.includes(m.id));
}
