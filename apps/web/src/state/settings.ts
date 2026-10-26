import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  legible: boolean;
  reducedMotion: boolean;
  setLegible: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
}

/** Small, synchronous (localStorage) so the theme applies before first paint. */
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      legible: false,
      reducedMotion: false,
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
