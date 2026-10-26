---
id: reseau.port
title: Port
category: reseau
summary: Un port (0–65535) identifie un service sur une machine. L'IP dit « quel immeuble », le port dit « quel appartement ».
related: [reseau.adresse-ip, reconnaissance.scan-de-ports, defense.surface-attaque]
quiz:
  - q: Un scan indique `3306/tcp filtered`. Qu'est-ce que ça signifie ?
    choices: [Le port est ouvert et protégé par un mot de passe, Aucune réponse — un pare-feu bloque probablement, Le service est arrêté et la machine répond « rien ici »]
    answer: 1
    explain: '« filtered » = pas de réponse du tout. « closed » = la machine répond qu''il n''y a rien. « open » = un service répond.'
  - q: Quel service trouve-t-on par convention sur le port 443 ?
    choices: [SSH, HTTPS, DNS]
    answer: 1
    explain: 443 = HTTPS (web chiffré), 80 = HTTP, 22 = SSH, 53 = DNS.
  - q: Pourquoi fermer les ports inutilisés ?
    choices: [Pour accélérer le réseau, Pour réduire la surface d'attaque, Parce que la loi l'impose]
    answer: 1
    explain: Chaque port ouvert est une porte d'entrée possible. Moins de portes, moins de risques.
---
## Définition
Un programme serveur **écoute** sur un port TCP ou UDP. Les ports « bien connus » (0–1023) ont des usages conventionnels :

- `22` SSH · `21` FTP · `23` Telnet
- `25` SMTP (e-mail) · `53` DNS
- `80` HTTP · `443` HTTPS
- `3306` MySQL · `5432` PostgreSQL

Une convention, pas une règle : rien n'empêche de faire tourner SSH sur le port 2222.

## États vus par un scanner
- **open** : un service répond.
- **closed** : la machine répond « rien ici ».
- **filtered** : pas de réponse du tout — un pare-feu avale les paquets.

## Côté défense
Chaque port ouvert est une porte. Fermer ce qui ne sert pas réduit la **surface d'attaque**.
