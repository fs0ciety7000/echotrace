import { blank, concept, danger, heading, line, muted, plain, subtle, success, table, warning } from '../output.ts';
import type { Command } from '../shell/command.ts';
import type { Line, Span } from '../types.ts';
import { getNode } from '../vfs.ts';
import { cidrContains } from '../world.ts';

// --- mailcheck -----------------------------------------------------------------

interface ParsedMail {
  headers: [string, string][];
  body: string;
}

/** Splits a raw message into unfolded headers and body. */
function parseMail(raw: string): ParsedMail {
  const sep = raw.search(/\r?\n\r?\n/);
  const head = sep >= 0 ? raw.slice(0, sep) : raw;
  const body = sep >= 0 ? raw.slice(sep).trimStart() : '';
  const headers: [string, string][] = [];
  for (const l of head.split(/\r?\n/)) {
    const last = headers[headers.length - 1];
    if (/^\s/.test(l) && last) last[1] += ` ${l.trim()}`;
    else {
      const i = l.indexOf(':');
      if (i > 0) headers.push([l.slice(0, i).trim().toLowerCase(), l.slice(i + 1).trim()]);
    }
  }
  return { headers, body };
}

const header = (m: ParsedMail, name: string): string | undefined => m.headers.find(([k]) => k === name)?.[1];
const addressOf = (v: string | undefined): string => (v ? (/<([^>]+)>/.exec(v)?.[1] ?? v).trim().toLowerCase() : '');
const domainOf = (addr: string): string => addr.slice(addr.lastIndexOf('@') + 1);

function authResult(m: ParsedMail, mech: string): string {
  const auth = m.headers
    .filter(([k]) => k === 'authentication-results')
    .map(([, v]) => v)
    .join(' ');
  return new RegExp(`\\b${mech}=(\\w+)`, 'i').exec(auth)?.[1]?.toLowerCase() ?? 'none';
}

/** Links whose visible text names a different domain than their real target. */
function deceptiveLinks(body: string): { text: string; href: string }[] {
  const out: { text: string; href: string }[] = [];
  for (const m of body.matchAll(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi))
    out.push({ href: m[1] as string, text: (m[2] as string).trim() });
  for (const m of body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g))
    out.push({ text: (m[1] as string).trim(), href: m[2] as string });
  return out;
}

const hostOfUrl = (u: string): string => /^[a-z]+:\/\/([^/:]+)/i.exec(u)?.[1]?.toLowerCase() ?? u;

const verdictSpan = (v: string): Span => (v === 'pass' ? success(v) : v === 'none' ? muted(v) : danger(v));

