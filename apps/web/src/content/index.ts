import { type Concept, type MissionSpec, parseConcept, parseMission } from '@echotrace/engine';

/**
 * Content is bundled at build time from /content and validated on load.
 * The same files are validated in CI by `pnpm content:check`.
 */
const missionFiles = import.meta.glob<string>('../../../../content/missions/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const conceptFiles = import.meta.glob<string>('../../../../content/concepts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const fileName = (p: string) => p.slice(p.lastIndexOf('/') + 1);

export const missions: MissionSpec[] = Object.entries(missionFiles)
  .map(([p, raw]) => parseMission(raw, fileName(p)))
  .sort((a, b) => a.order - b.order);

export const concepts: Concept[] = Object.entries(conceptFiles).map(([p, raw]) => parseConcept(raw, fileName(p)));

export const conceptById = new Map(concepts.map((c) => [c.id, c]));

export function getMission(id: string): MissionSpec | undefined {
  return missions.find((m) => m.id === id);
}

export const CATEGORY_TITLES: Record<Concept['category'], string> = {
  reseau: 'Réseau',
  systeme: 'Système',
  reconnaissance: 'Reconnaissance',
  forensique: 'Forensique',
  defense: 'Défense',
  ethique: 'Éthique & droit',
};
