import type { Engine } from '../engine.ts';
import { danger, line, lineText } from '../output.ts';
import type { Line } from '../types.ts';
import { getNode } from '../vfs.ts';

export interface InputText {
  /** Text lines from the files (concatenated) or from stdin. */
  lines: string[];
  /** Error lines to print first (missing files…). */
  errors: Line[];
}

/**
 * Reads the files named on the command line, or stdin when there are none —
 * the Unix filter convention shared by grep, head, sort, uniq…
 */
export function readInput(engine: Engine, cmd: string, files: string[], stdin: Line[] | null): InputText {
  if (files.length === 0) return { lines: (stdin ?? []).map(lineText), errors: [] };
  const out: InputText = { lines: [], errors: [] };
  for (const f of files) {
    const target = engine.resolve(f);
    const node = getNode(engine.host().fs, target);
    if (!node) out.errors.push(line(danger(`${cmd}: ${f}: No such file or directory`)));
    else if (node.kind === 'dir') out.errors.push(line(danger(`${cmd}: ${f}: Is a directory`)));
    else {
      out.lines.push(...node.content.replace(/\n$/, '').split('\n'));
      engine.emit('file.read', { hostId: engine.host().id, path: target });
    }
  }
  return out;
}

export const plainLines = (lines: string[]): Line[] => lines.map((t) => [{ t }]);
