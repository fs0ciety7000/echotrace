import { describe, expect, it } from 'vitest';
import { parseMission } from '../src/content/parse.ts';
import { Engine } from '../src/engine.ts';
import { text } from './helpers.ts';

const mission = parseMission(`
id: test-defense
title: Test
act: banc
summary: s
question: q
briefing: b
debrief: d
scenario:
  start: { host: srv, user: admin }
  networks: [{ id: net, cidr: 10.7.0.0/24 }]
  hosts:
    - id: srv
      hostname: srv
      ip: 10.7.0.9
      networks: [net]
      accounts: [{ user: admin }, { user: guest }]
      connections:
        - { local: '0.0.0.0:25', state: LISTEN }
        - { local: '10.7.0.9:25', remote: '203.0.113.66:40112' }
        - { local: '10.7.0.9:25', remote: '198.51.100.5:51000' }
      documents:
        /home/admin/note.odt: { author: m.durand, lastModifiedBy: i.calder, created: '2030-11-02', modified: '2030-11-09', software: Bureautique 7 }
      files:
        /home/admin/note.odt: (document)
        /home/admin/plain.txt: texte
        /home/admin/msg.eml: |
          Return-Path: <bounce@relais-envoi.example>
          Received: from mx.echo.lan (mx.echo.lan [10.7.0.25])
          Received: from relais-envoi.example (relais-envoi.example [203.0.113.66])
          Authentication-Results: mx.echo.lan; spf=fail smtp.mailfrom=relais-envoi.example; dkim=none; dmarc=fail header.from=lanterne-presse.example
          From: "Lanterne - Rédaction" <redaction@lanterne-presse.example>
          Reply-To: theo.urgent@boite-perso.example
          Subject: Document confidentiel à relire

          Bonjour, merci de relire <a href="https://lanterne-presse.example/doc">lanterne.example/doc</a> avant ce soir.
objectives:
  - { id: o, label: l, on: firewall.changed, where: { target: 203.0.113.66 } }
`);

describe('defense tools', () => {
  it('mailcheck explains the authentication results and red flags', () => {
    const e = Engine.fromMission(mission, []);
    const out = text(e.execute('mailcheck msg.eml'));
    expect(out).toContain('lanterne-presse.example');
    expect(out).toContain('relais-envoi.example [203.0.113.66]');
    expect(out).toMatch(/DMARC fail/);
    expect(out).toContain('theo.urgent@boite-perso.example');
    expect(out).toContain('« lanterne.example » qui mène en réalité à lanterne-presse.example');
  });

  it('meta shows document properties', () => {
    const e = Engine.fromMission(mission, []);
    expect(text(e.execute('meta note.odt'))).toContain('i.calder');
    expect(text(e.execute('meta plain.txt'))).toContain('aucune métadonnée');
  });

  it('fw blocks a source, hides its connections and refuses overly broad rules', () => {
    const e = Engine.fromMission(mission, []);
    expect(text(e.execute('fw block 0.0.0.0/0'))).toContain('Refusé');
    expect(text(e.execute('fw block 203.0.113.66'))).toContain('1 connexion');
    expect(text(e.execute('netstat'))).not.toContain('203.0.113.66');
    expect(text(e.execute('netstat'))).toContain('198.51.100.5');
    expect(e.mission?.progress.status).toBe('completed');
    expect(text(e.execute('fw list'))).toContain('203.0.113.66');
  });
});
