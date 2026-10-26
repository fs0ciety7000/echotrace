---
id: defense.surface-attaque
title: Surface d'attaque
category: defense
summary: L'ensemble de ce qu'un adversaire peut atteindre — ports, services, comptes, versions. La réduire est le premier geste défensif.
related: [reseau.port, reconnaissance.empreinte-service]
---
## Définition
La **surface d'attaque** d'un système regroupe tous ses points d'entrée possibles : services exposés, comptes, logiciels obsolètes, interfaces d'administration, humains.

## Exemple sur le Banc
`banc-02` expose FTP (21), Telnet (23, non chiffré !) et un Apache de 2014 sur un Ubuntu en fin de vie. Chaque élément est une porte supplémentaire.

## Réduire la surface
- Désactiver les services inutiles.
- Remplacer les protocoles en clair (Telnet, FTP) par leurs équivalents chiffrés (SSH, SFTP).
- Mettre à jour, segmenter le réseau, filtrer.

## Réflexe d'analyste
Faire régulièrement **son propre scan** : connaître sa surface avant l'adversaire.
