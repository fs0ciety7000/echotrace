import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.ts';
import type { GameEvent } from '../src/events.ts';
import { newPrologue, text } from './helpers.ts';

describe('mission messages', () => {
  it('delivers start messages silently and unread', () => {
    const e = newPrologue();
    expect(e.mission?.inbox().map((m) => m.id)).toEqual(['mara-welcome']);
    expect(e.mission?.unreadCount()).toBe(1);
  });

  it('delivers messages when their objective completes, once', () => {
    const e = newPrologue();
    const received: GameEvent[] = [];
    e.bus.on((ev) => ev.type === 'message.received' && received.push(ev));
    for (const c of ['ls', 'cat bienvenue.txt', 'ifconfig', 'ping banc-01', 'ping banc-01']) e.execute(c);
    expect(received.map((ev) => ev.payload)).toEqual([
      { missionId: 'prologue', messageId: 'noor-ping', from: 'Noor Haddad' },
    ]);
  });

  it('reads messages through the mail command', () => {
    const e = newPrologue();
    expect(text(e.execute('mail'))).toContain('Mara Okonkwo-Lind');
    expect(text(e.execute('mail 1'))).toContain('tu ne sors pas du Banc');
    expect(e.mission?.unreadCount()).toBe(0);
    expect(text(e.execute('mail 9'))).toContain('Pas de message');
  });

  it('keeps the inbox across save/restore and upgrades old saves', () => {
    const e = newPrologue();
    const save = JSON.parse(JSON.stringify(e.snapshot()));
    expect(Engine.restore(save, e.mission?.spec, []).mission?.inbox()).toHaveLength(1);

    // Saves from before messages existed have no inbox and a started mission.
    save.mission.inbox = undefined;
    save.mission.completed = ['list-home'];
    const old = Engine.restore(save, e.mission?.spec, []);
    expect(old.mission?.inbox()).toEqual([]);
  });
});
