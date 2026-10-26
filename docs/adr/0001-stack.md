# ADR-0001 — Stack TypeScript / React / moteur pur

- Statut : accepté
- Date : 2026-10-26

## Contexte
Echo Trace est un jeu très textuel (terminal, documents, e-mails, logs) avec quelques vues graphiques (réseau, graphe d'enquête). Il doit être déployable simplement sur Coolify, jouable sur les trois OS desktop, maintenable longtemps et extensible par du contenu.

## Décision
- TypeScript strict, monorepo pnpm.
- Moteur de simulation pur (`packages/engine`) sans dépendance DOM.
- Front React 19 + Vite (SPA) + Tailwind v4 + Zustand + @xyflow/react, distribué en PWA.
- Phase 0–3 : 100 % client (sauvegarde IndexedDB), servi en statique par Caddy.
- Phase 4 : backend Hono + SQLite pour comptes / sync / leaderboards.

## Conséquences
- + Un seul langage, schémas partagés, tests du moteur en Node pur.
- + Image Docker statique minuscule, aucun état serveur à gérer au départ.
- − Pas d'anti-triche sur les classements avant la phase 4 (validation serveur des replays déterministes prévue).
- − La PWA dépend du navigateur ; Tauri reste une option si un vrai binaire est requis.
