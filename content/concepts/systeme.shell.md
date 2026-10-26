---
id: systeme.shell
title: Terminal & shell
category: systeme
summary: Le shell est un programme qui lit tes commandes, les exécute et affiche leur résultat. Le terminal est la fenêtre qui l'héberge.
related: [systeme.fichiers]
quiz:
  - q: Dans `nmap -sV banc-01`, quel est le rôle de `-sV` ?
    choices: [C'est la commande, C'est une option qui modifie le comportement de la commande, C'est la machine cible]
    answer: 1
    explain: Le premier mot est la commande (`nmap`), les mots commençant par `-` sont des options, le reste des arguments (ici la cible).
  - q: Que fait `cat auth.log | grep Failed` ?
    choices: [Il exécute les deux commandes l'une après l'autre sans lien, Il envoie la sortie de `cat` dans l'entrée de `grep`, Il écrit le résultat dans un fichier nommé grep]
    answer: 1
    explain: Le pipe `|` branche la sortie d'une commande sur l'entrée de la suivante. `grep` filtre donc le contenu affiché par `cat`.
  - q: Pourquoi l'historique du shell intéresse-t-il un enquêteur ?
    choices: [Il contient les mots de passe chiffrés, Il raconte les commandes tapées par un utilisateur — ou un intrus, Il liste les ports ouverts]
    answer: 1
    explain: '`~/.bash_history` garde la trace des commandes saisies : une source précieuse en forensique (sauf s''il a été effacé, ce qui est aussi un indice).'
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
