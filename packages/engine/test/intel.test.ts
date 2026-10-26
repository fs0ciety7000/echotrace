import { describe, expect, it } from 'vitest';
import { parseMission } from '../src/content/parse.ts';
import { Engine } from '../src/engine.ts';
import { text } from './helpers.ts';

const mission = parseMission(`
id: test-intel
title: Test
act: banc
summary: s
question: q
briefing: b
debrief: d
scenario:
  start: { host: ws, user: op }
  networks: [{ id: net, cidr: 203.0.113.0/24 }]
  hosts:
    - { id: ws, hostname: ws, ip: 203.0.113.2, networks: [net], accounts: [{ user: op }] }
    - { id: vpn, hostname: vpn.cible.example, ip: 203.0.113.12, networks: [net] }
  domains:
    - name: cible.example
      nameservers: [ns1.cible.example]
      axfr: true
      records:
        - { name: '@', type: A, value: 203.0.113.10 }
        - { name: vpn, type: A, value: 203.0.113.12 }
        - { name: www, type: CNAME, value: cible.example }
        - { name: '@', type: MX, value: 10 mail.cible.example }
    - name: autre.example
      records: [{ name: '@', type: A, value: 203.0.113.30 }]
objectives:
  - { id: o, label: l, on: dns.axfr, where: { domain: cible.example } }
`);

const engine = () => Engine.fromMission(mission, []);

describe('intel tools', () => {
  it('summarises whois data', () => {
    const out = text(engine().execute('whois cible.example'));
    expect(out).toContain('ns1.cible.example');
    expect(text(engine().execute('whois nope.example'))).toContain('Aucun enregistrement');
  });

  it('resolves names, aliases and missing names', () => {
    const e = engine();
    expect(text(e.execute('dns vpn.cible.example'))).toContain('203.0.113.12');
    expect(e.state.knowledge.vpn?.discovered).toBe(true);
    expect(text(e.execute('dns www.cible.example'))).toContain('CNAME');
    expect(text(e.execute('dns cible.example MX'))).toContain('mail.cible.example');
    expect(text(e.execute('dns ghost.cible.example'))).toContain("n'existe pas");
  });

  it('audits zone listing and completes objectives', () => {
    const e = engine();
    expect(text(e.execute('dns audit cible.example'))).toContain('Mauvaise configuration');
    expect(e.mission?.progress.status).toBe('completed');
    expect(text(e.execute('dns audit autre.example'))).toContain('refusent');
  });
});
