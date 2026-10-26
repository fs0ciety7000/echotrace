# ADR-0002 — Terminal maison (EchoTerm) plutôt que xterm.js

- Statut : accepté
- Date : 2026-10-26

## Contexte
Le terminal est l'interface principale. Il n'y a pas de PTY réel : toutes les commandes sont simulées par le moteur.

## Options
1. **xterm.js** : rendu VT100 fidèle, très performant, mais sortie = flux ANSI. Liens riches, tooltips, accessibilité lecteur d'écran et typographie proportionnelle difficiles.
2. **Composant DOM maison** : sortie structurée (`OutputLine` / `Span`) rendue en React.

## Décision
Option 2. Le moteur renvoie des spans sémantiques ; EchoTerm les rend avec les tokens du design system, rend cliquables les concepts (ouvre la fiche), chemins et hôtes, et reste accessible (`role="log"`, `aria-live`).

## Conséquences
- + Pédagogie intégrée au flux du terminal (concepts surlignés, cliquables).
- + Mode haute lisibilité trivial.
- − Pas d'applications plein écran type `vim`/`top` (non souhaitées ; un « viewer » dédié couvrira la lecture de gros fichiers).
- − Virtualisation de la liste à prévoir si l'historique dépasse quelques milliers de lignes (plafond de scrollback en attendant).
