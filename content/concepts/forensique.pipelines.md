---
id: forensique.pipelines
title: Pipelines d'analyse
category: forensique
summary: "Enchaîner de petites commandes avec | (grep, cut, sort, uniq, head, wc) transforme des milliers de lignes de journal en un classement lisible."
related: [systeme.shell, forensique.logs, forensique.force-brute, forensique.chronologie]
quiz:
  - q: "Pourquoi faut-il `sort` avant `uniq -c` ?"
    choices: ["Parce que uniq ne fusionne que les lignes identiques consécutives", "Pour aller plus vite", "Parce que uniq ne lit que des fichiers triés par date"]
    answer: 0
    explain: "Sans tri, la même IP répartie dans le fichier serait comptée en plusieurs morceaux. Le tri regroupe les doublons côte à côte."
  - q: "Que fait `sort -rn` après `uniq -c` ?"
    choices: ["Il supprime les doublons", "Il trie numériquement, du plus grand au plus petit, sur le compteur", "Il inverse chaque ligne"]
    answer: 1
    explain: "-n = numérique (10 après 9, pas après 1), -r = ordre inverse. Les sources les plus fréquentes remontent en tête."
  - q: "`grep 'Failed password' auth.log | wc -l` renvoie 1 284. Que sais-tu ?"
    choices: ["Qu'une seule IP a échoué 1 284 fois", "Que 1 284 comptes existent", "Qu'il y a 1 284 lignes d'échec, sans savoir encore d'où elles viennent"]
    answer: 2
    explain: "wc -l compte des lignes. Pour savoir qui, il faut extraire l'IP et la compter par source."
---
## Définition
Le symbole `|` (*pipe*) envoie la sortie d'une commande dans l'entrée de la suivante. Chaque outil fait **une seule chose** ; ensemble, ils répondent à une question.

| Outil | Rôle |
|---|---|
| `grep` | garder les lignes qui contiennent un motif |
| `cut` / `awk` | extraire une colonne |
| `sort` | trier (regroupe les doublons) |
| `uniq -c` | compter les lignes identiques **consécutives** |
| `sort -rn` | classer par compteur décroissant |
| `head` | garder les premières lignes |
| `wc -l` | compter les lignes |

## Dans le jeu
Question : *quelles sources ont le plus échoué à se connecter ?*
```
$ grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -3
    912 198.51.100.23
    301 198.51.100.24
     12 10.40.0.23
```
›  Deux adresses externes concentrent presque tous les échecs.

## Méthode
Construis le pipeline **pas à pas** : ajoute une commande, regarde la sortie, puis la suivante. Vérifie quelle colonne tu extrais : le format d'une ligne peut varier (« invalid user » décale les champs).

## Côté défense
Ce sont les gestes de base de l'analyste. Un SIEM fait la même chose à grande échelle, mais savoir le faire à la main permet de vérifier une alerte et de comprendre ce qu'elle compte vraiment.
