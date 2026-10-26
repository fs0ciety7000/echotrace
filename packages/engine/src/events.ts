/**
 * Typed event bus. Commands emit facts about what the player did;
 * missions, the learning journal and the exposure meter subscribe.
 * A command never knows about missions.
 */

export interface EventMap {
  'command.run': { name: string; args: string[] };
  'command.unknown': { name: string };
  'dir.listed': { hostId: string; path: string };
  'file.read': { hostId: string; path: string };
  'host.discovered': { hostId: string; ip: string };
  'host.pinged': { hostId: string; ip: string; reachable: boolean };
  'host.scanned': { hostId: string; ip: string; ports: number[]; versions: boolean };
  'session.opened': { hostId: string; user: string };
  'session.closed': { hostId: string; user: string };
  'auth.failed': { hostId: string; user: string };
  'concept.encountered': { id: string; source: string };
  'concept.studied': { id: string };
  'concept.mastered': { id: string };
  'hint.requested': { missionId: string; objectiveId: string };
  'objective.completed': { missionId: string; objectiveId: string };
  'mission.completed': { missionId: string };
  'message.received': { missionId: string; messageId: string; from: string };
  'dns.queried': { name: string; type: string; found: boolean };
  'dns.axfr': { domain: string; success: boolean };
  'whois.queried': { domain: string; found: boolean };
  'http.requested': { hostId: string; port: number; path: string; status: number };
  'tls.inspected': { hostId: string; port: number; sha256: string };
  'process.listed': { hostId: string };
  'connections.listed': { hostId: string };
  'finding.confirmed': { missionId: string; questionId: string };
  'finding.rejected': { missionId: string; questionId: string };
  'choice.offered': { missionId: string; choiceId: string };
  'choice.made': { missionId: string; choiceId: string; optionId: string };
}

export type EventName = keyof EventMap;

export type GameEvent = {
  [K in EventName]: { type: K; payload: EventMap[K] };
}[EventName];

type Handler = (event: GameEvent) => void;

export class EventBus {
  private handlers = new Set<Handler>();
  private queue: GameEvent[] = [];
  private flushing = false;

  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Events emitted while handlers run are queued, so handlers always see
   * events in emission order and never re-enter each other.
   */
  emit<K extends EventName>(type: K, payload: EventMap[K]): void {
    this.queue.push({ type, payload } as GameEvent);
    if (this.flushing) return;
    this.flushing = true;
    try {
      while (this.queue.length > 0) {
        const event = this.queue.shift() as GameEvent;
        for (const h of this.handlers) h(event);
      }
    } finally {
      this.flushing = false;
    }
  }
}
