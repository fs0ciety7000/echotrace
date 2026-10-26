import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../src/events.ts';
import { mastery } from '../src/journal.ts';
import { newPrologue } from './helpers.ts';

/** A scripted player: the mission must be completable with documented commands only. */
const SOLUTION = [
  'ls',
  'cat bienvenue.txt',
  'ifconfig',
  'ping banc-01',
  'nmap -sV banc-01',
  'cat notes/banc.txt',
  'ssh stagiaire@banc-01',
  'echo-banc-2031',
  'grep Accepted /var/log/auth.log',
  'exit',
  'nmap -Pn 10.7.0.66',
];

describe('prologue', () => {
  it('is solvable end to end, including the optional objective', () => {
    const e = newPrologue();
    const events: GameEvent[] = [];
    e.bus.on((ev) => events.push(ev));
    for (const cmd of SOLUTION) e.execute(cmd);

    const mission = e.mission;
    expect(mission?.progress.status).toBe('completed');
    expect(mission?.objectives().every((o) => o.state === 'done')).toBe(true);
    expect(events.filter((ev) => ev.type === 'mission.completed')).toHaveLength(1);
    expect(mastery(e.journal['forensique.logs'])).toBe(1);
  });

  it('does not complete objectives out of order', () => {
    const e = newPrologue();
    e.execute('nmap -sV banc-01');
    expect(e.mission?.progress.completed).toEqual([]);
    expect(e.mission?.current()?.id).toBe('list-home');
  });

  it('gives hints for the current objective', () => {
    const e = newPrologue();
    const out = e
      .execute('hint')
      .lines.flat()
      .map((s) => s.t)
      .join('');
    expect(out).toContain('ls');
    expect(e.mission?.progress.hintsUsed).toEqual(['list-home']);
  });

  it('marks studied concepts', () => {
    const e = newPrologue();
    e.execute('learn reseau.port');
    expect(mastery(e.journal['reseau.port'])).toBe(2);
  });
});
