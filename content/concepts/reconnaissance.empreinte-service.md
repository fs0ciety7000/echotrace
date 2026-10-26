---
id: reconnaissance.empreinte-service
title: Empreinte de service
category: reconnaissance
summary: En dialoguant avec un port ouvert, on obtient souvent le nom et la version exacte du logiciel — la « bannière ». Une version révèle les failles connues.
related: [reconnaissance.scan-de-ports, defense.surface-attaque]
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
