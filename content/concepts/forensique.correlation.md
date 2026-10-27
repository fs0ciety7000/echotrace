---
id: forensique.correlation
title: Corrélation d'indicateurs
category: forensique
summary: "Corréler, c'est chercher une liste d'indicateurs connus dans les traces d'une autre organisation. Une seule correspondance est une piste ; plusieurs correspondances indépendantes font un dossier."
related: [forensique.ioc, forensique.logs, forensique.chronologie, ethique.attribution, reconnaissance.pivot, forensique.rapport]
quiz:
  - q: "Dans les journaux d'un opérateur, tu trouves une seule connexion vers une adresse de ta liste d'indicateurs. Que peux-tu conclure ?"
    choices: ["L'opérateur est compromis par le même adversaire, c'est certain", "C'est une piste à vérifier : l'adresse a pu être réattribuée ou contactée pour une raison légitime", "Rien du tout, une seule correspondance ne vaut jamais rien"]
    answer: 1
    explain: "Une correspondance isolée mérite qu'on creuse (quand ? depuis quelle machine ? quel programme ?), mais elle ne prouve rien seule. Ni conclusion hâtive, ni indifférence."
  - q: "Pourquoi la combinaison « même processus `/var/tmp/.cache/sysupd` + même destination `203.0.113.200:8443` » pèse-t-elle plus qu'un seul indicateur ?"
    choices: ["Parce que deux indicateurs de nature différente qui pointent vers la même chose ont peu de chances de coïncider par hasard", "Parce que deux indicateurs font toujours une preuve juridique", "Parce qu'un nom de fichier est plus fiable qu'une adresse"]
    answer: 0
    explain: "Un fichier sur disque et une connexion réseau sont des observations indépendantes. Leur concordance réduit fortement le risque de faux positif."
  - q: "Ta recherche du nom `sysupd` remonte 40 résultats chez l'opérateur, dont 38 dans un dossier de mises à jour officiel. Quel est le problème ?"
    choices: ["Aucun, 40 résultats montrent l'ampleur de l'intrusion", "Le moteur de recherche est en panne", "Un nom de fichier seul est un indicateur faible : il produit des faux positifs qu'il faut écarter en vérifiant le chemin, l'empreinte et le contexte"]
    answer: 2
    explain: "Un nom générique peut être légitime ailleurs. On affine avec le chemin exact, l'empreinte du fichier et le comportement observé avant de compter une correspondance."
---
## Définition
La **corrélation** consiste à confronter une liste d'**indicateurs connus** (adresses IP, domaines, noms et empreintes de fichiers, empreintes de certificats) aux traces d'un autre système : journaux, exports de pare-feu, listes de processus. Le but : savoir si le même adversaire est passé par là.

## Analogie
Un·e enquêteur·rice a relevé une empreinte de chaussure, un type de voiture et une heure de passage. Retrouver une seule de ces traces ailleurs ne dit pas grand-chose ; les trois au même endroit, c'est une piste sérieuse.

## Dans le jeu
La liste d'ECHO issue des actes précédents :
```
domain   edge-sync.example
ip       203.0.113.200
range    203.0.113.64/29
file     /var/tmp/.cache/sysupd
cert     SHA-256 5B:A9:BC:…:BC:BC
```
Chez Réseau Électrique du Val, le poste d'ingénierie `ews-02` (10.60.0.12) fait tourner `/var/tmp/.cache/sysupd -i 300` et son trafic sort vers `203.0.113.200:8443` : le même **chant** qu'à l'Acte I. Deux indicateurs indépendants, plus un comportement identique (un appel toutes les 300 secondes).

## Faux positifs
- **Indicateurs faibles** : un nom de fichier ou une adresse IP peuvent être légitimes ailleurs ou réattribués.
- **Indicateurs périmés** : une adresse utilisée il y a deux ans peut aujourd'hui héberger un service sain.
- **Recherche trop large** : chercher `sync` au lieu de `edge-sync.example` remonte n'importe quoi.

## Côté défense
- Noter pour chaque correspondance **où**, **quand** et **dans quelle source** elle a été trouvée.
- Chercher aussi dans le **passé** : la première apparition date souvent l'intrusion.
- Distinguer une correspondance isolée (piste) de plusieurs correspondances **indépendantes** (dossier).

## Éthique
Corréler sur les données d'une autre organisation se fait **avec son accord** et sur ce qu'elle choisit de partager. Une correspondance dit « même infrastructure », pas « même coupable » : voir l'attribution.