export const mailcheck: Command = {
  name: 'mailcheck',
  category: 'echo',
  summary: 'analyse un e-mail suspect (outil ECHO)',
  usage: 'mailcheck <fichier.eml>',
  description: [
    'Lit un message brut et explique ce qu’il révèle : expéditeur affiché vs adresse réelle,',
    'adresse de réponse, serveur d’origine, résultats SPF / DKIM / DMARC, liens trompeurs.',
    'Rien n’est ouvert ni cliqué : on lit seulement le texte du message.',
  ].join('\n'),
  examples: ['mailcheck ~/signalements/message-0412.eml'],
  concepts: ['defense.hameconnage', 'reseau.authentification-email'],
  complete: 'path',
  run({ argv, engine }) {
    const file = argv[0];
    if (!file) return [line(subtle(`usage : ${mailcheck.usage}`))];
    const target = engine.resolve(file);
    const node = getNode(engine.host().fs, target);
    if (node?.kind !== 'file') return [line(danger(`mailcheck: ${file}: fichier introuvable`))];
    const m = parseMail(node.content);
    const from = header(m, 'from') ?? '?';
    const fromAddr = addressOf(from);
    const fromDomain = domainOf(fromAddr);
    const replyTo = addressOf(header(m, 'reply-to'));
    const returnPath = addressOf(header(m, 'return-path'));
    const received = m.headers.filter(([k]) => k === 'received').map(([, v]) => v);
    const origin = received[received.length - 1] ?? '';
    const originIp = /\[(\d+\.\d+\.\d+\.\d+)\]/.exec(origin)?.[1] ?? '?';
    const originHost = /from\s+(\S+)/i.exec(origin)?.[1] ?? '?';
    const spf = authResult(m, 'spf');
    const dkim = authResult(m, 'dkim');
    const dmarc = authResult(m, 'dmarc');
    const links = deceptiveLinks(m.body);

    engine.emit('mail.analyzed', { hostId: engine.host().id, path: target, spf, dkim, dmarc, fromDomain });

    const signals: Line[] = [];
    if (replyTo && domainOf(replyTo) !== fromDomain)
      signals.push(line(warning('⚠ '), plain(`Les réponses partent vers ${replyTo}, pas vers l’expéditeur affiché.`)));
    if (returnPath && domainOf(returnPath) !== fromDomain)
      signals.push(line(warning('⚠ '), plain(`Adresse de retour technique (${returnPath}) d’un autre domaine.`)));
    if (dmarc !== 'pass')
      signals.push(line(warning('⚠ '), plain(`DMARC ${dmarc} : le domaine affiché n’a pas validé ce message.`)));
    for (const l of links) {
      const shown = /([a-z0-9-]+\.)+[a-z]{2,}/i.exec(l.text)?.[0]?.toLowerCase();
      const real = hostOfUrl(l.href);
      if (shown && shown !== real)
        signals.push(line(warning('⚠ '), plain(`Lien affiché « ${shown} » qui mène en réalité à ${real}.`)));
    }

    return [
      line(heading(`ANALYSE · ${header(m, 'subject') ?? '(sans objet)'}`)),
      ...table([
        [subtle('Expéditeur affiché'), plain(from)],
        [subtle('Domaine'), plain(fromDomain || '?')],
        [subtle('Répondre à'), plain(replyTo || '—')],
        [subtle('Retour technique'), plain(returnPath || '—')],
        [subtle('Serveur d’origine'), plain(`${originHost} [${originIp}]`)],
      ]),
      blank(),
      line(subtle('SPF   '), verdictSpan(spf), muted('   le serveur d’envoi est-il autorisé par le domaine ?')),
      line(subtle('DKIM  '), verdictSpan(dkim), muted('   le message porte-t-il une signature valide du domaine ?')),
      line(subtle('DMARC '), verdictSpan(dmarc), muted('   le domaine affiché est-il cohérent avec SPF/DKIM ?')),
      blank(),
      ...(signals.length ? [line(heading('SIGNAUX')), ...signals] : [line(success('Aucun signal d’alerte relevé.'))]),
      blank(),
      line(
        muted('› '),
        concept('Hameçonnage', 'defense.hameconnage'),
        muted(' · '),
        concept('SPF, DKIM, DMARC', 'reseau.authentification-email'),
      ),
    ];
  },
};

// --- meta ----------------------------------------------------------------------

export const meta: Command = {
  name: 'meta',
  category: 'echo',
  summary: 'affiche les métadonnées d’un document (outil ECHO)',
  usage: 'meta <fichier>',
  description:
    'Un document bureautique emporte des informations invisibles à l’écran : auteur, dernier modificateur,\norganisation, logiciel, dates. Elles racontent souvent une autre histoire que le contenu.',
  examples: ['meta ~/kestrel/planning-novembre.odt'],
  concepts: ['forensique.metadonnees'],
  complete: 'path',
  run({ argv, engine }) {
    const file = argv[0];
    if (!file) return [line(subtle(`usage : ${meta.usage}`))];
    const target = engine.resolve(file);
    const node = getNode(engine.host().fs, target);
    if (node?.kind !== 'file') return [line(danger(`meta: ${file}: fichier introuvable`))];
    const d = engine.host().documents?.[target];
    if (!d) return [line(muted(`${file} : aucune métadonnée (fichier texte brut).`))];
    engine.emit('document.inspected', {
      hostId: engine.host().id,
      path: target,
      author: d.author,
      lastModifiedBy: d.lastModifiedBy ?? d.author,
    });
    return [
      line(heading(`MÉTADONNÉES · ${file}`)),
      ...table([
        [subtle('Titre'), plain(d.title ?? '—')],
        [subtle('Auteur'), plain(d.author)],
        [subtle('Dernière modification par'), plain(d.lastModifiedBy ?? d.author)],
        [subtle('Organisation'), plain(d.company ?? '—')],
        [subtle('Créé le'), plain(d.created)],
        [subtle('Modifié le'), plain(d.modified)],
        [subtle('Logiciel'), plain(d.software ?? '—')],
      ]),
      blank(),
      line(
        muted('› Des métadonnées se falsifient aussi : un indice, pas une preuve. '),
        concept('Métadonnées', 'forensique.metadonnees'),
      ),
    ];
  },
};

