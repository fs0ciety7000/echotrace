import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.ts';
import { concepts, loadMission, text } from './helpers.ts';

function play(file: string, commands: string[], engine?: Engine) {
  const e = engine ?? Engine.fromMission(loadMission(file), concepts);
  const outputs = commands.map((c) => text(e.execute(c)));
  return { e, outputs };
}

describe('acte 1 — 01 vallon', () => {
  const SOLUTION = [
    'cat dossiers/ch-vallon/convention.txt',
    'whois ch-vallon.example',
    'dns ch-vallon.example MX',
    'dns audit ch-vallon.example',
    'cat dossiers/ch-vallon/inventaire-dsi.txt',
    'report oubli intranet-old.ch-vallon.example',
    'nmap -sV vpn.ch-vallon.example',
    'curl -I https://vpn.ch-vallon.example',
    'cat veille/bulletin-ancs-2031-017.txt',
    'report entree vpn.ch-vallon.example',
    'report faille cve-2030-41177',
    'nmap -Pn -sV 203.0.113.13',
  ];

  it('is solvable end to end with the optional objective', () => {
    const { e, outputs } = play('01-vallon.yaml', SOLUTION);
    expect(outputs[3]).toContain('intranet-old.ch-vallon.example');
    expect(outputs[7]).toContain('SecuraGate/6.2.1');
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.objectives().every((o) => o.state === 'done')).toBe(true);
    expect(e.campaign.completed).toEqual(['vallon']);
  });

  it('offers the scope choice and moves the gauges', () => {
    const { e } = play('01-vallon.yaml', SOLUTION.slice(0, 4));
    expect(e.mission?.pendingChoice()?.id).toBe('perimetre');
    expect(e.choose('perimetre', 'refuser')).toBe(true);
    expect(e.campaign).toMatchObject({ integrity: 60, initiative: 45 });
    expect(e.campaign.decisions['vallon/perimetre']).toBe('refuser');
    expect(e.choose('perimetre', 'accepter')).toBe(false);
    expect(e.mission?.inbox().some((m) => m.id === 'sable-refuse')).toBe(true);
  });

  it('rejects wrong conclusions without giving the answer', () => {
    const { e, outputs } = play('01-vallon.yaml', [
      'report faille CVE-2031-0412',
      'report entree mail',
      'report nope x',
    ]);
    expect(outputs[0]).toContain('dépend');
    expect(outputs[1]).toContain('pas cohérent');
    expect(outputs[2]).toContain('Pas de question');
    expect(e.mission?.progress.wrongAnswers).toBe(1);
  });
});

describe('acte 1 — 02 confinement', () => {
  const SOLUTION = [
    'cat dossiers/ch-vallon/rapport-dsi.txt',
    'cat dossiers/ch-vallon/acces-ch.txt',
    'ssh echo@bastion.ch-vallon.internal',
    'Vallon-Bastion-31',
    'ssh audit@fs-01.ch-vallon.internal',
    'lecture-seule-0316',
    'ps aux',
    'netstat -tunap',
    'report processus sysupd',
    'report destination 203.0.113.200',
    'report rythme 300',
    'ls /etc/cron.d',
    'cat /etc/cron.d/sysupd',
    'report relance /etc/cron.d/sysupd',
    'cat /srv/partages/direction/organigramme.txt',
  ];

  it('is solvable end to end', () => {
    const { e, outputs } = play('02-confinement.yaml', SOLUTION);
    expect(outputs[6]).toContain('/var/tmp/.cache/sysupd -i 300');
    expect(outputs[7]).toContain('203.0.113.200:8443');
    expect(e.mission?.pendingChoice()?.id).toBe('chant');
    expect(e.choose('chant', 'encadrer')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.objectives().every((o) => o.state === 'done')).toBe(true);
    expect(e.campaign).toMatchObject({ integrity: 55, initiative: 55 });
  });
});

describe('acte 1 — 03 resonance', () => {
  const SOLUTION = [
    'cert edge-sync.example:8443',
    'cat dossiers/acces-intel.txt',
    'ssh veille@echo-intel',
    'archives-lanterne',
    'grep 5B:A9:BC /srv/archives/certificats.csv',
    'report empreinte sso-legacy.corvane.example',
    'exit',
    'whois edge-sync.example',
    'whois corvane.example',
    'report dns dns-relais.example',
    'report organisation Corvane Holdings',
    'report confiance élevé',
    'report confiance modéré',
    'cert sso-legacy.corvane.example',
  ];

  it('is solvable end to end and reacts to the previous decision', () => {
    const campaign = {
      completed: ['prologue', 'vallon', 'confinement'],
      integrity: 55,
      initiative: 55,
      decisions: { 'confinement/chant': 'observer' },
    };
    const e = Engine.fromMission(loadMission('03-resonance.yaml'), concepts, {}, campaign);
    expect(e.mission?.inbox().map((m) => m.id)).toEqual(['sable-start-observer']);
    const { outputs } = play('03-resonance.yaml', SOLUTION, e);
    expect(outputs[0]).toContain('5B:A9:BC');
    expect(outputs[4]).toContain('sso-legacy.corvane.example');
    expect(outputs[11]).toContain('pas cohérent');
    expect(e.choose('dossier', 'ancs')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.objectives().every((o) => o.state === 'done')).toBe(true);
    expect(e.campaign.completed).toContain('resonance');
    expect(e.mission?.inbox().some((m) => m.from === 'inconnu')).toBe(true);
  });
});
