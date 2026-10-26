import { type CampaignState, clampGauge, newCampaign } from './campaign.ts';
import { registerDefaultCommands } from './commands/index.ts';
import type { Concept, MissionSpec } from './content/schema.ts';
import { EventBus, type EventMap, type EventName } from './events.ts';
import { type JournalState, recordEncounter, recordQuiz, recordStudy } from './journal.ts';
import { type MissionProgress, MissionRunner, newProgress } from './missions/runner.ts';
import { danger, line, subtle } from './output.ts';
import { CommandRegistry } from './shell/command.ts';
import { ParseError, tokenize } from './shell/tokenize.ts';
import type { EngineState, Host, HostKnowledge, Line } from './types.ts';
import { getNode, listDir, resolvePath } from './vfs.ts';
import { buildState, homeOf } from './world.ts';

export const SAVE_VERSION = 2;

export interface SaveData {
  version: number;
  state: EngineState;
  journal: JournalState;
  mission: MissionProgress | null;
  /** Added in v2. */
  campaign?: CampaignState;
}

export interface ExecResult {
  lines: Line[];
  clear: boolean;
}

export interface PendingPrompt {
  label: string;
  secret: boolean;
}

export interface Completion {
  /** The new full input line. */
  input: string;
  /** Candidates to display when ambiguous (empty when completed uniquely). */
  options: string[];
}

interface Pending {
  prompt: PendingPrompt;
  resolve: (input: string) => Line[];
}

/** Clock cost of a command when it does not set its own. */
const BASE_COMMAND_MS = 12_000;
const SCROLLBACK_HISTORY = 500;

export interface EngineOptions {
  state: EngineState;
  concepts?: Concept[];
  mission?: MissionSpec;
  missionProgress?: MissionProgress | null;
  journal?: JournalState;
  campaign?: CampaignState;
}

export class Engine {
  readonly bus = new EventBus();
  readonly registry = registerDefaultCommands(new CommandRegistry());
  readonly concepts: Map<string, Concept>;
  readonly state: EngineState;
  readonly journal: JournalState;
  readonly campaign: CampaignState;
  readonly mission: MissionRunner | null;
  private pending: Pending | null = null;

  constructor(opts: EngineOptions) {
    this.state = opts.state;
    this.journal = opts.journal ?? {};
    this.campaign = opts.campaign ?? newCampaign();
    this.concepts = new Map((opts.concepts ?? []).map((c) => [c.id, c]));
    this.mission = opts.mission
      ? new MissionRunner(
          opts.mission,
          opts.missionProgress ?? newProgress(opts.mission.id, this.state.clock),
          this.bus,
          () => this.state.clock,
          () => this.campaign.decisions,
        )
      : null;

    this.bus.on((event) => {
      switch (event.type) {
        case 'concept.encountered':
          recordEncounter(this.journal, event.payload.id, event.payload.source, this.state.clock);
          break;
        case 'concept.studied':
          recordStudy(this.journal, event.payload.id, this.state.clock);
          break;
        case 'concept.mastered':
          recordQuiz(this.journal, event.payload.id, this.state.clock);
          break;
        case 'host.pinged':
          this.addExposure(1);
          break;
        case 'host.scanned':
          this.addExposure(event.payload.versions ? 6 : 4);
          break;
        case 'auth.failed':
          this.addExposure(5);
          break;
        case 'dns.axfr':
          this.addExposure(2);
          break;
        case 'choice.made':
          this.applyDecision(event.payload.missionId, event.payload.choiceId, event.payload.optionId);
          break;
        case 'mission.completed':
          if (!this.campaign.completed.includes(event.payload.missionId)) {
            this.campaign.completed.push(event.payload.missionId);
          }
          break;
      }
      this.mission?.handle(event);
    });
  }

  /** Starts a mission from scratch; journal and campaign carry over from previous missions. */
  static fromMission(
    mission: MissionSpec,
    concepts: Concept[],
    journal: JournalState = {},
    campaign: CampaignState = newCampaign(),
  ): Engine {
    return new Engine({ state: buildState(mission.scenario), mission, concepts, journal, campaign });
  }

