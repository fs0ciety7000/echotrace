import type { MessageSpec, MissionSpec, ObjectiveSpec } from '../content/schema.ts';
import type { EventBus, GameEvent } from '../events.ts';

export interface MissionProgress {
  missionId: string;
  completed: string[];
  hintsUsed: string[];
  status: 'active' | 'completed';
  startedAt: number;
  completedAt?: number;
  /** Delivered messages, in arrival order. Optional for saves made before messages existed. */
  inbox?: InboxEntry[];
}

export interface InboxEntry {
  id: string;
  /** Simulated clock at delivery. */
  at: number;
  read: boolean;
}

export interface MessageView extends InboxEntry {
  from: string;
  subject?: string;
  body: string;
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
  return { missionId, completed: [], hintsUsed: [], status: 'active', startedAt: clock, inbox: [] };
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
    this.progress.inbox ??= [];
    // Messages addressed to the very start arrive silently with a fresh mission.
    if (progress.completed.length === 0) {
      for (const m of spec.messages) if (m.on === 'mission.started') this.deliver(m, false);
    }
  }

  private deliver(m: MessageSpec, notify = true): void {
    const inbox = this.progress.inbox as InboxEntry[];
    if (inbox.some((e) => e.id === m.id)) return;
    inbox.push({ id: m.id, at: this.now(), read: false });
    if (notify) this.bus.emit('message.received', { missionId: this.spec.id, messageId: m.id, from: m.from });
  }

  inbox(): MessageView[] {
    return (this.progress.inbox ?? []).flatMap((e) => {
      const m = this.spec.messages.find((x) => x.id === e.id);
      return m ? [{ ...e, from: m.from, body: m.body, ...(m.subject ? { subject: m.subject } : {}) }] : [];
    });
  }

  unreadCount(): number {
    return (this.progress.inbox ?? []).filter((e) => !e.read).length;
  }

  markRead(id?: string): void {
    for (const e of this.progress.inbox ?? []) if (id === undefined || e.id === id) e.read = true;
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
    for (const m of this.spec.messages) {
      if (m.on === event.type && matchesWhere(event.payload as unknown as Record<string, unknown>, m.where)) {
        this.deliver(m);
      }
    }
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
