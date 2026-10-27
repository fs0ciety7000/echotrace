import { describe, expect, it } from 'vitest';
import type { CampaignState } from '../src/campaign.ts';
import { Engine } from '../src/engine.ts';
import { concepts, loadMission, text } from './helpers.ts';

function play(file: string, commands: string[], campaign?: CampaignState) {
  const e = Engine.fromMission(loadMission(file), concepts, {}, campaign);
  const outputs = commands.map((c) => text(e.execute(c)));
  return { e, outputs };
}

const after = (completed: string[], decisions: Record<string, string> = {}): CampaignState => ({
  completed,
  integrity: 60,
  initiative: 55,
  decisions,
});

describe('acte 2 — 04 hamecon', () => {
  it('is solvable end to end', () => {
    const { e, outputs } = play('04-hamecon.yaml', [
      'cat signalements/LISEZMOI.txt',
      'mailcheck signalements/message-0402.eml',
      'mailcheck signalements/reference-theo.eml',
      'report domaine lanterne-presse.example',
      'report dmarc fail',
      'dns _dmarc.lanterne.example TXT',
      'whois lanterne-presse.example',
      'report creation 2031-03-30',
      'report registrar Nordhavn Domains ApS',
      'cat dossiers/acces-gw.txt',
      'ssh analyste@echo-gw',
      'proxy-lecture-31',
      'grep lanterne-presse /var/log/proxy/access.log',
      'report poste 10.7.0.14',
    ]);
    expect(outputs[1]).toContain('DMARC fail');
    expect(outputs[2]).toContain('Aucun signal');
    expect(outputs[5]).toContain('p=reject');
    expect(outputs[12]).toContain('POST');
    expect(e.choose('theo', 'convaincre')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.objectives().every((o) => o.state === 'done')).toBe(true);
  });
});

describe('acte 2 — 05 kestrel', () => {
  it('is solvable end to end', () => {
    const { e, outputs } = play('05-kestrel.yaml', [
      'cat osint/registre-commerce-corvane.txt',
      'cat osint/offres-emploi-2028.txt',
      'ssh analyste@echo-sas',
      'sas-isole-09',
      'cat /sas/kestrel/LISEZ-MOI.txt',
      'report filiale Corvane Grid Services',
      'report coherence oui',
      'meta /sas/kestrel/planning-novembre.odt',
      'report modificateur i.calder',
      'report date 2030-11-09',
    ]);
    expect(outputs[7]).toContain('i.calder');
    expect(e.choose('documents', 'public')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
  });
});

describe('acte 2 — 06 silence', () => {
  const SOLUTION = [
    'cat alertes/soc-2031-04-12.txt',
    'report cible t.marchetti',
    'cat dossiers/acces-mx.txt',
    'ssh admin-op7@echo-mx',
    'astreinte-mx-12',
    'netstat -tunap',
    'report plage 203.0.113.64/29',
    'fw block 203.0.113.64/29',
    'netstat -tunap',
    'report lien relais-envoi.example',
  ];

  it('is solvable end to end; the block keeps legitimate mail flowing', () => {
    const { e, outputs } = play(
      '06-silence.yaml',
      SOLUTION,
      after(['hamecon', 'kestrel'], { 'hamecon/theo': 'signaler' }),
    );
    expect(outputs[5]).toContain('203.0.113.69:60321');
    expect(outputs[8]).not.toContain('203.0.113.6');
    expect(outputs[8]).toContain('198.51.100.30');
    expect(e.choose('zero', 'tracer')).toBe(true);
    expect(e.mission?.progress.status).toBe('completed');
    expect(e.mission?.inbox().some((m) => m.id === 'mara-couvrir')).toBe(false);
  });

  it('a too broad rule does not complete the objective', () => {
    const { e } = play('06-silence.yaml', [...SOLUTION.slice(0, 7), 'fw block 203.0.113.0/24']);
    expect(e.mission?.progress.completed).not.toContain('bloquer');
  });

  it('remembers covering for Théo', () => {
    const { e } = play(
      '06-silence.yaml',
      SOLUTION.slice(0, 2),
      after(['hamecon', 'kestrel'], { 'hamecon/theo': 'couvrir' }),
    );
    expect(e.mission?.inbox().some((m) => m.id === 'mara-couvrir')).toBe(true);
  });
});
