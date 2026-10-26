import type { Engine } from '../engine.ts';
import type { Line } from '../types.ts';

export type CommandCategory = 'base' | 'fichiers' | 'reseau' | 'acces' | 'echo';

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  base: 'Base',
  fichiers: 'Fichiers',
  reseau: 'Réseau',
  acces: 'Accès distant',
  echo: 'ECHO (outils de la cellule)',
};

export type CompletionKind = 'path' | 'host' | 'command' | 'concept';

export interface CommandContext {
  /** Arguments, without the command name. */
  argv: string[];
  /** Output of the previous pipeline stage, `null` when not piped. */
  stdin: Line[] | null;
  engine: Engine;
}

export interface CommandOutput {
  lines: Line[];
  /** Clears the terminal scrollback before printing. */
  clear?: boolean;
}

export interface Command {
  name: string;
  aliases?: string[];
  category: CommandCategory;
  /** One-line French summary shown by `help`. */
  summary: string;
  /** Synopsis, e.g. `nmap [-sV] [-Pn] <cible>`. */
  usage: string;
  /** Longer explanation shown by `man`. */
  description?: string;
  examples?: string[];
  /** Concepts the command exercises; emitted on each use. */
  concepts?: string[];
  complete?: CompletionKind;
  /** Hidden from `help` (easter eggs, aliases). */
  hidden?: boolean;
  run(ctx: CommandContext): Line[] | CommandOutput;
}

export class CommandRegistry {
  private byName = new Map<string, Command>();
  private primary: Command[] = [];

  register(...commands: Command[]): this {
    for (const c of commands) {
      this.primary.push(c);
      this.byName.set(c.name, c);
      for (const a of c.aliases ?? []) this.byName.set(a, c);
    }
    return this;
  }

  get(name: string): Command | undefined {
    return this.byName.get(name);
  }

  all(): Command[] {
    return [...this.primary];
  }

  names(): string[] {
    return [...this.byName.keys()].sort();
  }
}
