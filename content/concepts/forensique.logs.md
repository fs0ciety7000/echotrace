---
id: forensique.logs
title: Journaux (logs)
category: forensique
summary: Les journaux consignent ce qui se passe sur un système, horodaté. Ils sont la mémoire de l'enquêteur — et la première cible de l'intrus qui veut effacer ses traces.
related: [systeme.ssh]
quiz:
  - q: 'Dans `Accepted password for stagiaire from 10.7.0.66 port 40226`, que représente 10.7.0.66 ?'
    choices: [Le serveur, La machine d'où vient la connexion, Le port utilisé]
    answer: 1
    explain: '« from » désigne la source. Le serveur est celui qui écrit le journal (banc-01).'
  - q: Deux « Failed password for root » suivis d'un « Accepted » pour un autre compte, depuis la même IP, à 3 h du matin. Que fais-tu ?
    choices: ["Rien, c'est du bruit", Tu relies ces lignes en chronologie et tu identifies la source, Tu effaces les lignes]
    answer: 1
    explain: Corréler (même IP, même créneau) et construire une chronologie est la base de l'analyse d'incident.
  - q: Pourquoi envoyer les journaux vers une machine centrale ?
    choices: [Pour gagner de la place, Un intrus qui efface les logs locaux ne peut pas effacer la copie, Pour les rendre publics]
    answer: 1
    explain: La centralisation (SIEM) protège la preuve et permet de corréler plusieurs machines.
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
