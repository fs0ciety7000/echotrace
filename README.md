# ECHO TRACE ▍

> *Tout laisse un écho.*

Jeu d'enquête et de simulation de cybersécurité **pédagogique**. Tu rejoins **ECHO**, une cellule d'analystes indépendants qui cartographie des opérations numériques invisibles en suivant leurs traces. Terminal réaliste, réseau simulé, journal d'apprentissage : on apprend en comprenant *pourquoi* ça marche — côté attaque comme côté défense.

**Tout est simulé** : adresses fictives, aucune requête réseau réelle, aucune technique directement réutilisable.

🎮 **https://echo.fs0ciety.org** (déploiement Coolify — voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md))

## Démarrer
```bash
corepack enable
pnpm install
pnpm dev            # http://localhost:5173
pnpm run check      # lint, types, tests, contenu, build
```

## Stack
TypeScript · React 19 + Vite · Tailwind CSS v4 (design system « Signal ») · Zustand + IndexedDB · moteur de simulation pur (`packages/engine`) · contenu YAML/Markdown validé par Zod · Caddy dans Docker pour la production. Justifications : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Documentation
| | |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Règles du projet (humains et agents) |
| [`docs/LORE.md`](docs/LORE.md) | Univers, factions, personnages, campagne |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, moteur, ADR |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens, composants, accessibilité |
| [`docs/design/SCREENS.md`](docs/design/SCREENS.md) | Wireframes des écrans clés |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phases et avancement |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | Écrire missions et fiches |
| [`docs/PEDAGOGY.md`](docs/PEDAGOGY.md) | Principes pédagogiques |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Coolify + Cloudflare |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribuer |
