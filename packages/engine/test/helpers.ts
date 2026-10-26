import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseConcept, parseMission } from '../src/content/parse.ts';
import { Engine, type ExecResult } from '../src/engine.ts';
import { lineText } from '../src/output.ts';

const contentDir = resolve(import.meta.dirname, '../../../content');

export const concepts = readdirSync(join(contentDir, 'concepts'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => parseConcept(readFileSync(join(contentDir, 'concepts', f), 'utf8'), f));

export function loadMission(file: string) {
  return parseMission(readFileSync(join(contentDir, 'missions', file), 'utf8'), file);
}

export const text = (r: ExecResult): string => r.lines.map(lineText).join('\n');

export function newPrologue(): Engine {
  return Engine.fromMission(loadMission('00-prologue.yaml'), concepts);
}
