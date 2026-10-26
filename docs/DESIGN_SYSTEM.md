# DESIGN SYSTEM — Echo Trace « Signal »

Nom de code : **Signal**. Version 0.1.
Source de vérité technique : `apps/web/src/styles/tokens.css`. Ce document explique *pourquoi* et *comment* ; le CSS dit *quoi*. Toute modification de token se fait dans les deux.

---

## 1. Principes

1. **Calme sous pression.** L'interface d'un SOC haut de gamme, pas d'une boîte de nuit. Fonds profonds et neutres, la couleur est un *signal*, jamais une décoration.
2. **La donnée d'abord.** Typographie et alignements avant les effets. Chaque pixel de couleur doit porter une information (état, catégorie, interaction).
3. **Profondeur subtile.** Couches de surface + bordures fines translucides + un soupçon de verre sur les overlays. Pas d'ombres portées lourdes, pas de glow saturé.
4. **Le terminal est un citoyen de première classe.** Même soin typographique que le reste de l'UI ; il partage les tokens.
5. **Lisible pendant des heures.** Contraste AA minimum partout (AAA pour le texte courant en mode Haute lisibilité), tailles généreuses, mouvement réductible.
6. **Diégétique mais utilisable.** L'UI fait partie du monde (poste opérateur ECHO), sans jamais sacrifier l'ergonomie à la mise en scène.

Références d'esprit : Linear (rigueur, densité élégante), Vercel/Geist (typographie, neutres), consoles xAI / SOC premium (dark profond, accents rares), Hacknet / NITE Team 4 (fantasme opérationnel).

## 2. Couleur

### 2.1 Neutres — « Abysse »
Neutres légèrement froids (teinte ~220°), pour que le cyan et l'émeraude respirent.

| Token | Hex | Usage |
|---|---|---|
| `--color-void` | `#05070A` | Fond de l'app, derrière tout. |
| `--color-deep` | `#0A0D12` | Fond des zones de travail (terminal). Nommé `deep` et non `base` pour ne pas entrer en collision avec l’utilitaire de taille `text-base` de Tailwind. |
| `--color-surface` | `#0F131A` | Panneaux. |
| `--color-raised` | `#151A23` | Cartes, éléments au survol, inputs. |
| `--color-overlay` | `#1B2130` | Menus, popovers, modales (avec verre). |
| `--color-line` | `rgb(255 255 255 / 0.07)` | Bordures par défaut. |
| `--color-line-strong` | `rgb(255 255 255 / 0.12)` | Bordures actives / séparateurs marqués. |
| `--color-line-focus` | `rgb(86 212 224 / 0.55)` | Contour de focus (signal). |

### 2.2 Texte

| Token | Hex | Contraste sur `surface` | Usage |
|---|---|---|---|
| `--color-fg` | `#E6EAF0` | ~15:1 | Texte principal. |
| `--color-fg-muted` | `#A1AAB8` | ~7.6:1 | Texte secondaire, labels. |
| `--color-fg-subtle` | `#6C7686` | ~3.9:1 | Métadonnées, placeholders (≥ 14 px, jamais pour un contenu essentiel). |
| `--color-fg-faint` | `#3F4757` | — | Désactivé, filigranes. |

### 2.3 Accents — trois signaux
Chaque accent a une **signification fixe** dans le monde du jeu :

| Rôle | Token | Hex | Sens |
|---|---|---|---|
| **Signal** (cyan) | `--color-signal` | `#56D4E0` | Interaction, focus, sélection, la voix du joueur. |
| **Trace** (émeraude) | `--color-trace` | `#3DD68C` | Succès, sécurisé, défense, objectif accompli. |
| **Echo** (violet) | `--color-echo` | `#9D8CFF` | Renseignement, lore, concept/fiche, corrélation, inconnu. |

Chaque accent existe en 4 déclinaisons : `-strong` (texte/icône), base, `-soft` (fond 12 %), `-line` (bordure 35 %).

