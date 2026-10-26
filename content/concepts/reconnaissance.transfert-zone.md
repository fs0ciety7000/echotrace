---
id: reconnaissance.transfert-zone
title: Transfert de zone
category: reconnaissance
summary: "Un transfert de zone copie tout le contenu DNS d'un domaine d'un serveur de noms à un autre. Ouvert à n'importe qui, il livre la carte complète du réseau."
related: [reseau.dns, defense.surface-attaque, reconnaissance.whois]
quiz:
  - q: À quoi sert normalement un transfert de zone ?
    choices: ["À publier la zone sur Internet", "À synchroniser un serveur de noms secondaire avec le primaire", "À chiffrer les réponses DNS"]
    answer: 1
    explain: "C'est un mécanisme de réplication légitime entre serveurs de noms d'une même organisation."
  - q: "`dns audit chva.example` signale que `ns2.chva.example` accepte les transferts de zone depuis n'importe quelle adresse. Pourquoi est-ce un problème ?"
    choices: ["Parce que cela ralentit le DNS", "Parce que n'importe qui peut obtenir d'un coup la liste de tous les noms et adresses du domaine, y compris internes", "Ce n'est pas un problème, ces données sont déjà publiques"]
    answer: 1
    explain: "Sans transfert, il faut deviner les noms un par un. Avec, on reçoit la carte entière — y compris des machines qui n'auraient jamais dû être visibles."
  - q: Quelle est la bonne correction ?
    choices: ["Désactiver complètement le DNS", "Changer le nom du domaine", "Restreindre les transferts aux seuls serveurs secondaires autorisés (liste d'adresses, voire authentification)"]
    answer: 2
    explain: "On garde la réplication, mais uniquement vers les serveurs prévus. Bonus : séparer les noms internes dans une zone non publiée."
---
## Définition
Un domaine a souvent plusieurs serveurs de noms. Le **primaire** détient la zone (tous les enregistrements) ; les **secondaires** en reçoivent une copie complète par **transfert de zone**. C'est normal et utile — **entre ces serveurs-là**.

## Analogie
L'annuaire interne de l'hôpital est photocopié pour l'accueil du bâtiment B. Normal. Mais si l'accueil le photocopie pour n'importe quel passant, tout le monde connaît le numéro de la pharmacie, des blocs et de la salle serveur.

## Dans le jeu
L'outil d'audit ECHO teste la configuration sans rien modifier :
```
$ dns audit chva.example
ns1.chva.example   transfer: refused     OK
ns2.chva.example   transfer: ALLOWED     ⚠ zone listée (42 enregistrements)
›  ns2 répond à n'importe qui : mauvaise configuration.
```
La zone obtenue révèle des noms comme `pacs-legacy.chva.example` ou `vpn-test.chva.example` : de nouvelles pistes.

## Côté défense
- Autoriser les transferts **uniquement** vers les adresses des secondaires (et idéalement les authentifier par clé partagée).
- Ne pas publier de noms internes dans la zone publique (DNS « split-horizon »).
- Auditer chaque serveur de noms, pas seulement le primaire : l'erreur est souvent sur un secondaire oublié.

## Éthique
Lire une zone mal protégée n'est pas « rien » : hors mission autorisée, c'est collecter des données qu'on ne t'a pas confiées. Dans un audit, on le signale et on aide à corriger.
