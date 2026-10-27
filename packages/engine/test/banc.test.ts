import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.ts';
import { concepts, loadMission, text } from './helpers.ts';

function solve(file: string, commands: string[]) {
  const e = Engine.fromMission(loadMission(file), concepts);
  const outputs = commands.map((c) => text(e.execute(c)));
  return { e, outputs };
}

describe('le Banc', () => {
  it('module 1 — adresses & ports', () => {
    const { e } = solve('banc-1-adresses.yaml', [
      'ifconfig',
      'report taille 64',
      'nmap -sn 10.7.1.0/26',
      'nmap -sV 10.7.1.0/26',
      'report base banc-db',
      'report https 443',
    ]);
    expect(e.mission?.progress.status).toBe('completed');
  });

  it('module 2 — reconnaissance passive', () => {
    const { e, outputs } = solve('banc-2-recon.yaml', [
      'whois atelier-banc.example',
      'report registrar Registre Fictif SAS',
      'dns atelier-banc.example MX',
      'report mx courrier.atelier-banc.example',
      'dns audit atelier-banc.example',
      'report discret depot-interne',
    ]);
    expect(outputs[4]).toContain('depot-interne.atelier-banc.example');
    expect(e.mission?.progress.status).toBe('completed');
  });

  it('module 3 — lire un journal web, with pipelines', () => {
    const { e, outputs } = solve('banc-3-journaux.yaml', [
      'ssh exercice@banc-web',
      'journal-banc',
      'wc -l /var/log/nginx/access.log',
      'grep " 404 " /var/log/nginx/access.log | wc -l',
      'cut -d " " -f 1 /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -n 1',
      'report total 59',
      'report erreurs 14',
      'report actif 203.0.113.77',
      'grep 203.0.113.77 /var/log/nginx/access.log | head -n 1',
      'report qui VerifLiens',
      'report verdict non',
    ]);
    expect(outputs[2]).toContain('59');
    expect(outputs[3]).toBe('14');
    expect(outputs[4]).toMatch(/15 203\.0\.113\.77/);
    expect(e.mission?.progress.status).toBe('completed');
  });
});
