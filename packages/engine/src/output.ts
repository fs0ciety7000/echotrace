import type { Line, Span, SpanStyle } from './types.ts';

/** Small helpers so commands read like prose instead of object literals. */

export const span = (t: string, s?: SpanStyle, ref?: string): Span =>
  ref === undefined ? (s ? { t, s } : { t }) : { t, s: s ?? 'plain', ref };

export const plain = (t: string): Span => ({ t });
export const muted = (t: string): Span => ({ t, s: 'muted' });
export const subtle = (t: string): Span => ({ t, s: 'subtle' });
export const accent = (t: string): Span => ({ t, s: 'accent' });
export const success = (t: string): Span => ({ t, s: 'success' });
export const warning = (t: string): Span => ({ t, s: 'warning' });
export const danger = (t: string): Span => ({ t, s: 'danger' });
export const echo = (t: string): Span => ({ t, s: 'echo' });
export const heading = (t: string): Span => ({ t, s: 'heading' });
export const concept = (label: string, id: string): Span => ({ t: label, s: 'concept', ref: id });
export const path = (t: string, ref = t): Span => ({ t, s: 'path', ref });
export const host = (t: string, ref = t): Span => ({ t, s: 'host', ref });
export const command = (t: string, ref = t): Span => ({ t, s: 'command', ref });

export const line = (...spans: (Span | string)[]): Line => spans.map((s) => (typeof s === 'string' ? { t: s } : s));

export const blank = (): Line => [];

export const text = (t: string, s?: SpanStyle): Line[] => t.split('\n').map((l) => [s ? { t: l, s } : { t: l }]);

export const lineText = (l: Line): string => l.map((s) => s.t).join('');

/**
 * Renders rows into aligned columns. Cells are spans so styling survives;
 * padding is added as plain spans.
 */
export function table(rows: (Span | string)[][], gap = 2): Line[] {
  const cells = rows.map((r) => r.map((c) => (typeof c === 'string' ? { t: c } : c)));
  const widths: number[] = [];
  for (const row of cells) {
    row.forEach((c, i) => {
      widths[i] = Math.max(widths[i] ?? 0, c.t.length);
    });
  }
  return cells.map((row) => {
    const out: Line = [];
    row.forEach((c, i) => {
      out.push(c);
      if (i < row.length - 1) out.push({ t: ' '.repeat((widths[i] ?? 0) - c.t.length + gap) });
    });
    return out;
  });
}
