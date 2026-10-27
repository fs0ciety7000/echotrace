# ROADMAP — Echo Trace

Légende : ✅ fait · 🟡 en cours · ⬜ à faire. Chaque phase se termine par : docs à jour, CI verte, déploiement sur `echo.fs0ciety.org`.

## Phase 0 — Fondations ✅
- ✅ Lore initial (`LORE.md`)
- ✅ Décision de stack + ADR (`ARCHITECTURE.md`, `docs/adr/`)
- ✅ Design system « Signal » + wireframes des écrans clés
- ✅ Monorepo pnpm (`apps/web`, `packages/engine`, `content/`)
- ✅ `CLAUDE.md`, `CONTRIBUTING.md`, `DEPLOYMENT.md`, `CONTENT_GUIDE.md`, `PEDAGOGY.md`
- ✅ Dockerfile (Caddy) + CI GitHub Actions (lint, typecheck, tests, build, contenu, smoke test de l'image)

## Phase 1 — Vertical slice : Prologue jouable 🟡
Objectif : 15–20 minutes de jeu complet, du menu au débrief.
- ✅ Moteur : VFS, hôtes, services, shell (tokenizer, pipes, historique), bus d'événements
- ✅ Commandes v0 : `help man clear echo whoami hostname pwd ls cd cat grep history ifconfig ping nmap ssh exit objectives hint journal learn`
- ✅ EchoTerm : rendu structuré, historique ↑↓, complétion Tab, concepts cliquables
- ✅ Écran titre + poste opérateur (layout 4 colonnes, barre d'état)
- ✅ MissionRunner : objectifs déclenchés par événements
- ✅ Prologue « Bruit de fond » (8 objectifs dont 1 optionnel) + 11 fiches, test solveur en CI
- ✅ Sauvegarde locale (IndexedDB)
- ✅ Briefing (modale) et débrief (statistiques, réponse à la question)
- ✅ Fiches consultables en panneau latéral (étude = maîtrise 2), notifications
- ✅ Messages entrants (Comms) : déclenchés par événements, machine à écrire séquentielle, commande `mail`, badge non lus
- ✅ Journal d'apprentissage : vue complète (catégories, maîtrise globale, fiches verrouillées) + quiz par fiche (sans-faute → maîtrise 3), 31 questions
- ✅ Paramètres : Haute lisibilité, Mouvement réduit
- 🟡 Paramètres : son ✅ (activation, volume, frappe) ; taille du terminal et réinitialisation de la sauvegarde à faire
- ✅ PWA : manifest, icônes, service worker Workbox (jouable hors ligne, installable Chrome/Edge)
- ✅ Premier déploiement : https://echo.fs0ciety.org (Coolify, auto-deploy sur push, Cloudflare proxifié, TLS strict)
- ✅ Responsive : onglets Terminal / Objectifs / Comms sous 1024 px, journal liste ↔ fiche sous 768 px, testé à 390 px

## Phase 2 — Acte I « Résonance » ✅
- ✅ Campagne : enchaînement des missions, journal et décisions conservés, sauvegarde v2 (migration v1)
- ✅ Choix moraux (modale, conséquences au débrief) + jauges Intégrité / Initiative (barre d'état)
- ✅ Conclusions d'enquête : commande `report` + panneau « Rapport »
- ✅ Outils ECHO simplifiés et pédagogiques : `whois`, `dns` (+ `dns audit`), `cert`
- ✅ Commandes : `curl ps netstat head tail wc sort uniq cut`
- ✅ Acte I recentré **réponse à incident & recoupement d'indices** (décision du 26/10) :
  - ✅ 01 « Vallon » — cartographie d'un périmètre autorisé (choix : rester dans le périmètre)
  - ✅ 02 « Confinement » — chercher ce qui ne se voit pas (processus, connexions, tâches planifiées) ; choix : couper / observer encadré / observer sans le dire
  - ✅ 03 « Résonance » — pivot sur empreinte de certificat, archives, whois ; attribution prudente ; choix : ANCS / Lanterne / creuser
- ✅ 27 fiches (16 nouvelles) avec quiz
- ✅ Vue réseau (xyflow, chargée à la demande) : hôtes révélés par la découverte, inspecteur, actions qui préparent la commande dans le terminal
- ✅ Exemples « Dans le jeu » des fiches alignés sur les missions réelles (noms, adresses, sorties des outils)
- ✅ Le Banc : écran Académie + 3 modules rejouables (Adresses & ports, Reconnaissance passive, Lire un journal web) ; hors campagne, seul le journal en garde trace (stockage séparé)

## Phase 3 — Profondeur 🟡 (campagne complète jouable)
- ✅ Outils ECHO de défense : `mailcheck` (en-têtes, SPF/DKIM/DMARC, liens trompeurs), `meta` (métadonnées), `fw` (pare-feu, refuse les blocages trop larges ; `netstat` en tient compte)
- ✅ Acte II « Interférences » : 04 Hameçon · 05 Kestrel · 06 Silence sur la ligne (tests solveurs, décisions reliées à l'acte précédent)
- ✅ 35 fiches (8 nouvelles : hameçonnage, SPF/DKIM/DMARC, domaine sosie, culture du signalement, métadonnées, OSINT, sources, filtrage)
- ✅ Graphe d'enquête « Dossier » : pièces débloquées par les missions et les décisions, liens proposés par le joueur et confirmés seulement par les preuves, solidité et recevabilité (vue graphe + commande `dossier`)
- ✅ Acte III « Silence radio » : 07 Fréquence · 08 Salle de contrôle · 09 Silence radio (tests solveurs) ; 41 fiches (6 nouvelles : corrélation, segmentation IT/OT, accès des tiers, divulgation coordonnée, rapport, continuité d'activité)
- ✅ Quatre fins pilotées par les données (`content/fins.yaml` : décision finale, Intégrité, solidité du Dossier) + écran d'épilogue ; Dossier étendu à 20 pièces / 21 liens
- ✅ Mode sandbox du Banc : exercices générés à partir d'une graine (3 niveaux, 4 à 8 machines) — machine à corriger, chant et sa destination, source de force brute à bloquer ; déterministe, solvable par construction (test sur 10 graines × 3 niveaux)
- ✅ Accessibilité auditée (WCAG 2.1 AA) : 0 violation axe sur 13 écrans × 2 thèmes, piège clavier du terminal supprimé, focus des panneaux, contrastes, reflow 320 px — voir `ACCESSIBILITY.md`
- ✅ Sons d'interface synthétisés (Web Audio, sans fichier) + réglages : activation, volume, frappe au clavier
- ⬜ i18n (EN), polissage animations
- ✅ Audit axe en CI (`pnpm a11y`, 11 écrans × 2 thèmes)
- ⬜ Tests avec lecteurs d'écran réels (NVDA, VoiceOver)

## Phase 4 — En ligne ⬜
- `apps/server` : Hono + SQLite (Drizzle) — comptes (passkeys), sync des sauvegardes
- Bounties du Banc + leaderboard (replays déterministes validés côté serveur)
- Contrats Lanterne (side missions) livrés comme packs de contenu

## Phase 5 — Outils & extensions ⬜
- Éditeur de missions (web) produisant le YAML
- Scénarios inspirés d'incidents réels anonymisés (avec fiches « ce qui s'est vraiment passé »)
- Coop léger (2 opérateurs, rôles red/blue) — exploratoire
- Wrapper Tauri si besoin d'un binaire natif
