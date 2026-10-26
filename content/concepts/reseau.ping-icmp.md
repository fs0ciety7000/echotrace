---
id: reseau.ping-icmp
title: Ping & ICMP
category: reseau
summary: ping envoie des paquets ICMP echo request et mesure les réponses. Pas de réponse ne signifie pas machine éteinte — l'ICMP est souvent filtré.
related: [reseau.adresse-ip, reconnaissance.scan-de-ports]
---
## Définition
**ICMP** est le protocole de « service » d'IP (messages d'erreur, diagnostics). `ping` envoie des *echo request* et attend des *echo reply* ; il mesure le temps aller-retour (**latence**).

## Le piège classique
Beaucoup de pare-feu **bloquent l'ICMP**. Une machine peut donc :
- ne pas répondre au ping,
- et pourtant offrir des services sur certains ports.

C'est pourquoi `nmap` propose `-Pn` : « ne fais pas confiance au ping, scanne quand même ».

## Dans le jeu
`ping banc-01`, `ping -c 2 10.7.1.10`.

## Côté défense
Bloquer l'ICMP rend une machine moins visible aux balayages naïfs, mais ce n'est **pas** une protection : c'est de la discrétion, pas de la sécurité.
