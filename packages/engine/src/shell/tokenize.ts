export class ParseError extends Error {}

/**
 * Splits a command line into pipeline stages of argv arrays.
 * Supports single/double quotes, backslash escapes and `|`.
 *
 *   tokenize(`cat "a b.txt" | grep -i x`) → [["cat","a b.txt"],["grep","-i","x"]]
 */
export function tokenize(input: string): string[][] {
  const stages: string[][] = [[]];
  let current = '';
  let hasToken = false;
  let quote: '"' | "'" | null = null;

  const pushToken = () => {
    if (hasToken) (stages[stages.length - 1] as string[]).push(current);
    current = '';
    hasToken = false;
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i] as string;
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < input.length) current += input[++i];
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
    } else if (ch === '\\' && i + 1 < input.length) {
      current += input[++i];
      hasToken = true;
    } else if (ch === ' ' || ch === '\t') {
      pushToken();
    } else if (ch === '|') {
      pushToken();
      if ((stages[stages.length - 1] as string[]).length === 0) {
        throw new ParseError('erreur de syntaxe près de « | »');
      }
      stages.push([]);
    } else {
      current += ch;
      hasToken = true;
    }
  }
  if (quote) throw new ParseError(`guillemet ${quote} non fermé`);
  pushToken();
  const last = stages[stages.length - 1] as string[];
  if (last.length === 0 && stages.length > 1) throw new ParseError('commande attendue après « | »');
  return stages.filter((s) => s.length > 0);
}

export interface ParsedArgs {
  /** Positional arguments. */
  _: string[];
  /** Flags: `-a` → a:true, `-sV` → s:true,V:true… unless declared as long/valued. */
  flags: Record<string, string | true>;
}

/**
 * Minimal getopt. `valued` lists flags that consume the next argument
 * (e.g. `-p 22`). Long options `--name` / `--name=value` are kept whole.
 * Multi-letter short flags listed in `words` (e.g. `sV`) are kept whole.
 */
export function parseArgs(argv: string[], valued: string[] = [], words: string[] = []): ParsedArgs {
  const out: ParsedArgs = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '--') {
      out._.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith('--') && arg.length > 2) {
      const [name, value] = arg.slice(2).split('=', 2) as [string, string | undefined];
      if (value !== undefined) out.flags[name] = value;
      else if (valued.includes(name) && i + 1 < argv.length) out.flags[name] = argv[++i] as string;
      else out.flags[name] = true;
    } else if (arg.startsWith('-') && arg.length > 1 && !/^-\d/.test(arg)) {
      const body = arg.slice(1);
      if (words.includes(body) || valued.includes(body)) {
        out.flags[body] = valued.includes(body) && i + 1 < argv.length ? (argv[++i] as string) : true;
        continue;
      }
      // getopt: a valued letter takes the rest of the group (`-d,` `-n5`) or the next argument.
      for (let k = 0; k < body.length; k++) {
        const ch = body[k] as string;
        if (!valued.includes(ch)) {
          out.flags[ch] = true;
          continue;
        }
        const rest = body.slice(k + 1);
        if (rest) out.flags[ch] = rest;
        else if (i + 1 < argv.length) out.flags[ch] = argv[++i] as string;
        else out.flags[ch] = true;
        break;
      }
    } else {
      out._.push(arg);
    }
  }
  return out;
}
