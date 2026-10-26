# Contribuer à Echo Trace

## Mise en route
Prérequis : Node 22 (`.nvmrc`), pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## Avant d'ouvrir une PR
```bash
pnpm run check    # lint + typecheck + tests + validation du contenu + build
```

## Organisation
```
apps/web/           SPA React (UI, design system, écrans)
packages/engine/    moteur de simulation pur TS (+ tests Vitest)
content/            missions (YAML) et fiches (Markdown)
deploy/             Caddyfile de production
docs/               lore, architecture, design system, roadmap, guides
```

## Conventions
- Commits : impératif court en anglais, préfixe de portée (`engine: add whois command`, `web: terminal tab completion`, `content: prologue hints`, `docs: …`).
- Une PR = un sujet. Mettre à jour la doc concernée dans la même PR.
- Contenu : suivre `docs/CONTENT_GUIDE.md` (checklist en fin de document).
- UI : suivre `docs/DESIGN_SYSTEM.md` ; tester clavier seul, mode Haute lisibilité et Mouvement réduit.
- Éthique : rien de directement exploitable dans le monde réel (voir `CLAUDE.md`, règles non négociables).
