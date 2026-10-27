import {
  type Concept,
  type DossierSpec,
  type EndingsSpec,
  type MissionSpec,
  parseConcept,
  parseDossier,
  parseEndings,
  parseMission,
} from '@echotrace/engine';
import dossierRaw from '../../../../content/dossier.yaml?raw';
import finsRaw from '../../../../content/fins.yaml?raw';

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

/** The campaign evidence graph (content/dossier.yaml). */
export const dossier: DossierSpec = parseDossier(dossierRaw);

/** Campaign endings (content/fins.yaml). */
export const endings: EndingsSpec = parseEndings(finsRaw);
