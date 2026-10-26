---
id: reseau.adresse-ip
title: Adresse IP
category: reseau
summary: Une adresse IPv4 (ex. 10.7.0.7) identifie une interface sur un réseau. Le masque ou la notation CIDR (/24) dit quelle partie désigne le réseau.
related: [reseau.ping-icmp, reseau.port]
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
