import type { VfsDir, VfsNode } from './types.ts';

/** Normalises `target` against `cwd`, resolving `.`, `..` and `~`. */
export function resolvePath(cwd: string, target: string, home = '/'): string {
  let raw = target;
  if (raw === '~' || raw.startsWith('~/')) raw = home + raw.slice(1);
  const absolute = raw.startsWith('/') ? raw : `${cwd}/${raw}`;
  const parts: string[] = [];
  for (const part of absolute.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

export function getNode(root: VfsDir, absPath: string): VfsNode | undefined {
  let node: VfsNode = root;
  for (const part of absPath.split('/').filter(Boolean)) {
    if (node.kind !== 'dir') return undefined;
    const next: VfsNode | undefined = node.children[part];
    if (!next) return undefined;
    node = next;
  }
  return node;
}

export function dirname(absPath: string): string {
  const idx = absPath.lastIndexOf('/');
  return idx <= 0 ? '/' : absPath.slice(0, idx);
}

export function basename(absPath: string): string {
  return absPath.slice(absPath.lastIndexOf('/') + 1);
}

/** Builds a tree from a flat `path → content` map. Paths ending with `/` create empty dirs. */
export function buildFs(files: Record<string, string>): VfsDir {
  const root: VfsDir = { kind: 'dir', children: {} };
  for (const [rawPath, content] of Object.entries(files)) {
    const isDir = rawPath.endsWith('/');
    const parts = rawPath.split('/').filter(Boolean);
    let dir = root;
    parts.forEach((part, i) => {
      const last = i === parts.length - 1;
      if (last && !isDir) {
        dir.children[part] = { kind: 'file', content };
        return;
      }
      let next = dir.children[part];
      if (next?.kind !== 'dir') {
        next = { kind: 'dir', children: {} };
        dir.children[part] = next;
      }
      dir = next;
    });
  }
  return root;
}

/** Ensures a directory exists (used for home directories). */
export function ensureDir(root: VfsDir, absPath: string): VfsDir {
  let dir = root;
  for (const part of absPath.split('/').filter(Boolean)) {
    let next = dir.children[part];
    if (next?.kind !== 'dir') {
      next = { kind: 'dir', children: {} };
      dir.children[part] = next;
    }
    dir = next;
  }
  return dir;
}

export function listDir(dir: VfsDir, includeHidden = false): [string, VfsNode][] {
  return Object.entries(dir.children)
    .filter(([name]) => includeHidden || !name.startsWith('.'))
    .sort(([a], [b]) => a.localeCompare(b));
}
