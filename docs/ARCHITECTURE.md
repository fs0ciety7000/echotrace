# ARCHITECTURE — Echo Trace

Statut : **v0.1 — Phase 0/1 (fondations)**. Mis à jour à chaque phase.

## 1. Décision de stack (résumé)

| Couche | Choix | Pourquoi |
|---|---|---|
| Langage | **TypeScript** (strict) partout | Un seul langage client / moteur / (futur) serveur → schémas partagés, onboarding simple, maintenance long terme. |
| Monorepo | **pnpm workspaces** | Rapide, strict sur les dépendances, natif Node. Pas besoin de Turborepo à cette taille. |
| Moteur de jeu | **`@echotrace/engine`** — TS pur, sans DOM | Simulation (réseau, machines, shell, missions) testable en isolation (Vitest), réutilisable côté serveur ou dans un éditeur de missions. |
| Front | **React 19 + Vite 8** (SPA) | Écosystème le plus riche pour ce besoin : `@xyflow/react` (graphe réseau / enquête), Motion, Zustand. Pas de SSR nécessaire (jeu, pas de SEO). |
| Style | **Tailwind CSS v4** + tokens CSS (`@theme`) | Les tokens du design system sont la source de vérité ; Tailwind ne fait que les exposer. |
| État | **Zustand** (+ persistance IndexedDB via `idb-keyval`) | Store minimaliste, sélecteurs fins, sérialisable pour les sauvegardes. |
| Terminal | **EchoTerm** (composant maison, DOM) | Voir ADR-0002. Sortie structurée (spans sémantiques, liens vers fiches), accessible, thémable. |
| Graphes | **@xyflow/react** | Vue réseau + graphe d'enquête, interactions riches, performant. |
| Contenu | **YAML** (missions, scénarios) + **Markdown** (fiches, briefings), validés par **Zod** | Lisible et éditable par des non-devs, diff-friendly, validé en CI. |
| PWA | **vite-plugin-pwa** (Workbox) | Installable sur Windows / macOS / Linux depuis Chrome/Edge, jouable hors-ligne. |
| Qualité | **Biome** (lint + format), **Vitest**, `tsc --noEmit` | Un seul outil rapide pour lint/format. |
| Serveur statique | **Caddy 2** dans une image Docker multi-stage | Config SPA + headers de sécurité en 20 lignes, image légère, healthcheck. |
| Déploiement | **Coolify** (Dockerfile) derrière **Cloudflare** → `echo.fs0ciety.org` | Voir `DEPLOYMENT.md`. |
| (Phase 4) Backend | **Hono** sur Node + **SQLite** (Drizzle) | Comptes, sync des sauvegardes, leaderboards. Même langage, schémas Zod partagés. |
| (Phase 5, optionnel) Desktop | **Tauri 2** | Wrapper natif léger (~10 Mo) si la PWA ne suffit pas (Steam, Linux sans Chromium). |

### Alternatives écartées

- **SvelteKit** : excellent DX, mais écosystème plus mince pour les graphes interactifs et les composants complexes ; React reste le choix le plus sûr pour la maintenance à plusieurs mains.
- **Next.js** : SSR/RSC inutiles pour un jeu 100 % client ; complexifie l'hébergement statique et le mode hors-ligne.
- **Godot (export web)** : idéal pour un jeu graphique, mauvais pour une UI très textuelle (terminal, documents, formulaires), accessibilité et sélection de texte médiocres, bundle WASM lourd.
- **Backend Go / Rust dès le départ** : performants, mais un second langage pour un besoin qui n'existe pas encore (tout tourne côté client). On garde la porte ouverte : le moteur est pur et sérialisable.
- **xterm.js** : vrai émulateur VT100, mais pensé pour un PTY réel. Nous n'avons pas de PTY : on veut des sorties riches (liens cliquables vers les fiches, badges, tableaux), une accessibilité lecteur d'écran et une typographie cohérente avec le design system. → ADR-0002.

