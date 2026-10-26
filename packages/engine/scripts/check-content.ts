/**
 * Validates every mission and concept under /content.
 * Run: pnpm content:check (also in CI and in the Docker build).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ContentError, checkConceptRefs, parseConcept, parseMission } from '../src/content/parse.ts';
import type { Concept, MissionSpec } from '../src/content/schema.ts';

const root = resolve(import.meta.dirname, '../../../content');
const errors: string[] = [];

function load<T>(dir: string, ext: string, parse: (text: string, source: string) => T): T[] {
  const out: T[] = [];
  for (const file of readdirSync(join(root, dir))
    .filter((f) => f.endsWith(ext))
    .sort()) {
    const source = `${dir}/${file}`;
    try {
      out.push(parse(readFileSync(join(root, dir, file), 'utf8'), source));
    } catch (e) {
      errors.push(e instanceof ContentError ? e.message : `${source}: ${String(e)}`);
    }
  }
  return out;
}

const concepts: Concept[] = load('concepts', '.md', parseConcept);
const missions: MissionSpec[] = load('missions', '.yaml', parseMission);

for (const c of concepts) {
  const file = `${c.id}.md`;
  if (!readdirSync(join(root, 'concepts')).includes(file)) errors.push(`concepts: « ${c.id} » doit être dans ${file}`);
}
const ids = new Set<string>();
for (const m of missions) {
  if (ids.has(m.id)) errors.push(`missions: id dupliqué « ${m.id} »`);
  ids.add(m.id);
}
errors.push(...checkConceptRefs(missions, concepts));

if (errors.length) {
  console.error(`✗ ${errors.length} erreur(s) de contenu :\n`);
  for (const e of errors) console.error(e);
  process.exit(1);
}
console.log(`✓ contenu valide — ${missions.length} mission(s), ${concepts.length} fiche(s)`);
