---
id: forensique.logs
title: Journaux (logs)
category: forensique
summary: Les journaux consignent ce qui se passe sur un système, horodaté. Ils sont la mémoire de l'enquêteur — et la première cible de l'intrus qui veut effacer ses traces.
related: [systeme.ssh]
---
## Définition
Un **journal** est un fichier où un programme écrit un événement par ligne : date, machine, programme, message.

```
Mar 14 03:12:09 banc-01 sshd[2091]: Accepted password for stagiaire from 10.7.0.66 port 40226 ssh2
```
→ *quand*, *où*, *quoi*, *qui*, *depuis où*.

## Où les trouver (Linux)
- `/var/log/auth.log` : authentifications (SSH, sudo).
- `/var/log/syslog` : événements système.
- `/var/log/nginx/access.log` : requêtes web.

## Méthode
1. Filtrer : `grep Failed`, `grep Accepted`.
2. Corréler : même IP ? même horaire que l'incident ?
3. Construire une **chronologie**.

## Côté défense
Envoyer les journaux vers une machine centrale (SIEM) : un intrus qui efface les logs locaux ne peut pas effacer la copie.
