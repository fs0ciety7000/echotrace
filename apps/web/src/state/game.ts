import {
  type CampaignState,
  campaignOrder,
  computeEnding,
  dossierProgressOf,
  Engine,
  type GameEvent,
  generateSandbox,
  type JournalState,
  type Line,
  type MissionSpec,
  newCampaign,
  nextMission,
  type ProposeResult,
  type SandboxLevel,
  solidity,
} from '@echotrace/engine';
import { create } from 'zustand';
import { play } from '../audio/sound.ts';
import { concepts, dossier, endings, getMission, missions } from '../content/index.ts';
import { deleteSave, loadJournal, loadSave, type SaveFile, writeJournal, writeSave } from './persistence.ts';

export type Screen = 'menu' | 'operator' | 'banc' | 'ending';
/** Campaign play is saved; Banc exercises only feed the journal. */
export type Mode = 'campagne' | 'banc';
export type View = 'terminal' | 'journal' | 'network' | 'dossier';

export interface TermEntry {
  id: number;
  /** Prompt + typed command, or null for pure output. */
  prompt: Line | null;
  input?: string;
  lines: Line[];
}

export interface Toast {
  id: number;
  tone: 'signal' | 'trace' | 'echo' | 'warn';
  title: string;
  body?: string;
  /** What clicking the toast opens (it is dismissed either way). */
  action?: 'comms';
}

type Modal = 'briefing' | 'debrief' | 'settings' | 'choice' | null;

interface GameStore {
  screen: Screen;
  mode: Mode;
  /** Banc modules completed at least once. */
  bancDone: string[];
  view: View;
  /** Fiche selected in the journal view. */
  journalSelection: string | null;
  engine: Engine | null;
  /** Bumped after every engine mutation so selectors re-run (engine state is mutable). */
  rev: number;
  scrollback: TermEntry[];
  draft: string;
  toasts: Toast[];
  modal: Modal;
  openConcept: string | null;
  commsOpen: boolean;
  hasSave: boolean;
  saveSummary: string | null;
  lastSavedAt: number | null;

  init: () => Promise<void>;
  newGame: () => void;
  openBanc: () => void;
  startBanc: (missionId: string) => void;
  /** Starts a generated Banc exercise (same seed and level ⇒ same network). */
  startSandbox: (seed: string, level: SandboxLevel) => void;
  /** Starts the next campaign mission, carrying journal and campaign over. */
  nextOperation: () => void;
  /** The mission that follows the current one, if any. */
  upcoming: () => MissionSpec | undefined;
  choose: (choiceId: string, optionId: string) => void;
  /** Shows the epilogue once the closing decision is taken. */
  showEnding: () => void;
  continueGame: () => Promise<void>;
  toMenu: () => void;
  run: (input: string) => void;
  interrupt: () => void;
  setDraft: (draft: string) => void;
  setModal: (modal: Modal) => void;
  showConcept: (id: string | null) => void;
  setComms: (open: boolean) => void;
  setView: (view: View) => void;
  /** Opens a fiche in the journal view (counts as studying it). */
  openInJournal: (id: string) => void;
  passQuiz: (id: string) => void;
  /** Proposes a Dossier link; returns the engine verdict. */
  linkDossier: (a: string, b: string, relation: string) => ProposeResult | null;
  /** Marks every delivered message as read (called once the comms panel has shown them). */
  markMessagesRead: () => void;
  dismissToast: (id: number) => void;
  save: () => Promise<void>;
}

let nextId = 1;
/** Journal from the last save, carried into a new game (knowledge belongs to the player). */
let carriedJournal: JournalState = {};
const MAX_SCROLLBACK = 1000;

function banner(engine: Engine): TermEntry {
  const mission = engine.mission?.spec;
  return {
    id: nextId++,
    prompt: null,
    lines: [
      [
        { t: 'ECHO-NET', s: 'accent' },
        { t: ' · poste opérateur v4.2 · liaison chiffrée', s: 'subtle' },
      ],
      [{ t: mission ? `Opération en cours : ${mission.title}` : 'Aucune opération en cours.', s: 'muted' }],
      [
        { t: 'Tape ', s: 'subtle' },
        { t: 'help', s: 'command', ref: 'help' },
        { t: ' pour la liste des commandes, ', s: 'subtle' },
        { t: 'objectives', s: 'command', ref: 'objectives' },
        { t: ' pour tes objectifs.', s: 'subtle' },
      ],
      [],
    ],
  };
}

