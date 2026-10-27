import { describe, expect, it } from 'vitest';
import type { CampaignState } from '../src/campaign.ts';
import { solidity, unlockedItems } from '../src/dossier.ts';
import { Engine } from '../src/engine.ts';
import { concepts, dossierSpec, loadMission, text } from './helpers.ts';

const campaign = (completed: string[], decisions: Record<string, string> = {}): CampaignState => ({
  completed,
  integrity: 50,
  initiative: 50,
  decisions,
});

const engineAt = (missionFile: string, c: CampaignState) =>
  Engine.fromMission(loadMission(missionFile), concepts, {}, c, dossierSpec);

describe('dossier', () => {
  it('unlocks pieces with the campaign, including the mission in progress', () => {
    const e = engineAt('03-resonance.yaml', campaign(['prologue', 'vallon', 'confinement']));
    const ids = unlockedItems(dossierSpec, e.dossierContext()).map((i) => i.id);
    expect(ids).toContain('sso-legacy');
    expect(ids).not.toContain('lanterne-presse');
  });

  it('confirms supported links in either direction and refuses unsupported ones', () => {
    const e = engineAt('03-resonance.yaml', campaign(['prologue', 'vallon', 'confinement']));
    expect(e.linkDossier('sso-legacy', 'edge-sync', 'même certificat')).toMatchObject({ ok: true, already: false });
    expect(e.linkDossier('edge-sync', 'sso-legacy', 'Même certificat')).toMatchObject({ ok: true, already: true });
    expect(e.linkDossier('edge-sync', 'corvane', 'appartient à')).toMatchObject({ ok: false, reason: 'unsupported' });
    expect(e.linkDossier('edge-sync', 'corvane', 'est méchant')).toMatchObject({ ok: false, reason: 'relation' });
    expect(e.linkDossier('edge-sync', 'lanterne-presse', 'même infrastructure')).toMatchObject({
      ok: false,
      reason: 'unknown',
    });
    expect(e.campaign.dossier).toEqual({ links: ['cert'], attempts: 1 });
  });

  it('gates Kestrel documents behind the decision, and they never count as admissible', () => {
    const done = ['prologue', 'vallon', 'confinement', 'resonance', 'hamecon', 'kestrel'];
    const sealed = engineAt('06-silence.yaml', campaign(done, { 'kestrel/documents': 'public' }));
    expect(unlockedItems(dossierSpec, sealed.dossierContext()).map((i) => i.id)).not.toContain('planning');

    const used = engineAt('06-silence.yaml', campaign(done, { 'kestrel/documents': 'orienter' }));
    expect(used.linkDossier('iris', 'planning', 'a modifié')).toMatchObject({ ok: true });
    const s = solidity(dossierSpec, used.campaign.dossier ?? { links: [], attempts: 0 }, used.dossierContext());
    expect(s).toMatchObject({ score: 0, confirmed: 1, inadmissible: 1 });
  });

  it('is usable from the terminal', () => {
    const e = engineAt('03-resonance.yaml', campaign(['prologue', 'vallon', 'confinement']));
    expect(text(e.execute('dossier'))).toContain('edge-sync');
    expect(text(e.execute('dossier relier sysupd edge-sync communique avec'))).toContain('Lien établi');
    expect(text(e.execute('dossier relier sysupd corvane communique avec'))).toContain('Rien dans tes preuves');
    expect(text(e.execute('dossier'))).toMatch(/solidité \d+ %/);
  });
});
