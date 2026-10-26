---
id: systeme.shell
title: Terminal & shell
category: systeme
summary: Le shell est un programme qui lit tes commandes, les exécute et affiche leur résultat. Le terminal est la fenêtre qui l'héberge.
related: [systeme.fichiers]
---
## Définition
Un **shell** (bash, zsh…) est un interpréteur : il lit une ligne de texte, la découpe en mots (la commande puis ses arguments), lance le programme correspondant et affiche sa sortie. Le **terminal** n'est que l'écran et le clavier autour.

## Analogie
Le shell est un standardiste : tu lui dis « nmap, banc-01 », il appelle le bon service et te répète la réponse.

## Anatomie d'une commande
- `nmap -sV banc-01` → commande `nmap`, option `-sV`, argument `banc-01`.
- `cat auth.log | grep Failed` → le **pipe** `|` envoie la sortie de la première commande dans l'entrée de la seconde.

## Dans le jeu
Le terminal d'ECHO simule un shell Linux. `help` liste les commandes, `man <commande>` les détaille, `Tab` complète, `↑` rappelle l'historique.

## Côté défense
L'historique du shell (`history`, `~/.bash_history`) est une trace précieuse en forensique : il raconte ce qu'un intrus a tapé.