## 2. Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│ apps/web  (React SPA / PWA)                                      │
│                                                                  │
│  screens/        ui/ (design system)     features/               │
│  ├─ MainMenu     ├─ Button, Panel…       ├─ terminal/ (EchoTerm) │
│  ├─ Operator     └─ tokens.css           ├─ missions/            │
│  └─ Academy                              ├─ network/ (xyflow)    │
│                                          └─ journal/             │
│        │ store (Zustand) ── persist ──► IndexedDB                │
└────────┼─────────────────────────────────────────────────────────┘
         │ API publique typée (pas d'accès aux internes)
┌────────▼─────────────────────────────────────────────────────────┐
│ packages/engine  (TS pur, zéro dépendance DOM)                   │
│                                                                  │
│  world/    hosts, services, VFS, réseau, comptes                 │
│  shell/    tokenizer, registre de commandes, session             │
│  commands/ help, ls, cd, cat, nmap, ssh, grep…                   │
│  missions/ objectifs, triggers sur événements, choix             │
│  events    bus typé (host.scanned, file.read, concept.seen…)     │
│  content/  schémas Zod (Mission, Scenario, Concept)              │
└────────▲─────────────────────────────────────────────────────────┘
         │ chargé et validé au build (import.meta.glob) + en CI
┌────────┴─────────────────────────────────────────────────────────┐
│ content/  missions/*.yaml   concepts/*.md                        │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Le moteur (`packages/engine`)

### 3.1 Principes
1. **Pur & déterministe** : aucune dépendance au DOM, au temps réel ou à `Math.random` non seedé. Un `Rng` seedé et une horloge simulée sont injectés. → tests reproductibles, replays possibles.
2. **Données sérialisables** : l'état du monde est un objet JSON (pas de classes avec méthodes dans l'état). Les sauvegardes = snapshot + version de schéma.
3. **Événements comme contrat** : les commandes émettent des événements typés ; missions, journal d'apprentissage, exposition et succès s'y abonnent. Une commande ne connaît jamais les missions.
4. **Sortie structurée** : une commande renvoie des `OutputLine[]` composées de `Span` sémantiques (`text`, `muted`, `accent`, `success`, `warning`, `danger`, `concept`, `path`, `host`…). Le rendu (couleur, police, lien) est l'affaire de l'UI.

### 3.2 Modèle de monde (simplifié)

```ts
World {
  hosts: Record<HostId, Host>
  networks: Record<NetId, Network>   // segments, CIDR, liens
}
Host {
  id, hostname, ip, os, tags
  services: Service[]                // port, proto, name, product, version, banner
  accounts: Account[]                // user, password (fictif), privileges
  fs: VfsNode                        // arbre de fichiers (dir/file), contenu inline
  reachableFrom: NetId[]
}
```

### 3.3 Shell
- `tokenize()` : guillemets simples/doubles, échappements, opérateur `|` (pipes simples type `cat x | grep y`).
- `CommandRegistry` : chaque commande déclare `name`, `summary`, `usage`, `concepts` (fiches liées), `complete()` optionnel et `run(ctx)`.
- `ShellSession` : hôte courant, utilisateur, cwd, pile de connexions SSH, historique, variables.
- Complétion par Tab : commandes, puis chemins du VFS, puis hôtes connus.

### 3.4 Missions
Une mission (YAML) déclare : briefing, scénario (monde initial ou patch du monde), **objectifs** déclenchés par des événements (`on: host.scanned, where: { ip: 203.0.113.10 }`), concepts associés, choix et débrief. Le `MissionRunner` écoute le bus et met à jour l'état des objectifs. Voir `CONTENT_GUIDE.md`.

### 3.5 Pédagogie (journal d'apprentissage)
- Chaque `Concept` (Markdown + frontmatter) a un id stable (`net.port`, `recon.dns`, `forensics.auth-log`…).
- Événement `concept.encountered` émis par les commandes (`nmap` → `net.port`, `net.service-fingerprint`) et les missions.
- Le journal stocke : première rencontre, nombre d'usages, quiz réussi → **maîtrise** (0–3). Voir `PEDAGOGY.md`.

## 4. Le front (`apps/web`)

```
src/
  main.tsx, App.tsx          bootstrap, routing d'écrans
  styles/tokens.css          tokens du design system (source de vérité)
  styles/global.css          base, Tailwind, utilitaires
  ui/                        composants génériques du design system
  features/terminal/         EchoTerm (rendu, saisie, historique, complétion)
  features/missions/         panneau d'objectifs, briefing, débrief
  features/network/          vue réseau (xyflow) — Phase 2
  features/journal/          fiches et progression
  screens/                   MainMenu, Operator (dashboard), Academy, Settings
  state/                     stores Zustand (game, settings), persistance
  content/                   chargement + validation du contenu (glob Vite)
```

- **Routing** : machine d'écrans dans le store (un jeu n'a pas besoin d'URL profondes). Si nécessaire plus tard : TanStack Router.
- **Thèmes** : `data-theme="default" | "legible"` sur `<html>`, plus `prefers-reduced-motion`.
- **Sauvegardes** : store `game` persisté dans IndexedDB (clé `echotrace:save:<slot>`), versionné (`saveVersion`) avec migrations.

## 5. Sécurité & éthique (by design)
- Aucune requête réseau réelle depuis le moteur : `ping`, `nmap`, `curl` lisent le monde simulé.
- Domaines et IP fictifs (plages de documentation RFC 5737 / TLD RFC 2606) validés par le schéma de contenu.
- CSP stricte côté Caddy (`default-src 'self'`).
- Pas de collecte de données en phases 0–3 (tout est local).

## 6. ADR
Les décisions structurantes sont consignées dans `docs/adr/` :
- [ADR-0001 — Stack TypeScript / React / moteur pur](adr/0001-stack.md)
- [ADR-0002 — Terminal maison plutôt que xterm.js](adr/0002-terminal.md)
- [ADR-0003 — Contenu en YAML/Markdown validé par Zod](adr/0003-content-format.md)