  /** Restores a save. Throws when the save is newer than this engine. */
  static restore(save: SaveData, mission: MissionSpec | undefined, concepts: Concept[]): Engine {
    if (save.version > SAVE_VERSION) throw new Error(`sauvegarde v${save.version} plus récente que le moteur`);
    // v1 → v2: no campaign yet; a finished mission counts as completed.
    const campaign = save.campaign ?? newCampaign();
    if (!save.campaign && save.mission?.status === 'completed') campaign.completed.push(save.mission.missionId);
    return new Engine({
      state: save.state,
      concepts,
      journal: save.journal,
      campaign,
      ...(mission ? { mission, missionProgress: save.mission } : {}),
    });
  }

  snapshot(): SaveData {
    return structuredClone({
      version: SAVE_VERSION,
      state: this.state,
      journal: this.journal,
      mission: this.mission?.progress ?? null,
      campaign: this.campaign,
    });
  }

  // --- Helpers used by commands ---------------------------------------------

  emit<K extends EventName>(type: K, payload: EventMap[K]): void {
    this.bus.emit(type, payload);
  }

  host(): Host {
    return this.state.world.hosts[this.state.session.hostId] as Host;
  }

  home(): string {
    const { user } = this.state.session;
    return this.host().accounts.find((a) => a.user === user)?.home ?? homeOf(user);
  }

  resolve(target: string): string {
    return resolvePath(this.state.session.cwd, target, this.home());
  }

  advance(ms: number): void {
    this.state.clock += ms;
  }

  addExposure(amount: number): void {
    this.state.exposure = Math.max(0, Math.min(100, this.state.exposure + amount));
  }

  knowledgeOf(hostId: string): HostKnowledge {
    let k = this.state.knowledge[hostId];
    if (!k) {
      k = { discovered: false, ports: [], fingerprinted: false, accessed: false };
      this.state.knowledge[hostId] = k;
    }
    return k;
  }

  discover(host: Host): void {
    const k = this.knowledgeOf(host.id);
    if (!k.discovered) {
      k.discovered = true;
      this.emit('host.discovered', { hostId: host.id, ip: host.ip });
    }
  }

  encounter(conceptId: string, source: string): void {
    this.emit('concept.encountered', { id: conceptId, source });
  }

  /** Marks a concept as studied (fiche opened from the UI or `learn`). */
  study(conceptId: string): void {
    if (this.concepts.has(conceptId)) this.emit('concept.studied', { id: conceptId });
  }

  /** Records a passed quiz (the UI grades it; the journal only keeps the result). */
  passQuiz(conceptId: string): void {
    if (this.concepts.get(conceptId)?.quiz.length) this.emit('concept.mastered', { id: conceptId });
  }

  /** Picks an option of the pending choice. Returns false when it isn't pending. */
  choose(choiceId: string, optionId: string): boolean {
    return this.mission?.choose(choiceId, optionId) != null;
  }

  private applyDecision(missionId: string, choiceId: string, optionId: string): void {
    const option = this.mission?.spec.choices.find((c) => c.id === choiceId)?.options.find((o) => o.id === optionId);
    if (!option) return;
    this.campaign.integrity = clampGauge(this.campaign.integrity + option.effects.integrity);
    this.campaign.initiative = clampGauge(this.campaign.initiative + option.effects.initiative);
    this.campaign.decisions[`${missionId}/${choiceId}`] = optionId;
  }

  /** Asks the player for a line of input (password…). The next execute() goes to `resolve`. */
  ask(prompt: PendingPrompt, resolve: (input: string) => Line[]): void {
    this.pending = { prompt, resolve };
  }

  pendingPrompt(): PendingPrompt | null {
    return this.pending?.prompt ?? null;
  }

  cancelPending(): void {
    this.pending = null;
  }

  // --- Shell ----------------------------------------------------------------

  prompt(): Line {
    const { user, cwd } = this.state.session;
    const home = this.home();
    const shown = cwd === home ? '~' : cwd.startsWith(`${home}/`) ? `~${cwd.slice(home.length)}` : cwd;
    return [
      { t: user, s: 'success' },
      { t: '@', s: 'subtle' },
      { t: this.host().hostname, s: 'accent' },
      { t: ':', s: 'subtle' },
      { t: shown, s: 'echo' },
      { t: user === 'root' ? '# ' : '$ ', s: 'subtle' },
    ];
  }

