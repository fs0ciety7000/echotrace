# CLAUDE.md — instructions permanentes pour Echo Trace

Tu travailles sur **Echo Trace**, un jeu d'enquête / simulation de cybersécurité **pédagogique** (inspirations : NITE Team 4, Hacknet). Déployé sur **https://echo.fs0ciety.org** via Coolify (`coolify.fs0ciety.org`) derrière Cloudflare.

## Lire avant d'agir
| Sujet | Document |
|---|---|
| Univers, personnages, ton, structure de campagne | `docs/LORE.md` |
| Stack, moteur, flux de données, ADR | `docs/ARCHITECTURE.md`, `docs/adr/` |
| Tokens, composants, écrans | `docs/DESIGN_SYSTEM.md`, `docs/design/SCREENS.md` |
| Phases et état d'avancement | `docs/ROADMAP.md` |
| Écrire une mission ou une fiche | `docs/CONTENT_GUIDE.md` |
| Principes pédagogiques | `docs/PEDAGOGY.md` |
| Déploiement | `docs/DEPLOYMENT.md` |

## Règles non négociables
1. **Tout est simulé.** Le moteur ne fait jamais de requête réseau réelle. Aucune charge utile, aucun exploit, aucune technique directement réutilisable contre un vrai système. L'« offensif » reste conceptuel (mauvaise config, identifiants qui traînent, version obsolète) et chaque mission enseigne aussi le point de vue **défense** et **éthique**.
2. **Adresses fictives uniquement** : IP privées ou de documentation (RFC 5737 : `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`), TLD réservés (`.example`, `.test`, `.invalid`, `.internal`, `.lan`, `.local`). Le schéma Zod le vérifie — ne le contourne pas.
3. **Le moteur (`packages/engine`) reste pur** : pas de DOM, pas de `Date.now()` / `Math.random()` non déterministes, état 100 % JSON sérialisable. Les commandes émettent des **événements** ; elles ne connaissent ni les missions ni l'UI.
4. **Pas de couleur en dur dans l'UI** : uniquement les tokens de `apps/web/src/styles/tokens.css` (utilitaires Tailwind générés). Un nouveau token = mise à jour de `DESIGN_SYSTEM.md`.
5. **Chaque mission doit rester solvable** : un test « solveur » scripté par mission dans `packages/engine/test/`.
6. **Mettre à jour la doc** à chaque changement structurant (ROADMAP, ARCHITECTURE, DESIGN_SYSTEM, CONTENT_GUIDE). Une phase n'est finie que si la doc l'est.

## Langue & conventions
- **Docs, contenu de jeu, textes UI : français.** Code, identifiants, commentaires de code, messages de commit : anglais.
- Les sorties des outils réels simulés (`ls`, `ping`, `nmap`, `ssh`…) **imitent le format réel (anglais)** — le joueur apprend à lire de vraies sorties. Les commandes propres à ECHO (`help`, `objectives`, `journal`, `learn`, `hint`) et les annotations pédagogiques (`›  …`) sont en français.
- Tutoiement entre membres d'ECHO. Écriture inclusive avec point médian dans le contenu (`connecté·e`).
- TypeScript strict, imports avec extension `.ts`/`.tsx` (Node `--experimental-strip-types` exécute les scripts du moteur → **syntaxe effaçable uniquement** : pas d'`enum`, pas de propriétés de paramètres de constructeur, pas de `namespace`).
- Tailwind : la couleur de fond du terminal s'appelle `deep` (pas `base`, qui entrerait en collision avec `text-base`) ; le surtitre mono est la classe `.eyebrow` (pas `.overline`, utilitaire Tailwind).

## Commandes
```bash
pnpm install
pnpm dev             # http://localhost:5173
pnpm test            # Vitest (moteur + solveurs de missions)
pnpm typecheck
pnpm lint            # Biome ; pnpm format pour corriger
pnpm content:check   # valide /content (schémas, références croisées, adresses sûres)
pnpm a11y            # axe-core (WCAG 2.1 AA) sur le build, 11 écrans × 2 thèmes — après pnpm build
pnpm build
pnpm run check       # tout ce que fait la CI (⚠ `pnpm ci` est une commande réservée de pnpm)
```

## Ajouter…
- **une commande** : `packages/engine/src/commands/<groupe>.ts` → l'enregistrer dans `commands/index.ts` ; déclarer `summary`, `usage`, `description`, `concepts` ; émettre les événements pertinents ; tests dans `test/engine.test.ts`.
- **une mission** : `content/missions/NN-id.yaml` (voir CONTENT_GUIDE) + test solveur.
- **une fiche** : `content/concepts/<categorie>.<slug>.md` (le nom de fichier = l'id).
- **un écran / composant** : composants génériques dans `apps/web/src/ui/`, fonctionnalités dans `features/`, écrans dans `screens/`. Respecter `DESIGN_SYSTEM.md` (états, focus visible, mouvement réduit).

## Vérifier avant de pousser
`pnpm run check` doit passer. Pour un changement visuel, lancer `pnpm build && pnpm preview` et vérifier dans Chromium (Playwright est préinstallé dans l'environnement cloud).

## Méthode de travail
Itératif, par phases (`ROADMAP.md`). Après chaque phase significative : mettre à jour la roadmap et résumer l'avancement. Utiliser sous-agents / skills quand c'est pertinent (revue de code, accessibilité, design).
