# ACCESSIBILITÉ — audit WCAG 2.1 AA

Dernier audit : octobre 2026 (Phase 3). À refaire à chaque nouvel écran ou composant.

## 1. Méthode
- **Automatique** : axe-core 4.10 injecté par Playwright (Chromium), règles `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` et `best-practice`, sur les 13 états d'interface : menu, Paramètres, Banc, briefing, poste opérateur (terminal), panneau Messages, vue réseau, Dossier, journal, fiche, débrief, décision, épilogue. Thème par défaut **et** thème « lisible ».
- **Clavier** : parcours au Tab de chaque écran, ouverture/fermeture des modales et panneaux, focus visible sur chaque élément atteint.
- **Reflow** (1.4.10) : 320 × 640 px, aucun défilement horizontal.
- **Mouvement** : `prefers-reduced-motion` et réglage « Réduire les animations » (voir `DESIGN_SYSTEM.md` §10).

## 2. Résultat
**0 violation axe** sur les 13 états, dans les deux thèmes, après corrections.

| Problème trouvé | Critère | Correction |
|---|---|---|
| `fg-subtle` (#6C7686) à 3,8–4,0:1 sur les surfaces, utilisé pour des textes de 11–12 px | 1.4.3 | Token relevé à **#808A9B** (≥ 4,6:1 sur toutes les surfaces, y compris `overlay`) |
| Textes informatifs en `fg-faint` (fiches non découvertes, ports, objectifs verrouillés, raccourcis du terminal) | 1.4.3 | Passés en `fg-subtle` ; `fg-faint` réservé aux éléments désactivés |
| Pas de titre `h1` sur le poste opérateur | 1.3.1 / bonne pratique | `h1` masqué visuellement : « Vue — Opération » |
| Ordre des titres du journal (`h3` sans `h2`) | 1.3.1 | Catégories en `h2` |
| **Piège clavier** : Tab réservé à la complétion du terminal | 2.1.2 | Shift+Tab, ou Tab sur une ligne vide, quitte le terminal ; consigne lue par les lecteurs d'écran (`aria-describedby`) |
| Panneaux latéraux (Messages, fiche) : le focus restait sur le bouton d'ouverture | 2.4.3 | Le focus entre dans le panneau à l'ouverture et revient au terminal à la fermeture |
| Bouton actif du rail non annoncé | 4.1.2 | `aria-current="page"` |
| Épilogue : le débrief pouvait se rouvrir par-dessus (minuterie de 900 ms) et garder le focus | 2.4.3 | Débrief automatique une seule fois par mission, seulement sur l'écran de la mission ; focus sur le titre de la fin |
| Barre d'état : 3 px de débordement à 320 px | 1.4.10 | Nom d'hôte tronqué, espacements réduits sous `sm` |

## 3. Ce qui était déjà en place
- Sortie du terminal en `role="log"` + `aria-live="polite"` ; toasts en `aria-live` ; frappe des messages annoncée (`role="status"`).
- Modales natives `<dialog>` (piège de focus et Échap natifs), action principale focalisée (`data-autofocus`).
- Focus visible (`:focus-visible`, anneau `line-focus`) sur tous les contrôles.
- Graphes (vue réseau, Dossier) : chaque action a un équivalent clavier — liste des hôtes du panneau « Réseau connu », formulaire « Relier deux pièces » à listes déroulantes, commande `dossier` au terminal.

## 4. Limites connues / à faire
- Pas encore de test avec de vrais lecteurs d'écran (NVDA, VoiceOver) : la sortie du terminal en `aria-live` peut être verbeuse sur les longues commandes (`nmap` sur un réseau).
- Les nœuds des graphes xyflow eux-mêmes ne sont pas parcourables au clavier (alternatives ci-dessus).
- L'audit axe n'est pas encore en CI : il tourne avec Playwright en local (script à intégrer à `pnpm run check` quand axe-core sera ajouté aux dépendances de dev).
