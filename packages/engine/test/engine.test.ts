import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.ts';
import { newPrologue, text } from './helpers.ts';

describe('shell basics', () => {
  it('starts in the home directory with a prompt', () => {
    const e = newPrologue();
    expect(e.state.session.cwd).toBe('/home/operateur-7');
    expect(
      e
        .prompt()
        .map((s) => s.t)
        .join(''),
    ).toBe('operateur-7@echo-ws:~$ ');
  });

  it('navigates the filesystem', () => {
    const e = newPrologue();
    expect(text(e.execute('ls'))).toContain('bienvenue.txt');
    expect(text(e.execute('ls'))).not.toContain('.historique-iris');
    expect(text(e.execute('ls -a'))).toContain('.historique-iris');
    e.execute('cd notes');
    expect(text(e.execute('pwd'))).toBe('/home/operateur-7/notes');
    e.execute('cd ..');
    expect(e.state.session.cwd).toBe('/home/operateur-7');
    expect(text(e.execute('cat nope.txt'))).toContain('No such file');
  });

  it('pipes output into grep', () => {
    const e = newPrologue();
    const out = text(e.execute('cat notes/banc.txt | grep -i compte'));
    expect(out.split('\n')).toHaveLength(2);
  });

  it('reports unknown commands', () => {
    expect(text(newPrologue().execute('hackthegibson'))).toContain('commande introuvable');
  });

  it('completes commands and paths', () => {
    const e = newPrologue();
    expect(e.complete('nm').input).toBe('nmap ');
    expect(e.complete('cat bien').input).toBe('cat bienvenue.txt ');
    expect(e.complete('cat notes/b').input).toBe('cat notes/banc.txt ');
    expect(e.complete('cat notes/').options).toEqual(['notes/banc.txt', 'notes/doctrine.txt']);
  });

  it('keeps passwords out of history', () => {
    const e = newPrologue();
    e.execute('ssh stagiaire@banc-01');
    expect(e.pendingPrompt()?.secret).toBe(true);
    e.execute('echo-banc-2031');
    expect(e.state.session.history).toEqual(['ssh stagiaire@banc-01']);
    expect(e.state.session.hostId).toBe('banc-01');
  });
});

describe('network simulation', () => {
  it('pings reachable hosts and not filtered ones', () => {
    const e = newPrologue();
    expect(text(e.execute('ping -c 2 banc-01'))).toContain('0% packet loss');
    expect(text(e.execute('ping iris-ws'))).toContain('100% packet loss');
  });

  it('needs -Pn for hosts that drop ICMP', () => {
    const e = newPrologue();
    expect(text(e.execute('nmap 10.7.0.66'))).toContain('Host seems down');
    const out = text(e.execute('nmap -Pn 10.7.0.66'));
    expect(out).toContain('9001/tcp');
    expect(e.state.knowledge['iris-ws']?.discovered).toBe(true);
  });

  it('sweeps a CIDR range', () => {
    const out = text(newPrologue().execute('nmap -sn 10.7.1.0/24'));
    expect(out).toContain('banc-01');
    expect(out).toContain('banc-02');
    expect(out).toContain('(2 hosts up)');
  });

  it('fingerprints versions and raises exposure', () => {
    const e = newPrologue();
    const out = text(e.execute('nmap -sV banc-01'));
    expect(out).toContain('OpenSSH 9.2p1');
    expect(out).toContain('filtered');
    expect(e.state.exposure).toBeGreaterThan(0);
  });

  it('rejects wrong ssh passwords three times', () => {
    const e = newPrologue();
    e.execute('ssh stagiaire@banc-01');
    expect(text(e.execute('bad'))).toContain('try again');
    e.execute('bad');
    expect(text(e.execute('bad'))).toContain('Permission denied (publickey,password)');
    expect(e.pendingPrompt()).toBeNull();
    expect(e.state.session.hostId).toBe('echo-ws');
  });
});

describe('save / restore', () => {
  it('round-trips through a snapshot', () => {
    const e = newPrologue();
    e.execute('ls');
    e.execute('cd notes');
    const save = JSON.parse(JSON.stringify(e.snapshot()));
    const restored = Engine.restore(save, e.mission?.spec, [...e.concepts.values()]);
    expect(restored.state.session.cwd).toBe('/home/operateur-7/notes');
    expect(restored.mission?.progress.completed).toEqual(['list-home']);
    expect(Object.keys(restored.journal)).toContain('systeme.fichiers');
  });
});

describe('text pipelines', () => {
  it('counts and ranks values with sort | uniq -c | sort -rn', () => {
    const e = newPrologue();
    e.execute('ssh stagiaire@banc-01');
    e.execute('echo-banc-2031');
    expect(text(e.execute('grep Failed /var/log/auth.log | wc -l'))).toBe('2');
    const ranked = text(
      e.execute('grep sshd /var/log/auth.log | cut -d " " -f 3 | sort | uniq -c | sort -rn | head -n 1'),
    );
    expect(ranked.trim()).toMatch(/^\d+ \S+/);
    expect(text(e.execute('tail -n 1 /var/log/auth.log'))).toContain('CRON');
  });
});
