# ADR-0003 — Contenu en YAML / Markdown validé par Zod

- Statut : accepté
- Date : 2026-10-26

## Décision
- Missions et scénarios : YAML (`content/missions/*.yaml`).
- Fiches pédagogiques : Markdown avec frontmatter YAML (`content/concepts/*.md`).
- Schémas Zod dans `packages/engine/src/content/` ; validation à l'exécution (chargement) et en CI (`pnpm content:check`).

## Pourquoi
Lisible par des auteurs non-développeurs, diffable, commentable, et suffisamment structuré pour un futur éditeur de missions (qui produira le même YAML).

## Conséquences
- Toute évolution de schéma passe par une migration documentée dans `CONTENT_GUIDE.md`.
- Les IP/domaines sont validés (plages de documentation / privées, TLD réservés).
