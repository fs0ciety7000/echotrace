---
id: reseau.ping-icmp
title: Ping & ICMP
category: reseau
summary: ping envoie des paquets ICMP echo request et mesure les réponses. Pas de réponse ne signifie pas machine éteinte — l'ICMP est souvent filtré.
related: [reseau.adresse-ip, reconnaissance.scan-de-ports]
quiz:
  - q: '`ping 10.7.0.66` : 100 % de perte. Que peux-tu conclure ?'
    choices: [La machine est éteinte, Rien de certain — l'ICMP est peut-être filtré, L'adresse n'existe pas]
    answer: 1
    explain: Un pare-feu peut bloquer l'ICMP alors que des services restent joignables. C'est exactement le cas de iris-ws.
  - q: Que mesure le `time=` dans une réponse de ping ?
    choices: [La durée de vie du paquet, Le temps aller-retour (latence), L'heure de la machine distante]
    answer: 1
    explain: C'est le RTT, le délai entre l'envoi de l'echo request et la réception de l'echo reply.
  - q: Quelle option de nmap scanne un hôte même s'il ne répond pas au ping ?
    choices: [-sn, -Pn, -sV]
    answer: 1
    explain: '`-Pn` saute la découverte d''hôte. À l''inverse, `-sn` fait uniquement la découverte.'
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
