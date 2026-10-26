---
id: reseau.adresse-ip
title: Adresse IP
category: reseau
summary: Une adresse IPv4 (ex. 10.7.0.7) identifie une interface sur un réseau. Le masque ou la notation CIDR (/24) dit quelle partie désigne le réseau.
related: [reseau.ping-icmp, reseau.port]
quiz:
  - q: Combien d'adresses contient le réseau `10.7.1.0/24` ?
    choices: ['24', '256', '65 536']
    answer: 1
    explain: '/24 = 24 bits pour le réseau, il reste 32 − 24 = 8 bits pour les hôtes : 2⁸ = 256 adresses (de .0 à .255).'
  - q: Laquelle de ces adresses est privée (non routée sur Internet) ?
    choices: [203.0.113.50, 10.7.0.7, 198.51.100.9]
    answer: 1
    explain: '`10.0.0.0/8`, `172.16.0.0/12` et `192.168.0.0/16` sont réservées aux réseaux privés.'
  - q: Pourquoi le jeu utilise-t-il des adresses comme `203.0.113.10` ?
    choices: [Elles sont plus rapides, Elles sont réservées à la documentation et n'appartiennent à personne, Ce sont des adresses de Corvane]
    answer: 1
    explain: 'Les plages RFC 5737 (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) servent aux exemples : aucune cible réelle.'
---
## Définition
Une adresse **IPv4** est composée de 4 octets : `10.7.1.10`. Elle se lit en deux parties :
- la partie **réseau** (le quartier),
- la partie **hôte** (le numéro de la maison).

La notation **CIDR** `10.7.1.0/24` signifie : les 24 premiers bits désignent le réseau → toutes les adresses de `10.7.1.0` à `10.7.1.255`. Le masque équivalent est `255.255.255.0`.

## Plages à connaître
- **Privées** (non routées sur Internet) : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
- **Documentation** : `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` — réservées aux exemples. Tout le jeu les utilise : aucune adresse d'Echo Trace n'existe réellement.
- `127.0.0.1` : la machine elle-même (*loopback*).

## Dans le jeu
`ifconfig` affiche tes adresses. Un poste relié à deux réseaux (*multi-homed*) a une adresse sur chacun.