### 2.4 États

| Token | Hex | Usage |
|---|---|---|
| `--color-warn` | `#F2B544` | Exposition modérée, attention. |
| `--color-danger` | `#F0616D` | Hostile, critique, échec, exposition haute. |
| `--color-info` | = `signal` | Informations système. |

**Règle** : jamais deux accents saturés côte à côte dans le même composant, sauf visualisations de données. Le rouge est rare : quand il apparaît, il doit inquiéter.

### 2.5 Gradients & matières
- `--gradient-horizon` : `radial-gradient(120% 80% at 50% -10%, rgb(86 212 224 / 0.10), transparent 60%)` — halo très discret en haut des écrans principaux.
- `--gradient-echo` : `linear-gradient(135deg, #56D4E0 0%, #9D8CFF 100%)` — **réservé** au logotype, aux moments narratifs et aux barres de progression de maîtrise.
- **Verre** (`.glass`) : fond `rgb(21 26 35 / 0.72)` + `backdrop-filter: blur(16px) saturate(140%)` + bordure `line`. Uniquement pour les overlays (modales, palette de commandes, toasts). Désactivé en mode Haute lisibilité.
- **Grain** : texture bruit SVG à 3 % d'opacité sur `void` (optionnel, désactivable) pour éviter le banding des dégradés.

## 3. Typographie

| Famille | Token | Police | Usage |
|---|---|---|---|
| Sans | `--font-sans` | **Geist** (variable) → Inter → system-ui | UI, lecture, briefings. |
| Mono | `--font-mono` | **Geist Mono** (variable) → JetBrains Mono → ui-monospace | Terminal, données, IP, hash, code, labels techniques. |

Polices auto-hébergées via `@fontsource-variable/*` (pas de requête Google Fonts → RGPD + CSP + hors-ligne).

### Échelle (base 16 px, ratio ~1.2)

| Token | Taille / interligne | Graisse | Usage |
|---|---|---|---|
| `text-micro` | 11 / 16 | 500, mono, `+0.08em`, MAJUSCULES | Overlines, étiquettes de statut. |
| `text-xs` | 12 / 18 | 400–500 | Métadonnées, badges. |
| `text-sm` | 13 / 20 | 400 | UI dense, terminal (défaut). |
| `text-base` | 15 / 24 | 400 | Texte courant, briefings. |
| `text-lg` | 18 / 28 | 500 | Titres de panneaux. |
| `text-xl` | 22 / 30 | 600 | Titres d'écran. |
| `text-2xl` | 28 / 36 | 600, `-0.01em` | Titres de mission. |
| `text-display` | 36–76 / 1.0 (fluide, `clamp(36px, 7vw, 76px)`) | 600, `-0.03em` | Écran titre, chapitres. |

Règles :
- Chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour IP, ports, timestamps, compteurs.
- Longueur de ligne de lecture : 60–75 caractères (`max-w-prose`).
- Mode Haute lisibilité : +2 px sur tout le texte, interligne +10 %, terminal en 15 px.

## 4. Espacement, grille, rayons

- **Échelle d'espacement** (base 4) : `0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.
- **Densité** : panneaux internes `16`, cartes `12–16`, listes `8` vertical.
- **Layout opérateur** : rail 56 px | barre latérale 280 px | zone principale fluide | panneau contextuel 340 px. Barre d'état 28 px.
- **Rayons** : `--radius-xs 4` (badges, kbd), `--radius-sm 6` (inputs, boutons), `--radius-md 10` (cartes, panneaux), `--radius-lg 14` (modales), `--radius-full`.
- **Bordures** : 1 px partout. Jamais 2 px sauf focus (anneau 2 px `signal` avec offset 2 px).

## 5. Élévation

