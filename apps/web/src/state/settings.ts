import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  legible: boolean;
  reducedMotion: boolean;
  /** Interface sound cues (Web Audio). */
  sound: boolean;
  /** 0–100. */
  volume: number;
  /** Soft tick on each keystroke in the terminal. */
  keySounds: boolean;
  setSound: (v: boolean) => void;
  setVolume: (v: number) => void;
  setKeySounds: (v: boolean) => void;
  setLegible: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

/** Small, synchronous (localStorage) so the theme applies before first paint. */
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      legible: false,
      reducedMotion: false,
      sound: true,
      volume: 60,
      keySounds: false,
      setSound: (sound) => set({ sound }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, Math.round(volume))) }),
      setKeySounds: (keySounds) => set({ keySounds }),
      setLegible: (legible) => set({ legible }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    { name: 'echotrace:settings' },
  ),
);

export function applySettings({ legible, reducedMotion }: Pick<Settings, 'legible' | 'reducedMotion'>) {
  const root = document.documentElement;
  root.dataset.theme = legible ? 'legible' : 'signal';
  root.dataset.motion = reducedMotion ? 'reduced' : 'full';
}
