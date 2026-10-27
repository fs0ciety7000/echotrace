import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.ts';
import { generateSandbox, normalizeSeed, type SandboxLevel } from '../src/sandbox.ts';
import { concepts, text } from './helpers.ts';

const SEEDS = ['BANC', 'ECHO-7', 'A1', 'VALLON', 'NOVEMBRE', 'Z', '2031', 'QUARTZ-42', 'X9-Y8', 'LUMIERE'];
const LEVELS: SandboxLevel[] = [1, 2, 3];

describe('le Banc — exercices générés', () => {
  it('is deterministic: same seed and level, same mission', () => {
    expect(generateSandbox('echo-7', 2)).toEqual(generateSandbox(' ECHO-7 ', 2));
    expect(generateSandbox('ECHO-7', 2).mission).not.toEqual(generateSandbox('ECHO-8', 2).mission);
  });

  it('normalizes seeds', () => {
    expect(normalizeSeed('  ab c-1! ')).toBe('ABC-1');
  });

  for (const level of LEVELS) {
    it(`every seed is solvable at level ${level}`, () => {
      for (const seed of SEEDS) {
        const { mission, solution } = generateSandbox(seed, level);
        const e = Engine.fromMission(mission, concepts);
        const outputs = solution.map((c) => text(e.execute(c)));
        expect(e.mission?.progress.status, `${seed} niveau ${level}\n${outputs.join('\n')}`).toBe('completed');
      }
    });
  }

  it('a too broad block does not complete the exercise', () => {
    const { mission, solution } = generateSandbox('BANC', 2);
    const e = Engine.fromMission(mission, concepts);
    for (const c of solution.slice(0, -1)) e.execute(c);
    const ip = solution.at(-1)?.split(' ').at(-1) ?? '';
    e.execute(`fw block ${ip.split('.').slice(0, 3).join('.')}.0/24`);
    expect(e.mission?.progress.completed).not.toContain('bloquer');
  });

  it('the read-only account cannot touch the firewall', () => {
    const { mission, solution } = generateSandbox('BANC', 1);
    const e = Engine.fromMission(mission, concepts);
    e.execute(solution[3] as string);
    e.execute(solution[4] as string);
    expect(text(e.execute('fw block 192.0.2.1'))).toContain('droits insuffisants');
  });
});
