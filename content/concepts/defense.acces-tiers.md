---
id: defense.acces-tiers
title: Accès des prestataires
category: defense
summary: "Un prestataire de maintenance qui se connecte à distance est une porte d'entrée : compte dédié, fenêtre limitée, MFA et journalisation la gardent sous contrôle. L'exploitant reste maître de la couper."
related: [defense.mfa, defense.filtrage, defense.segmentation-it-ot, defense.surface-attaque, forensique.logs, ethique.proportionnalite]
quiz:
  - q: "Pourquoi un accès de maintenance à distance est-il un risque de « chaîne d'approvisionnement » ?"
    choices: ["Parce que le prestataire est forcément malveillant", "Parce que si le prestataire est compromis, son accès légitime devient celui de l'adversaire", "Parce que la maintenance ralentit le réseau"]
    answer: 1
    explain: "On ne soupçonne pas le prestataire : on reconnaît que sa sécurité devient en partie la tienne. Un accès de confiance mal encadré est une entrée idéale."
  - q: "Le compte `cg-maint` a une fenêtre prévue le 2031-05-11 de 02:00 à 04:00. Une connexion apparaît le 2031-05-09 à 23:10 depuis 198.51.100.160/28. Que fais-tu ?"
    choices: ["Rien, la plage source est celle du prestataire donc tout va bien", "Tu bloques toute la plage 198.51.100.0/24 sans prévenir personne", "Tu signales l'anomalie à l'exploitant et tu vérifies auprès du prestataire par un canal connu, puisque la connexion sort de la fenêtre convenue"]
    answer: 2
    explain: "Une bonne adresse source ne suffit pas : l'heure, elle, ne colle pas. On vérifie hors bande et l'exploitant décide de la suite."
  - q: "Qui décide de couper l'accès d'un prestataire en cas de doute ?"
    choices: ["L'exploitant, propriétaire du système, éclairé par l'analyse de l'enquêteur·rice", "L'enquêteur·rice externe, seul·e, dès qu'elle ou il a un doute", "Le prestataire lui-même"]
    answer: 0
    explain: "Couper un accès peut retarder une intervention nécessaire. L'analyste recommande ; celui ou celle qui porte la responsabilité du système tranche."
---
## Définition
Beaucoup d'organisations confient une partie de la maintenance à des **prestataires** qui se connectent à distance. Cet accès est légitime, mais il élargit la **surface d'attaque** : si le prestataire est compromis, ses identifiants et ses connexions le sont aussi. C'est un risque de **chaîne d'approvisionnement**.

## Analogie
Tu confies une clé à l'entreprise qui entretient la chaudière. Tu ne la soupçonnes pas, mais tu préfères qu'elle vienne aux heures convenues, qu'elle sonne avant d'entrer et que la clé ne serve qu'à la chaufferie.

## Dans le jeu
Le prestataire Corvane Grid Services dispose chez REV d'un compte distant `cg-maint`, utilisé depuis la plage `198.51.100.160/28`. Une fenêtre de maintenance est prévue le **2031-05-11 de 02:00 à 04:00**. Toute connexion hors de cette fenêtre, ou depuis une autre plage, mérite une question. Si l'exploitant donne son accord, le confinement passe par le pare-feu de la machine par laquelle le prestataire entre :
```
$ fw block 198.51.100.160/28
✓ Trafic de 198.51.100.160/28 bloqué sur passerelle-histo.rev.internal.
› Pense à documenter la règle (qui, quand, pourquoi) et à la réévaluer. Filtrage
```

## Côté défense
- **Un compte par prestataire, voire par technicien·ne** : jamais de compte partagé ni générique.
- **Fenêtres limitées** : l'accès est fermé par défaut et ouvert pour la durée d'une intervention.
- **MFA** obligatoire, et origine des connexions restreinte à des adresses connues.
- **Journalisation** complète (qui, quand, depuis où, quoi) relue après chaque intervention.
- **Contrat** : obligations de sécurité et de notification d'incident côté prestataire.
- Vérifier une demande inhabituelle par un **canal connu**, pas en répondant au message reçu.

## Éthique
L'exploitant reste **propriétaire de la décision** : couper un accès de maintenance peut avoir des conséquences opérationnelles. L'enquêteur·rice présente les faits, les risques et une recommandation proportionnée.