// --- fw ------------------------------------------------------------------------

const matches = (rule: string, ip: string): boolean => (rule.includes('/') ? cidrContains(rule, ip) : rule === ip);

/** True when a remote `ip:port` is dropped by the host firewall. */
export function isBlocked(rules: { source: string }[] | undefined, addr: string): boolean {
  const ip = addr.slice(0, addr.lastIndexOf(':'));
  return (rules ?? []).some((r) => matches(r.source, ip));
}

export const fw: Command = {
  name: 'fw',
  category: 'echo',
  summary: 'gère le pare-feu de la machine courante (outil ECHO)',
  usage: 'fw list · fw block <ip|cidr> · fw unblock <ip|cidr>',
  description: [
    'Bloque le trafic d’une source sur la machine où tu te trouves (il faut en être administrateur·rice).',
    'Bloquer est une mesure de confinement : rapide, réversible, mais l’adversaire peut changer d’adresse.',
    'Bloquer trop large coupe aussi des utilisateurs légitimes.',
  ].join('\n'),
  examples: ['fw list', 'fw block 203.0.113.66'],
  concepts: ['defense.filtrage'],
  run({ argv, engine }) {
    const h = engine.host();
    const [action, target] = argv;
    h.firewall ??= [];
    if (!action || action === 'list') {
      if (h.firewall.length === 0) return [line(muted(`Pare-feu de ${h.hostname} : aucune règle de blocage.`))];
      return [
        line(heading(`PARE-FEU · ${h.hostname}`)),
        ...table(h.firewall.map((r) => [danger('DROP'), plain(r.source), muted(r.note ?? '')])),
      ];
    }
    if (action !== 'block' && action !== 'unblock') return [line(subtle(`usage : ${fw.usage}`))];
    if (engine.state.session.user !== 'root' && !engine.state.session.user.startsWith('admin')) {
      return [line(danger('fw: droits insuffisants — il faut un compte d’administration sur cette machine.'))];
    }
    if (!target || !/^\d+\.\d+\.\d+\.\d+(\/\d{1,2})?$/.test(target))
      return [line(subtle('fw: indique une adresse IP ou une plage CIDR'))];
    if (target.endsWith('/0') || /\/([0-7])$/.test(target)) {
      return [line(warning('fw: plage beaucoup trop large — tu couperais aussi tout le trafic légitime. Refusé.'))];
    }
    if (action === 'block') {
      if (h.firewall.some((r) => r.source === target)) return [line(muted(`${target} est déjà bloqué.`))];
      h.firewall.push({ source: target, note: `ajoutée par ${engine.state.session.user}` });
      const cut = (h.connections ?? []).filter((c) => isBlocked([{ source: target }], c.remote)).length;
      engine.emit('firewall.changed', { hostId: h.id, action: 'block', target });
      return [
        line(success('✓ '), plain(`Trafic de ${target} bloqué sur ${h.hostname}.`)),
        ...(cut ? [line(muted(`  ${cut} connexion(s) en cours interrompue(s).`))] : []),
        line(
          muted('› Pense à documenter la règle (qui, quand, pourquoi) et à la réévaluer. '),
          concept('Filtrage', 'defense.filtrage'),
        ),
      ];
    }
    const before = h.firewall.length;
    h.firewall = h.firewall.filter((r) => r.source !== target);
    if (h.firewall.length === before) return [line(muted(`Aucune règle pour ${target}.`))];
    engine.emit('firewall.changed', { hostId: h.id, action: 'unblock', target });
    return [line(plain(`Règle pour ${target} retirée.`))];
  },
};

export const defenseCommands = [mailcheck, meta, fw];