  execute(input: string): ExecResult {
    if (this.pending) {
      const { resolve } = this.pending;
      this.pending = null;
      return { lines: resolve(input), clear: false };
    }

    const trimmed = input.trim();
    if (!trimmed) return { lines: [], clear: false };

    const history = this.state.session.history;
    if (history[history.length - 1] !== trimmed) history.push(trimmed);
    if (history.length > SCROLLBACK_HISTORY) history.splice(0, history.length - SCROLLBACK_HISTORY);

    let stages: string[][];
    try {
      stages = tokenize(trimmed);
    } catch (e) {
      if (e instanceof ParseError) return { lines: [line(danger(`echo-sh: ${e.message}`))], clear: false };
      throw e;
    }

    let stdin: Line[] | null = null;
    let clear = false;
    const clockBefore = this.state.clock;
    for (const [name, ...argv] of stages as [string, ...string[]][]) {
      const cmd = this.registry.get(name);
      if (!cmd) {
        this.emit('command.unknown', { name });
        return {
          lines: [line(danger(`${name}: commande introuvable`), subtle(" — tape 'help' pour la liste"))],
          clear: false,
        };
      }
      this.emit('command.run', { name: cmd.name, args: argv });
      for (const c of cmd.concepts ?? []) this.encounter(c, cmd.name);
      const out = cmd.run({ argv, stdin, engine: this });
      const result = Array.isArray(out) ? { lines: out } : out;
      if (result.clear) clear = true;
      stdin = result.lines;
      // A stage that asked for input ends the pipeline.
      if (this.pending) break;
    }
    if (this.state.clock === clockBefore) this.advance(BASE_COMMAND_MS);
    return { lines: stdin ?? [], clear };
  }

  complete(input: string): Completion {
    if (this.pending) return { input, options: [] };
    const tokens = input.split(/\s+/);
    const current = tokens[tokens.length - 1] ?? '';
    const head = input.slice(0, input.length - current.length);
    // Command position: first token of the line or right after a pipe.
    const isCommandPos = tokens.length === 1 || tokens[tokens.length - 2] === '|';

    let candidates: string[];
    if (isCommandPos) {
      candidates = this.registry
        .all()
        .filter((c) => !c.hidden)
        .map((c) => c.name);
    } else {
      const cmdName = tokens[tokens.lastIndexOf('|', tokens.length - 2) + 1] ?? '';
      const kind = this.registry.get(cmdName)?.complete;
      candidates = this.completionCandidates(kind, current);
    }

    const matches = [...new Set(candidates.filter((c) => c.startsWith(current)))].sort();
    if (matches.length === 0) return { input, options: [] };
    if (matches.length === 1) {
      const only = matches[0] as string;
      return { input: head + only + (only.endsWith('/') ? '' : ' '), options: [] };
    }
    const prefix = commonPrefix(matches);
    return { input: head + prefix, options: prefix.length > current.length ? [] : matches };
  }

  private completionCandidates(kind: string | undefined, current: string): string[] {
    switch (kind) {
      case 'command':
        return this.registry.all().map((c) => c.name);
      case 'concept':
        return [...this.concepts.keys()];
      case 'host': {
        const user = current.includes('@') ? current.slice(0, current.indexOf('@') + 1) : '';
        return Object.entries(this.state.knowledge)
          .filter(([, k]) => k.discovered)
          .flatMap(([id]) => {
            const h = this.state.world.hosts[id];
            return h ? [user + h.hostname, user + h.ip] : [];
          });
      }
      case 'path': {
        const slash = current.lastIndexOf('/');
        const dirPart = slash >= 0 ? current.slice(0, slash + 1) : '';
        const dir = getNode(this.host().fs, this.resolve(dirPart || '.'));
        if (dir?.kind !== 'dir') return [];
        return listDir(dir, current.slice(slash + 1).startsWith('.')).map(
          ([name, node]) => dirPart + name + (node.kind === 'dir' ? '/' : ''),
        );
      }
      default:
        return [];
    }
  }
}

function commonPrefix(values: string[]): string {
  let prefix = values[0] ?? '';
  for (const v of values) while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}
