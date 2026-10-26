import type { SaveData } from '@echotrace/engine';
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
