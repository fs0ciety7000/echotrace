---
id: reseau.beacon
title: Beacon (« chant »)
category: reseau
summary: "Un implant contacte régulièrement son serveur de commande pour recevoir des ordres. Cette régularité est aussi sa faiblesse : elle se voit. Chez ECHO, on appelle ça un « chant »."
related: [reseau.port, forensique.persistance, reseau.certificat-tls, forensique.ioc]
quiz:
  - q: "Pourquoi un implant initie-t-il la connexion vers l'extérieur plutôt que d'attendre qu'on le contacte ?"
    choices: ["Parce que les pare-feu laissent généralement sortir le trafic alors qu'ils bloquent les connexions entrantes", "Parce que c'est plus rapide", "Parce que le serveur de commande n'a pas d'adresse IP"]
    answer: 0
    explain: "Les connexions sortantes (vers le web) sont rarement bloquées. L'implant « appelle à la maison »."
  - q: "`netstat` montre toutes les 300 secondes, à quelques secondes près, une connexion de `fs-01` vers `203.0.113.200:8443`. Qu'est-ce qui doit t'alerter ?"
    choices: ["Le port 443, qui est toujours malveillant", "La régularité quasi parfaite vers une destination inconnue, depuis un serveur qui n'a aucune raison de naviguer", "Rien, c'est du HTTPS donc c'est sûr"]
    answer: 1
    explain: "Le 443 est banal. Ce qui trahit le chant, c'est le rythme mécanique et l'incohérence avec le rôle de la machine."
  - q: "L'intervalle varie entre 240 et 360 secondes. Est-ce que cela innocente la connexion ?"
    choices: ["Oui, un implant serait parfaitement régulier", "Oui, car un humain ne travaille pas ainsi", "Non : beaucoup d'implants ajoutent un aléa (gigue) ; l'intervalle moyen reste stable sur la durée"]
    answer: 2
    explain: "La gigue brouille la régularité à court terme, mais sur des heures ou des jours, la périodicité ressort."
---
## Définition
Un **beacon** est la connexion périodique qu'un implant établit vers son **serveur de commande** (C2) : « je suis toujours là, as-tu des ordres ? ». Le reste du temps, il dort — ce qui le rend discret.

Dans le jargon ECHO, les beacons des implants HOLLOW CHOIR sont des **chants** : ils reviennent, toujours sur le même air.

## Analogie
Quelqu'un qui passe un coup de fil très bref au même numéro toutes les cinq minutes, jour et nuit. Chaque appel est anodin ; la régularité, non.

## Dans le jeu
```
$ netstat -tunap
Proto  Local Address      Foreign Address     State        PID/Program
tcp    0.0.0.0:22         0.0.0.0:*           LISTEN       455/sshd
tcp    10.40.1.10:43918   203.0.113.200:8443  ESTABLISHED  1442/sysupd
```
Répété dans le temps, ça donne : 02:41, 02:46, 02:51, 02:56… Le serveur d'imagerie médicale n'a aucune raison de contacter ce serveur.

## Côté défense
- Filtrer la sortie : un serveur n'a besoin que de quelques destinations connues.
- Chercher la **périodicité** dans les journaux de pare-feu et de proxy (même source, même destination, intervalle stable).
- Croiser la destination avec les IoC connus ; examiner son **certificat TLS**.
- Avant de couper : décider en connaissance de cause (voir *Proportionnalité*).
