---
id: forensique.ioc
title: Indicateurs de compromission (IoC)
category: forensique
summary: "Les IoC sont des traces techniques concrètes d'une attaque (IP, domaines, empreintes de fichiers ou de certificats). Partagés, ils permettent à d'autres de se détecter — mais ils vieillissent vite."
related: [reconnaissance.pivot, reseau.certificat-tls, reseau.beacon, forensique.persistance, forensique.logs]
quiz:
  - q: "Pourquoi une adresse IP est-elle un indicateur fragile ?"
    choices: ["Parce qu'elle est trop longue à recopier", "Parce que l'adversaire peut en changer facilement, et qu'elle peut être réattribuée à un tiers innocent", "Parce que les IP sont toujours falsifiées"]
    answer: 1
    explain: "Une IP louée pour quelques jours peut ensuite héberger un service légitime. Bloquer aveuglément d'anciens IoC crée des faux positifs."
  - q: "Quel IoC désigne exactement le même fichier malveillant, où qu'il se trouve ?"
    choices: ["Le nom du fichier", "Sa taille", "Son empreinte (hash) SHA-256"]
    answer: 2
    explain: "Un nom se change en une seconde. L'empreinte change si un seul octet change : elle identifie précisément ce fichier-là."
  - q: Pourquoi ECHO partage-t-elle les IoC de l'affaire de Vallon-sur-Aire avec d'autres établissements ?
    choices: ["Pour qu'ils vérifient s'ils sont touchés et bloquent la même infrastructure", "Pour accuser publiquement un coupable", "Pour prouver la compétence d'ECHO"]
    answer: 0
    explain: "Un hôpital peut être un cas parmi d'autres. Partager les indicateurs (sans données de patient·es) aide les autres victimes potentielles."
---
## Définition
Un **indicateur de compromission** est une donnée observable qui signale une intrusion :
- **Réseau** : adresses IP, noms de domaine, URL de commande.
- **Fichiers** : empreintes (SHA-256) d'exécutables malveillants, chemins inhabituels.
- **Certificats** : empreintes de certificats utilisés par l'adversaire.
- **Système** : tâches planifiées, noms de services, clés ajoutées.

## Dans le jeu
Les IoC de l'Acte I :
```
ip       203.0.113.80
domain   update-svc.lan
cert     SHA-256 4F:A1:9C:…:7E:22
file     /tmp/.cache/upd   sha256 9b0e…41c3
```
Chaque IoC rejoint le **Dossier**, avec sa source et sa date d'observation.

## Fragilité
Tous les IoC ne se valent pas : changer d'IP ou de domaine est facile pour l'adversaire, recompiler un fichier aussi. Changer de **méthode** est bien plus coûteux. D'où l'intérêt de compléter les IoC par la détection de **comportements** (un chant régulier, une rafale d'échecs suivie d'un succès).

## Côté défense
- Partager dans un format structuré, avec contexte et date (« vu le 14/11 sur un serveur de C2 »).
- Donner une durée de vie aux indicateurs réseau.
- Rechercher les IoC reçus dans ses propres journaux, y compris dans le passé.
