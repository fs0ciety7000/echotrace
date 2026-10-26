import type { MissionSpec, ObjectiveSpec } from '../content/schema.ts';
import type { EventBus, GameEvent } from '../events.ts';

export interface MissionProgress {
  missionId: string;
  completed: string[];
  hintsUsed: string[];
  status: 'active' | 'completed';
  startedAt: number;
  completedAt?: number;
}

export type ObjectiveState = 'locked' | 'active' | 'done';

export interface ObjectiveView {
  id: string;
  label: string;
  optional: boolean;
  state: ObjectiveState;
  hint?: string;
}

export function newProgress(missionId: string, clock: number): MissionProgress {
  return { missionId, completed: [], hintsUsed: [], status: 'active', startedAt: clock };
}

/** Shallow payload match; array fields match when they include the expected value. */
export function matchesWhere(payload: Record<string, unknown>, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, expected]) => {
    const actual = payload[key];
    if (Array.isArray(actual)) return actual.includes(expected);
    return actual === expected;
  });
}

/**
 * Listens to the event bus and completes objectives whose trigger matches.
 * Holds no state of its own besides the (serialisable) progress object.
 */
export class MissionRunner {
  readonly spec: MissionSpec;
  readonly progress: MissionProgress;
  private readonly bus: EventBus;
  private readonly now: () => number;

  constructor(spec: MissionSpec, progress: MissionProgress, bus: EventBus, now: () => number) {
    this.spec = spec;
    this.progress = progress;
    this.bus = bus;
    this.now = now;
  }

  private isUnlocked(o: ObjectiveSpec): boolean {
    return o.requires.every((r) => this.progress.completed.includes(r));
  }

  stateOf(o: ObjectiveSpec): ObjectiveState {
    if (this.progress.completed.includes(o.id)) return 'done';
    return this.isUnlocked(o) ? 'active' : 'locked';
  }

  objectives(): ObjectiveView[] {
    return this.spec.objectives.map((o) => ({
      id: o.id,
      label: o.label,
      optional: o.optional,
      state: this.stateOf(o),
      ...(o.hint ? { hint: o.hint } : {}),
    }));
  }

  /** First active, not-yet-completed objective (required ones first). */
  current(): ObjectiveSpec | undefined {
    const active = this.spec.objectives.filter((o) => this.stateOf(o) === 'active');
    return active.find((o) => !o.optional) ?? active[0];
  }

  /** Optional objectives stay completable after the mission itself is done (until debrief). */
  handle(event: GameEvent): void {
    for (const o of this.spec.objectives) {
      if (o.on !== event.type || this.stateOf(o) !== 'active') continue;
      if (!matchesWhere(event.payload as unknown as Record<string, unknown>, o.where)) continue;
      this.progress.completed.push(o.id);
      this.bus.emit('objective.completed', { missionId: this.spec.id, objectiveId: o.id });
      for (const c of o.concepts) this.bus.emit('concept.encountered', { id: c, source: this.spec.id });
    }
    if (this.progress.status === 'completed') return;
    const done = this.spec.objectives.filter((o) => !o.optional).every((o) => this.progress.completed.includes(o.id));
    if (done) {
      this.progress.status = 'completed';
      this.progress.completedAt = this.now();
      this.bus.emit('mission.completed', { missionId: this.spec.id });
    }
  }
}
