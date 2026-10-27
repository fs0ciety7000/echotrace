---
id: defense.filtrage
title: Filtrage & confinement réseau
category: defense
summary: "Bloquer une source au pare-feu coupe rapidement une attaque en cours. C'est réversible et utile, mais imparfait : l'adversaire peut changer d'adresse, et une règle trop large coupe aussi les utilisateur·rice·s légitimes."
related: [forensique.ioc, forensique.force-brute, defense.mfa, reseau.adresse-ip, ethique.proportionnalite, defense.surface-attaque]
quiz:
  - q: "Les tentatives contre `echo-mx` viennent de plusieurs adresses de `203.0.113.64/29`. Pourquoi bloquer la plage plutôt qu'une seule adresse ?"
    choices: ["Parce qu'un /29 couvre les 8 adresses utilisées par la même source : bloquer une seule IP laisserait passer les autres", "Parce que bloquer une seule adresse est impossible", "Parce qu'une plage plus large est toujours plus sûre"]
    answer: 0
    explain: "On ajuste la règle à ce qu'on observe : assez large pour couvrir l'attaquant, assez étroite pour ne pas toucher les autres."
  - q: "Pourquoi le blocage seul ne suffit-il pas à clore l'incident ?"
    choices: ["Parce que les règles de pare-feu expirent toutes seules", "Parce que l'adversaire peut revenir depuis une autre adresse, et qu'un identifiant déjà volé reste valable", "Il suffit, une fois l'adresse bloquée tout est réglé"]
    answer: 1
    explain: "Le filtrage gagne du temps. Il faut aussi changer les identifiants exposés, activer le MFA et chercher ce que l'intrus a pu faire avant le blocage."
  - q: "Un·e collègue propose de bloquer tout `203.0.0.0/8` « pour être tranquille ». Qu'en penses-tu ?"
    choices: ["Bonne idée, plus c'est large plus c'est sûr", "C'est sans effet sur les utilisateur·rice·s", "C'est disproportionné : des millions d'adresses légitimes seraient coupées pour arrêter une poignée de machines"]
    answer: 2
    explain: "Une règle trop large est elle-même un incident : partenaires, client·e·s ou collègues ne peuvent plus joindre le service. Proportionnalité, toujours."
---
## Définition
Le **filtrage** consiste à refuser le trafic venant d'une adresse ou d'une **plage** (notation CIDR : `203.0.113.64/29` = 8 adresses). En réponse à incident, c'est une mesure de **confinement** : on ne résout pas le problème, on l'empêche de s'aggraver le temps de comprendre et de corriger.

## Forces et limites
- **Rapide** : une règle s'applique en quelques secondes.
- **Réversible** : on peut la retirer si elle gêne ou n'est plus utile.
- **Imparfait** : l'adversaire peut changer d'adresse, passer par des relais, ou revenir plus tard.
- **Risqué si trop large** : bloquer un pays ou un opérateur entier coupe aussi des personnes légitimes.

## Dans le jeu
```
$ fw block 203.0.113.64/29
✓ Trafic de 203.0.113.64/29 bloqué sur echo-mx.
› Pense à documenter la règle (qui, quand, pourquoi) et à la réévaluer. Filtrage
$ fw list
PARE-FEU · echo-mx
DROP  203.0.113.64/29  ajoutée par admin-op7
```
›  `fw` refuse les plages démesurées (`/0` à `/7`) : tu couperais tout le trafic légitime.

## Côté défense
- **Documenter chaque règle** : qui l'a ajoutée, quand, pourquoi, et quand la réévaluer. Une règle orpheline devient un mystère dans six mois.
- **Compléter** le blocage : changer les identifiants exposés, activer le **MFA**, ajouter les adresses aux **IoC** et vérifier les journaux d'avant le blocage.
- **Surveiller** le retour de l'adversaire depuis d'autres adresses.

## Éthique
Le filtrage est **défensif** : on protège ses propres machines, celles qu'on administre. On ne « riposte » pas contre l'adresse d'en face — elle peut appartenir à une victime dont la machine est détournée.
