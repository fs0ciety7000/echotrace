import { useSettings } from '../state/settings.ts';

/**
 * Interface sound cues, synthesized with Web Audio (no audio files: nothing to download,
 * works offline, nothing for the CSP to allow). Short, quiet, never looping — sound only
 * echoes what is already shown on screen.
 */

export type Cue = 'key' | 'objective' | 'mission' | 'message' | 'choice' | 'finding' | 'error' | 'link' | 'discover';

interface Note {
  /** Hz. */
  f: number;
  /** Start offset and length, in seconds. */
  at: number;
  len: number;
  type?: OscillatorType;
  /** Relative loudness (0–1). */
  gain?: number;
}

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12);

const CUES: Record<Exclude<Cue, 'key'>, Note[]> = {
  objective: [
    { f: NOTE(76), at: 0, len: 0.12, type: 'sine' },
    { f: NOTE(83), at: 0.09, len: 0.22, type: 'sine' },
  ],
  mission: [72, 76, 79, 84].map((n, i) => ({
    f: NOTE(n),
    at: i * 0.11,
    len: 0.35,
    type: 'triangle' as const,
    gain: 0.8,
  })),
  message: [
    { f: NOTE(81), at: 0, len: 0.4, type: 'triangle', gain: 0.6 },
    { f: NOTE(88), at: 0.07, len: 0.3, type: 'sine', gain: 0.3 },
  ],
  choice: [
    { f: NOTE(53), at: 0, len: 0.6, type: 'sine' },
    { f: NOTE(60), at: 0.15, len: 0.6, type: 'sine', gain: 0.7 },
  ],
  finding: [{ f: NOTE(84), at: 0, len: 0.1, type: 'sine', gain: 0.6 }],
  error: [{ f: 150, at: 0, len: 0.14, type: 'square', gain: 0.25 }],
  // An echo: the same note, repeated softer.
  link: [0, 0.16, 0.32].map((at, i) => ({ f: NOTE(79), at, len: 0.18, type: 'sine' as const, gain: 0.7 / (i + 1) })),
  discover: [{ f: NOTE(91), at: 0, len: 0.06, type: 'sine', gain: 0.4 }],
};

let ctx: AudioContext | null = null;
/** Bursts of the same event (a sweep discovering ten hosts) play as one cue. */
const lastPlayed = new Map<Cue, number>();

function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  // Browsers start the context suspended until a user gesture; every cue follows one.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function play(cue: Cue) {
  const { sound, volume, keySounds } = useSettings.getState();
  if (!sound || volume <= 0 || (cue === 'key' && !keySounds)) return;
  const ac = context();
  if (!ac) return;
  const t0 = ac.currentTime + 0.005;
  if (cue !== 'key' && t0 - (lastPlayed.get(cue) ?? -1) < 0.12) return;
  lastPlayed.set(cue, t0);
  const master = ac.createGain();
  master.gain.value = (volume / 100) * 0.22;
  master.connect(ac.destination);

  if (cue === 'key') {
    // A short filtered noise burst: a soft mechanical tick.
    const len = 0.018;
    const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2400;
    src.buffer = buffer;
    src.connect(filter).connect(master);
    master.gain.value *= 0.5;
    src.start(t0);
    return;
  }

  for (const n of CUES[cue]) {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.f;
    const start = t0 + n.at;
    const peak = n.gain ?? 1;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(peak, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + n.len);
    osc.connect(env).connect(master);
    osc.start(start);
    osc.stop(start + n.len + 0.02);
  }
}
