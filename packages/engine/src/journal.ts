/**
 * Learning journal: what the player has met, studied and mastered.
 * Mastery is deliberately simple and explainable to the player:
 *   0 — unknown · 1 — encountered in play · 2 — fiche studied · 3 — quiz passed
 */

export interface JournalEntry {
  /** Simulated clock at first encounter. */
  firstSeen: number;
  uses: number;
  studied: boolean;
  quizPassed: boolean;
  /** Where it was first met (command name or mission id). */
  source: string;
}

export type JournalState = Record<string, JournalEntry>;

export type Mastery = 0 | 1 | 2 | 3;

export function mastery(entry: JournalEntry | undefined): Mastery {
  if (!entry) return 0;
  if (entry.quizPassed) return 3;
  if (entry.studied) return 2;
  return 1;
}

export function recordEncounter(journal: JournalState, id: string, source: string, clock: number): boolean {
  const existing = journal[id];
  if (existing) {
    existing.uses += 1;
    return false;
  }
  journal[id] = { firstSeen: clock, uses: 1, studied: false, quizPassed: false, source };
  return true;
}

export function recordQuiz(journal: JournalState, id: string, clock: number): void {
  recordStudy(journal, id, clock);
  (journal[id] as JournalEntry).quizPassed = true;
}

export function recordStudy(journal: JournalState, id: string, clock: number): void {
  const entry = journal[id] ?? { firstSeen: clock, uses: 0, studied: false, quizPassed: false, source: 'journal' };
  entry.studied = true;
  journal[id] = entry;
}
