---
id: reseau.dns
title: DNS
category: reseau
summary: "Le DNS est l'annuaire d'Internet : il traduit un nom (intranet.chva.example) en adresse IP et publie d'autres informations utiles sur un domaine."
related: [reseau.adresse-ip, reconnaissance.whois, reconnaissance.transfert-zone, reconnaissance.pivot]
quiz:
  - q: "`dns portail.chva.example` renvoie un enregistrement CNAME vers `vpn.hebergeur.example`. Que peux-tu en conclure ?"
    choices: ["Le nom est un alias : le service est en réalité servi par une autre machine, peut-être chez un prestataire", "Le domaine n'existe pas", "Le serveur DNS est mal configuré"]
    answer: 0
    explain: "Un CNAME dit « ce nom est un autre nom ». Suivre l'alias révèle souvent un hébergeur ou un sous-traitant — une piste à documenter."
  - q: "Quelle différence entre une réponse NXDOMAIN et une réponse vide pour `dns labo.chva.example MX` ?"
    choices: ["Aucune, les deux veulent dire que le nom n'existe pas", "NXDOMAIN : le nom n'existe pas du tout. Réponse vide : le nom existe mais n'a pas d'enregistrement de ce type", "NXDOMAIN signifie que le serveur est en panne"]
    answer: 1
    explain: "Une réponse vide prouve que le nom existe (il a peut-être un A, mais pas de MX). C'est une information en soi."
  - q: Pourquoi l'interrogation DNS est-elle considérée comme de la reconnaissance « passive » ?
    choices: ["Parce qu'elle est illégale", "Parce qu'elle ne touche jamais aucun serveur", "Parce qu'on interroge un annuaire public sans toucher les machines de la cible elles-mêmes"]
    answer: 2
    explain: "On lit ce que l'organisation publie volontairement. Les serveurs de la cible ne voient pas forcément passer la requête (caches, résolveurs intermédiaires)."
---
## Définition
Les machines communiquent par adresses IP ; les humains retiennent des noms. Le **DNS** (*Domain Name System*) fait le lien : un résolveur interroge une chaîne de serveurs jusqu'à celui qui fait **autorité** sur le domaine.

Types d'enregistrements courants :
- **A** : nom → adresse IPv4 (`intranet.chva.example → 203.0.113.20`).
- **CNAME** : alias vers un autre nom.
- **MX** : serveurs de messagerie du domaine.
- **NS** : serveurs de noms qui font autorité.
- **TXT** : texte libre (vérifications de domaine, politiques e-mail…).

## Analogie
Un annuaire téléphonique : tu cherches « Hôpital — accueil », il te donne le numéro. Il dit aussi qui tient l'annuaire (NS) et où envoyer le courrier (MX).

## Dans le jeu
`dns <nom> [type]` (équivalent ECHO de `dig` ou `nslookup`) :
```
$ dns chva.example MX
chva.example.    3600  IN  MX  10 mail.chva.example.
```
- **NXDOMAIN** : le nom n'existe pas.
- **Réponse vide** : le nom existe, mais pas pour ce type.

## Côté défense
Tout ce qui est publié dans le DNS public est lisible par tout le monde. Ne pas y exposer de noms internes (`dev-`, `test-`, `admin-`) inutiles, séparer DNS interne et externe, surveiller les sous-domaines oubliés qui pointent vers des services abandonnés.