export const useGame = create<GameStore>()((set, get) => {
  let unsubscribe: (() => void) | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const toast = (t: Omit<Toast, 'id'>) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 5000);
  };

  // New fiches are announced once per command, not one toast each.
  const freshConcepts: string[] = [];
  const flushConcepts = () => {
    if (freshConcepts.length === 0) return;
    const titles = freshConcepts.splice(0);
    toast({
      tone: 'echo',
      title: titles.length === 1 ? 'Nouvelle fiche au journal' : `${titles.length} nouvelles fiches au journal`,
      body: titles.join(' · '),
    });
  };

  /** The engine whose debrief has already been opened automatically. */
  let debriefShown: Engine | null = null;

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void get().save(), 600);
  };

  const attach = (engine: Engine) => {
    unsubscribe?.();
    unsubscribe = engine.bus.on((event: GameEvent) => {
      switch (event.type) {
        case 'objective.completed': {
          const o = engine.mission?.spec.objectives.find((x) => x.id === event.payload.objectiveId);
          toast({ tone: 'trace', title: 'Objectif accompli', body: o?.label ?? '' });
          play('objective');
          break;
        }
        case 'mission.completed':
          play('mission');
          // A decision may still be open on screen; the debrief waits for it.
          setTimeout(() => {
            // Only once per mission, and only if the player is still on this mission's screen
            // (a quick « Épilogue » or « Opération suivante » must not bring the debrief back).
            const s = get();
            if (debriefShown === engine || s.engine !== engine || s.screen !== 'operator' || s.modal === 'choice')
              return;
            debriefShown = engine;
            set({ modal: 'debrief' });
          }, 900);
          break;
        case 'dossier.linked':
          if (!event.payload.already) {
            toast({ tone: 'echo', title: 'Lien établi au Dossier' });
            play('link');
          }
          break;
        case 'choice.offered':
          setTimeout(() => {
            if (get().modal === null) set({ modal: 'choice' });
          }, 1200);
          toast({ tone: 'warn', title: 'Décision attendue', body: 'Ta recommandation est demandée.' });
          play('choice');
          break;
        case 'concept.encountered':
          // Only announce first encounters (uses === 1 after the journal handler ran).
          if (engine.journal[event.payload.id]?.uses === 1) {
            const c = engine.concepts.get(event.payload.id);
            if (c) freshConcepts.push(c.title);
          }
          break;
        case 'message.received': {
          const msg = engine.mission?.spec.messages.find((m) => m.id === event.payload.messageId);
          const preview = (msg?.subject ?? msg?.body.trim().split('\n')[0] ?? '').replace(/\*\*|`/g, '');
          toast({ tone: 'signal', title: `Message — ${event.payload.from}`, body: preview, action: 'comms' });
          play('message');
          break;
        }
        case 'host.discovered': {
          const h = engine.state.world.hosts[event.payload.hostId];
          toast({ tone: 'signal', title: 'Hôte découvert', body: `${h?.hostname ?? '?'} · ${event.payload.ip}` });
          play('discover');
          break;
        }
        case 'finding.confirmed':
          play('finding');
          break;
        case 'finding.rejected':
        case 'command.unknown':
        case 'auth.failed':
          play('error');
          break;
      }
    });
  };

  const start = (mission: MissionSpec, journal: JournalState, campaign: CampaignState, mode: Mode = 'campagne') => {
    const engine = Engine.fromMission(mission, concepts, journal, campaign, dossier);
    attach(engine);
    set((s) => ({
      engine,
      mode,
      screen: 'operator',
      view: 'terminal',
      scrollback: [banner(engine)],
      modal: 'briefing',
      openConcept: null,
      commsOpen: false,
      rev: s.rev + 1,
    }));
    scheduleSave();
  };

  return {
    screen: 'menu',
    mode: 'campagne',
    bancDone: [],
    view: 'terminal',
    journalSelection: null,
    engine: null,
    rev: 0,
    scrollback: [],
    draft: '',
    toasts: [],
    modal: null,
    openConcept: null,
    commsOpen: false,
    hasSave: false,
    saveSummary: null,
    lastSavedAt: null,

    async init() {
      const [file, journalFile] = await Promise.all([loadSave(), loadJournal()]);
      if (journalFile) {
        carriedJournal = journalFile.journal;
        set({ bancDone: journalFile.bancDone });
      }
      if (!file) return;
      if (!journalFile) carriedJournal = file.save.journal;
      const mission = getMission(file.missionId);
      const done = file.save.mission?.completed.length ?? 0;
      const total = mission?.objectives.filter((o) => !o.optional).length ?? 0;
      set({
        hasSave: true,
        saveSummary: mission
          ? `${mission.title} · ${Math.min(100, Math.round((done / Math.max(total, 1)) * 100))} %`
          : null,
      });
    },

    newGame() {
      const first = campaignOrder(missions)[0];
      if (!first) throw new Error('aucune mission dans /content/missions');
      // The learning journal survives a new game (knowledge is the player's); the campaign restarts.
      const journal = get().engine?.journal ?? carriedJournal;
      start(first, structuredClone(journal), newCampaign());
    },

    upcoming() {
      const { engine, mode } = get();
      return engine && mode === 'campagne' ? nextMission(missions, engine.campaign) : undefined;
    },

    openBanc() {
      const { engine, mode } = get();
      if (engine) {
        void get().save();
        carriedJournal = engine.journal;
      }
      set({
        screen: 'banc',
        modal: null,
        openConcept: null,
        commsOpen: false,
        toasts: [],
        ...(mode === 'banc' ? { engine: null } : {}),
      });
    },

    startBanc(missionId) {
      const mission = getMission(missionId);
      if (!mission) return;
      const journal = get().engine?.journal ?? carriedJournal;
      // A throwaway campaign: Banc decisions and completions never reach the real one.
      start(mission, structuredClone(journal), newCampaign(), 'banc');
    },

    startSandbox(seed, level) {
      const { mission } = generateSandbox(seed, level);
      const journal = get().engine?.journal ?? carriedJournal;
      start(mission, structuredClone(journal), newCampaign(), 'banc');
    },

    nextOperation() {
      const engine = get().engine;
      const next = get().upcoming();
      if (!engine || !next) return;
      start(next, structuredClone(engine.journal), structuredClone(engine.campaign));
    },

    choose(choiceId, optionId) {
      const engine = get().engine;
      const choice = engine?.mission?.pendingChoice();
      const option = choice?.options.find((o) => o.id === optionId);
      if (!engine || !option || !engine.choose(choiceId, optionId)) return;
      const fmt = (label: string, v: number) => (v ? `${label} ${v > 0 ? '+' : ''}${v}` : '');
      const effects = [fmt('Intégrité', option.effects.integrity), fmt('Initiative', option.effects.initiative)]
        .filter(Boolean)
        .join(' · ');
      toast({ tone: 'echo', title: `Décision : ${option.label}`, body: effects || undefined });
      if (get().mode === 'campagne') {
        // The ending is fixed by the closing decision, with the Dossier as it stands at that moment.
        const score = solidity(dossier, dossierProgressOf(engine.campaign), engine.dossierContext()).score;
        const ending = computeEnding(endings, { campaign: engine.campaign, solidity: score });
        if (ending) engine.campaign.ending = ending.id;
      }
      const done = engine.mission?.progress.status === 'completed';
      if (done) debriefShown = engine;
      set((s) => ({ modal: done ? 'debrief' : null, rev: s.rev + 1 }));
      scheduleSave();
    },

    showEnding() {
      if (!get().engine?.campaign.ending) return;
      void get().save();
      set({ screen: 'ending', modal: null, openConcept: null, commsOpen: false, toasts: [] });
    },

    async continueGame() {
      const file = await loadSave();
      if (!file) return get().newGame();
      try {
        // The standalone journal is the freshest (it also records Banc progress).
        const journal = (await loadJournal())?.journal ?? file.save.journal;
        const engine = Engine.restore({ ...file.save, journal }, getMission(file.missionId), concepts, dossier);
        attach(engine);
        nextId = Math.max(nextId, ...file.scrollback.map((e) => e.id + 1));
        set({
          engine,
          mode: 'campagne',
          screen: 'operator',
          scrollback: [...file.scrollback, banner(engine)],
          modal: null,
          lastSavedAt: file.savedAt,
          rev: get().rev + 1,
        });
      } catch (e) {
        console.error(e);
        await deleteSave();
        toast({ tone: 'warn', title: 'Sauvegarde illisible', body: 'Une nouvelle opération commence.' });
        get().newGame();
      }
    },

    toMenu() {
      void get().save();
      // Leaving a Banc exercise drops it: « Continuer » must resume the campaign save.
      const leaveBanc = get().mode === 'banc' ? { engine: null, mode: 'campagne' as const } : {};
      set({
        screen: 'menu',
        view: 'terminal',
        modal: null,
        openConcept: null,
        commsOpen: false,
        toasts: [],
        ...leaveBanc,
      });
      void get().init();
    },

    run(input) {
      const engine = get().engine;
      if (!engine) return;
      const pending = engine.pendingPrompt();
      const prompt: Line = pending ? [{ t: pending.label, s: 'muted' }] : engine.prompt();
      const shownInput = pending?.secret ? '' : input;
      const result = engine.execute(input);
      const entry: TermEntry = { id: nextId++, prompt, input: shownInput, lines: result.lines };
      set((s) => ({
        scrollback: result.clear ? [] : [...s.scrollback, entry].slice(-MAX_SCROLLBACK),
        draft: '',
        rev: s.rev + 1,
      }));
      flushConcepts();
      scheduleSave();
    },

    interrupt() {
      const engine = get().engine;
      if (!engine) return;
      const pending = engine.pendingPrompt();
      engine.cancelPending();
      const prompt: Line = pending ? [{ t: pending.label, s: 'muted' }] : engine.prompt();
      set((s) => ({
        scrollback: [
          ...s.scrollback,
          { id: nextId++, prompt, input: `${pending?.secret ? '' : s.draft}^C`, lines: [] },
        ],
        draft: '',
        rev: s.rev + 1,
      }));
    },

    setDraft: (draft) => set({ draft }),
    setModal: (modal) => set({ modal }),

    showConcept(id) {
      const engine = get().engine;
      if (id && engine) engine.study(id);
      set((s) => ({ openConcept: id, commsOpen: id ? false : s.commsOpen, rev: s.rev + 1 }));
      if (id) scheduleSave();
    },

    setComms: (commsOpen) => set({ commsOpen, openConcept: null }),

    setView: (view) => set({ view, openConcept: null, commsOpen: false }),

    openInJournal(id) {
      get().engine?.study(id);
      set((s) => ({ view: 'journal', journalSelection: id, openConcept: null, commsOpen: false, rev: s.rev + 1 }));
      scheduleSave();
    },

    linkDossier(a, b, relation) {
      const engine = get().engine;
      if (!engine) return null;
      const result = engine.linkDossier(a, b, relation);
      set((s) => ({ rev: s.rev + 1 }));
      scheduleSave();
      return result;
    },

    passQuiz(id) {
      const engine = get().engine;
      if (!engine) return;
      engine.passQuiz(id);
      const c = engine.concepts.get(id);
      toast({ tone: 'trace', title: 'Fiche validée', body: c ? `${c.title} — maîtrise 3/3` : undefined });
      set((s) => ({ rev: s.rev + 1 }));
      scheduleSave();
    },

    markMessagesRead() {
      const mission = get().engine?.mission;
      if (!mission || mission.unreadCount() === 0) return;
      mission.markRead();
      set((s) => ({ rev: s.rev + 1 }));
      scheduleSave();
    },

    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    async save() {
      const { engine, scrollback, mode } = get();
      if (!engine?.mission) return;
      const bancDone =
        mode === 'banc' && engine.mission.progress.status === 'completed'
          ? [...new Set([...get().bancDone, engine.mission.spec.id])]
          : get().bancDone;
      await writeJournal({ journal: engine.journal, bancDone });
      carriedJournal = engine.journal;
      if (bancDone !== get().bancDone) set({ bancDone });
      if (mode === 'banc') return;
      const file: SaveFile = {
        missionId: engine.mission.spec.id,
        save: engine.snapshot(),
        scrollback,
        savedAt: Date.now(),
      };
      if (await writeSave(file)) set({ lastSavedAt: file.savedAt, hasSave: true });
    },
  };
});