| Niveau | Fond | Bordure | Ombre |
|---|---|---|---|
| 0 — Sol | `void`/`deep` | — | — |
| 1 — Panneau | `surface` | `line` | — |
| 2 — Carte | `raised` | `line` | `0 1px 0 rgb(255 255 255 / 0.03) inset` |
| 3 — Flottant | `overlay` + verre | `line-strong` | `0 12px 32px -12px rgb(0 0 0 / 0.6)` |
| 4 — Modale | `overlay` + verre | `line-strong` | `0 24px 64px -16px rgb(0 0 0 / 0.7)` + voile `void/70%` |

Le liseré interne supérieur (1 px blanc 3 %) donne la sensation de « matière » sans ombre lourde.

## 6. Mouvement

| Token | Valeur | Usage |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Entrées, survols. |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transitions d'écran. |
| `--dur-fast` | 120 ms | Survol, pression. |
| `--dur-base` | 180 ms | Ouverture menus, onglets. |
| `--dur-slow` | 320 ms | Transitions d'écran, modales. |
| `--dur-narrative` | 600–1200 ms | Moments de récit (révélation, nouvel objectif). |

Signatures :
- **Scan line** : un dégradé fin balaie un panneau quand de nouvelles données arrivent (1 passage, 600 ms).
- **Pulse de signal** : point d'état qui « respire » (opacité 0.5→1, 2 s) pour les connexions actives.
- **Typewriter** : uniquement pour les messages narratifs entrants (≤ 40 ms/caractère, sautable par clic/touche).
- **Révélation de concept** : la fiche découverte glisse depuis le journal avec un liseré `echo`.

`prefers-reduced-motion` ou réglage *Mouvement réduit* : toutes les durées → 0 ms sauf fondus ≤ 120 ms ; pas de typewriter.

## 7. Iconographie & signes
- **Lucide** (trait 1.5 px, 16/20 px). Cohérent avec Geist.
- Glyphes mono pour l'ambiance : `▍` curseur, `›` prompt, `◆` objectif, `◇` objectif optionnel, `●` statut, `⟶` corrélation.
- Logotype : « ECHO TRACE » en Geist Mono 500, tracking `+0.32em`, avec la barre `▍` animée ; variante monogramme `E▍`.

## 8. Son (optionnel, désactivé par défaut)
Palette sonore discrète : clic de touche feutré (−30 dB), tick de succès, souffle grave pour les révélations. Volume global + mute dans les paramètres. Jamais de son pour une erreur de frappe.

## 9. Composants

Chaque composant : variantes, états (`default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`), accessibilité.

### 9.1 Button
| Variante | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| `primary` | `signal` | `void` | — | Action principale (1 par vue). |
| `secondary` | `raised` | `fg` | `line-strong` | Actions courantes. |
| `ghost` | transparent | `fg-muted` → `fg` | — | Barres d'outils. |
| `danger` | `danger-soft` | `danger-strong` | `danger-line` | Actions destructrices / choix à risque. |
Tailles : `sm` 28 px, `md` 34 px, `lg` 42 px. Raccourci clavier affiché via `<Kbd>` à droite.

### 9.2 Panel
Conteneur de niveau 1. En-tête 40 px : surtitre mono (classe `.eyebrow` — pas `.overline`, qui est un utilitaire Tailwind de soulignement ; `text-micro`, `fg-subtle`) + titre + actions à droite. Variante `scan` (animation scan line à la mise à jour).

### 9.3 Badge / Status
`neutral`, `signal`, `trace`, `echo`, `warn`, `danger`. Fond `-soft`, texte `-strong`, rayon `xs`, mono `text-xs`. Option point de statut pulsé.

### 9.4 Kbd
Mono 11 px, fond `raised`, bordure `line-strong`, ombre interne basse. Ex. `⌘K`, `Tab`.

### 9.5 Input / Command palette
Hauteur 34 px, fond `raised`, focus anneau `signal`. Palette (`⌘K` / `Ctrl K`) : overlay verre, liste filtrable (commandes de jeu, fiches, missions).

