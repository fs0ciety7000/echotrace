import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { CampaignState } from '../src/campaign.ts';
import { computeEnding, parseEndings } from '../src/endings.ts';
import { Engine } from '../src/engine.ts';
import { concepts, loadMission, text } from './helpers.ts';

function play(file: string, commands: string[], campaign?: CampaignState) {
  const e = Engine.fromMission(loadMission(file), concepts, {}, campaign);
  const outputs = commands.map((c) => text(e.execute(c)));
  return { e, outputs };
}

const campaignAfter = (decisions: Record<string, string> = {}): CampaignState => ({
  completed: ['prologue', 'vallon', 'confinement', 'resonance', 'hamecon', 'kestrel', 'silence'],
  integrity: 60,
  initiative: 55,
  decisions,
});

describe('acte 3 — 07 frequence', () => {
  const SOLUTION = [
    'cat indicateurs/ioc-echo.txt',
    'cat partage-energie/LISEZMOI.txt',
    'grep 203.0.113.200 partage-energie/op-a.csv partage-energie/op-b.csv partage-energie/rev.csv',
    'report operateur REV',
    'report machine 10.50.0.40',
    'grep dns-relais partage-energie/op-a.csv',
    'report faux-positif op-a',
    'cat osint/avis-maintenance-grid.txt',
    'report date 2031-05-11',
  ];

  it('is solvable end to end', () => {
    const { e, outputs } = play('07-frequence.yaml', SOLUTION, campaignAfter({ 'silence/zero': 'seul' }));
    expect(outputs[2]).toContain('rev.csv');
    expect(outputs[2]).not.toContain('op-a.csv');
    expect(e.choose('alerte', 'coordonner')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.inbox().some((m) => m.id === 'iris-onze')).toBe(true);
    expect(e.mission?.inbox().some((m) => m.id === 'mara-onze')).toBe(false);
  });
});

describe('acte 3 — 08 salle de contrôle', () => {
  const SOLUTION = [
    'cat dossiers/rev/architecture.txt',
    'cat dossiers/rev/acces.txt',
    'ssh echo@rev-bastion.rev.internal',
    'rev-bastion-10',
    'ssh admin-echo@passerelle-histo.rev.internal',
    'rev-histo-10',
    'ifconfig',
    'report pont passerelle-histo',
    'exit',
    'ssh audit@ews-02.rev.internal',
    'rev-ews-lecture',
    'ps aux',
    'report chant ews-02',
    'exit',
    'ssh admin-echo@passerelle-histo.rev.internal',
    'rev-histo-10',
    'netstat -tunap',
    'fw block 203.0.113.200',
    'cat /var/log/telemaint.log',
    'report compte cg-maint',
  ];

  it('is solvable end to end; the optional block is available after the decision', () => {
    const { e, outputs } = play('08-salle-de-controle.yaml', SOLUTION, campaignAfter());
    expect(outputs[6]).toContain('10.60.0.40');
    expect(outputs[11]).toContain('sysupd');
    expect(outputs[16]).toContain('203.0.113.200:8443');
    expect(e.choose('prestataire', 'rssi')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    e.execute('fw block 198.51.100.160/28');
    expect(e.mission?.progress.completed).toContain('bloquer-prestataire');
  });

  it('the audit account on the engineering station cannot change the firewall', () => {
    const { outputs } = play('08-salle-de-controle.yaml', [
      ...SOLUTION.slice(0, 4),
      ...SOLUTION.slice(9, 11),
      'fw block 203.0.113.200',
    ]);
    expect(outputs.at(-1)).toContain('droits insuffisants');
  });
});

describe('acte 3 — 09 silence radio', () => {
  it('is solvable end to end', () => {
    const { e } = play(
      '09-radio.yaml',
      [
        'cat rapport/demande-ancs.txt',
        'cat rapport/brouillon.md',
        'dossier',
        'report pivot 203.0.113.200',
        'report irrecevable 4',
        'report hypothese 5',
      ],
      campaignAfter({ 'silence/zero': 'mara' }),
    );
    expect(e.mission?.inbox().some((m) => m.id === 'iris-mara')).toBe(true);
    expect(e.choose('destination', 'justice')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.campaign.decisions['radio/destination']).toBe('justice');
  });
});

describe('fins', () => {
  const spec = parseEndings(readFileSync(resolve(import.meta.dirname, '../../../content/fins.yaml'), 'utf8'));
  const end = (destination: string | undefined, integrity: number, solidity: number) =>
    computeEnding(spec, {
      campaign: { ...campaignAfter(destination ? { 'radio/destination': destination } : {}), integrity },
      solidity,
    })?.id;

  it('is undecided until the closing decision', () => {
    expect(end(undefined, 80, 90)).toBeUndefined();
  });
  it('shadow always leads to silence', () => {
    expect(end('ombre', 90, 100)).toBe('silence');
  });
  it('a weak dossier is noise, whatever the destination', () => {
    expect(end('justice', 90, 30)).toBe('bruit');
    expect(end('publier', 90, 30)).toBe('bruit');
  });
  it('justice with integrity brings light; publication brings echo', () => {
    expect(end('justice', 70, 60)).toBe('lumiere');
    expect(end('publier', 70, 60)).toBe('echo');
  });
  it('justice without integrity falls back to noise', () => {
    expect(end('justice', 40, 80)).toBe('bruit');
  });
});
