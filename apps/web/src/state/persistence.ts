import type { JournalState, SaveData } from '@echotrace/engine';
import { del, get, set } from 'idb-keyval';
import type { TermEntry } from './game.ts';

export interface SaveFile {
  missionId: string;
  save: SaveData;
  scrollback: TermEntry[];
  savedAt: number;
}

const KEY = 'echotrace:save:1';
const SCROLLBACK_SAVED = 200;

export async function loadSave(): Promise<SaveFile | undefined> {
  try {
    return await get<SaveFile>(KEY);
  } catch {
    return undefined; // IndexedDB unavailable (private mode…) — play without saves.
  }
}

export async function writeSave(file: SaveFile): Promise<boolean> {
  try {
    await set(KEY, { ...file, scrollback: file.scrollback.slice(-SCROLLBACK_SAVED) });
    return true;
  } catch {
    return false;
  }
}

export async function deleteSave(): Promise<void> {
  try {
    await del(KEY);
  } catch {
    /* nothing to delete */
  }
}

/**
 * The learning journal lives in its own entry: it is the player's knowledge,
 * shared by the campaign and the Banc (which never touches the campaign save).
 */
export interface JournalFile {
  journal: JournalState;
  /** Banc modules completed at least once. */
  bancDone: string[];
}

const JOURNAL_KEY = 'echotrace:journal:1';

export async function loadJournal(): Promise<JournalFile | undefined> {
  try {
    return await get<JournalFile>(JOURNAL_KEY);
  } catch {
    return undefined;
  }
}

export async function writeJournal(file: JournalFile): Promise<void> {
  try {
    await set(JOURNAL_KEY, file);
  } catch {
    /* best effort */
  }
}
