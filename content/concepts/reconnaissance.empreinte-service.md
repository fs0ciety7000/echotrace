---
id: reconnaissance.empreinte-service
title: Empreinte de service
category: reconnaissance
summary: En dialoguant avec un port ouvert, on obtient souvent le nom et la version exacte du logiciel — la « bannière ». Une version révèle les failles connues.
related: [reconnaissance.scan-de-ports, defense.surface-attaque]
quiz:
  - q: Pourquoi connaître la version exacte d'un service est-il crucial ?
    choices: [Pour savoir quand redémarrer la machine, Pour la comparer aux vulnérabilités connues (CVE), Pour deviner le mot de passe]
    answer: 1
    explain: Une version précise se recoupe avec les bases publiques de vulnérabilités — côté attaque comme côté défense.
  - q: 'D''où vient la ligne `SSH-2.0-OpenSSH_9.2p1 Debian-2+deb12u3` ?'
    choices: [Du fichier /etc/hostname, De la bannière que le service envoie lui-même, D'un journal d'erreurs]
    answer: 1
    explain: "Beaucoup de services se présentent spontanément à la connexion : c'est la bannière."
  - q: Côté défense, la mesure la plus efficace face au fingerprinting est…
    choices: [Masquer la version, Maintenir les services à jour et savoir ce qu'on expose, Changer de port]
    answer: 1
    explain: Masquer la version gêne un peu ; patcher et inventorier protègent vraiment.
---
## Définition
Le **fingerprinting** consiste à identifier précisément ce qui écoute derrière un port. Beaucoup de services se présentent spontanément :

```
SSH-2.0-OpenSSH_9.2p1 Debian-2+deb12u3
```

`nmap -sV` envoie des sondes et compare les réponses à une base de signatures.

## Pourquoi c'est crucial
Une version précise se compare aux bases publiques de vulnérabilités (**CVE**). Un `vsftpd 2.3.4` ou un `Apache 2.4.7` sur `Ubuntu 14.04` raconte une machine oubliée depuis des années.

## Côté défense
- Tenir un **inventaire** de ce qu'on expose (avant que quelqu'un d'autre le fasse).
- Mettre à jour. Masquer la version aide un peu ; patcher aide beaucoup.