### 9.6 Terminal (EchoTerm)
- Fond `deep`, texte `fg`, mono 13 px / 20 px (15/24 en lisibilité).
- Prompt : `operateur-7@echo-ws:~$` → user `trace`, `@` `fg-subtle`, host `signal`, chemin `echo`, `$` `fg-subtle`.
- Spans sémantiques : `muted`, `accent`(signal), `success`(trace), `warning`, `danger`, `concept`(echo, souligné pointillé, cliquable → fiche), `path`, `host`, `heading` (gras + majuscules mono).
- Curseur bloc `signal` clignotant 1 s (fixe si mouvement réduit).
- Sélection : `signal-soft`.
- Tableaux alignés (colonnes calculées par le moteur).

### 9.7 Objectif (mission)
Ligne : glyphe `◆`/`◇` + libellé + état. États : `locked` (faint), `active` (fg + glyphe signal), `done` (trace, barré léger non — on garde lisible, check), `failed` (danger). Animation de complétion : remplissage du glyphe + scan line.

### 9.8 Carte de fiche (Concept)
Overline catégorie (couleur `echo`), titre, résumé 2 lignes, jauge de maîtrise 3 segments (gradient echo).

### 9.9 Nœud réseau (graphe)
Pastille 40 px, rayon `md`, icône OS/rôle, IP en mono sous le libellé. Bordure selon statut : inconnu `line`, découvert `signal-line`, compromis/accédé `echo-line`, hostile `danger-line`, sécurisé `trace-line`. Arêtes 1 px `line-strong`, animées (pointillés en mouvement) quand un flux est observé.

### 9.10 Toast / Notification
Verre, en bas à droite, 360 px, icône + titre + texte, liseré gauche 2 px de la couleur sémantique. Auto-fermeture 5 s (sauf narratif).

### 9.11 Message (e-mail, chat)
Expéditeur en `fg`, adresse en mono `fg-subtle`, horodatage tabulaire. Les messages narratifs d'ECHO portent un liseré `echo` ; un expéditeur `inconnu` passe en mono + liseré `danger`.
Non lus : indicateur « en train d'écrire » (3 points pulsés) puis machine à écrire **séquentielle** (18 ms/caractère, 500 ms entre deux messages) ; clic ou touche pour passer ; instantané en mouvement réduit.

### 9.12 Drawer (panneau latéral)
Niveau 3 (verre), ancré à droite, 460 px max, liseré supérieur de la couleur du contexte (`echo` fiche, `signal` comms). Échap ferme ; à la fermeture le focus revient au terminal (`[data-terminal-input]`).

## 10. Thèmes & accessibilité

| Mode | Attribut | Différences |
|---|---|---|
| **Signal** (défaut) | `data-theme="signal"` | Tel que décrit. |
| **Haute lisibilité** | `data-theme="legible"` | Texte +2 px, `fg-subtle` remonté à `#8C96A6`, pas de verre ni de grain, bordures 12 %, terminal 15 px. |
| **Mouvement réduit** | `data-motion="reduced"` (+ media query) | Durées à 0. |

- Focus toujours visible (`:focus-visible`), navigation 100 % clavier.
- Terminal : `role="log"`, `aria-live="polite"` sur les nouvelles sorties.
- Couleur jamais seule porteuse d'information : glyphes + libellés.
- Cibles cliquables ≥ 28 px (UI dense desktop), ≥ 40 px en mode lisibilité.

## 11. Voix & micro-copie (UI)
- Tutoiement à l'intérieur d'ECHO (collègues), vouvoiement des institutions.
- Messages système courts, au présent, sans point d'exclamation. *« Hôte injoignable. Vérifie la route ou le pare-feu. »*
- Les erreurs du terminal indiquent toujours une piste : `commande introuvable — tape 'help'`.

## 12. Écrans clés
Wireframes détaillés : [`docs/design/SCREENS.md`](design/SCREENS.md).
