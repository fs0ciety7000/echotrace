---
id: ethique.autorisation
title: Autorisation & périmètre
category: ethique
summary: La même commande est un audit si elle est autorisée et une infraction si elle ne l'est pas. Le périmètre (scope) écrit fait toute la différence.
related: [reconnaissance.scan-de-ports]
quiz:
  - q: Qu'est-ce qui distingue un audit de sécurité d'une intrusion ?
    choices: [Les outils utilisés, L'autorisation et le périmètre convenus par écrit, L'intention de ne rien casser]
    answer: 1
    explain: La même commande est légitime ou illégale selon qu'elle est autorisée. L'intention ne suffit pas.
  - q: Pendant une mission, tu repères une machine intéressante hors périmètre. Que fais-tu ?
    choices: [Tu la scannes discrètement, Tu la documentes et tu demandes une extension du périmètre, Tu l'ignores et tu n'en parles pas]
    answer: 1
    explain: On signale et on demande. Sortir du périmètre peut nuire à des tiers et rendre tes preuves inutilisables.
---
## Principe
Un test de sécurité légitime repose sur un **accord écrit** : quelles machines, quelles techniques, quelle période, qui contacter en cas de problème. C'est le **périmètre** (*scope*) ou les **règles d'engagement**.

## Pourquoi c'est central chez ECHO
> Une preuve obtenue illégalement est une preuve perdue. — Doctrine ECHO, règle 3

Au-delà du droit, sortir du périmètre peut **nuire à des tiers** : un scan agressif peut faire tomber un vieil équipement médical.

## Dans le jeu
Le Banc est entièrement autorisé. Dans les opérations, le briefing précise toujours ce qui l'est — et tes choix hors périmètre auront des conséquences.

## Pour aller plus loin
Programmes de *bug bounty*, divulgation coordonnée des vulnérabilités, cadre légal de ton pays.
