---
id: forensique.metadonnees
title: Métadonnées de documents
category: forensique
summary: "Les informations invisibles qu'un document emporte avec lui : auteur, dernier modificateur, organisation, logiciel, dates. De précieux indices — mais qui se modifient aussi facilement que le texte."
related: [forensique.chronologie, forensique.ioc, ethique.sources, ethique.attribution, systeme.fichiers]
quiz:
  - q: "Un document reçu d'une source a pour organisation « Corvane Grid Services » et a été modifié en dernier par `i.calder`. Que peux-tu en conclure ?"
    choices: ["Que le document est authentique, c'est prouvé", "Que i.calder est la source", "Que c'est cohérent avec un document interne de Corvane — un indice à recouper, pas une preuve"]
    answer: 2
    explain: "Les métadonnées orientent l'enquête. Mais elles se falsifient, et le dernier modificateur n'est pas forcément la personne qui a transmis le document."
  - q: "Pourquoi le champ « Dernière modification par » peut-il être plus parlant que « Auteur » ?"
    choices: ["Parce que l'auteur hérite souvent d'un modèle ou d'un compte générique, tandis que le dernier modificateur reflète qui a réellement touché au fichier", "Parce que le champ Auteur est toujours vide", "Parce qu'il est impossible à modifier"]
    answer: 0
    explain: "Un modèle partagé garde l'auteur d'origine (« planification ») ; la dernière modification trahit l'usage réel. Tous les deux restent modifiables."
  - q: "ECHO s'apprête à publier un rapport en PDF. Que faut-il faire avant ?"
    choices: ["Rien, un PDF ne contient pas de métadonnées", "Nettoyer ses métadonnées : nom d'auteur, compte, chemins et logiciel peuvent exposer l'équipe ou une source", "Le renommer suffit"]
    answer: 1
    explain: "Ce qu'on lit chez les autres, les autres peuvent le lire chez nous. Nettoyer ses propres documents protège l'équipe — et surtout les sources."
---
## Définition
Un document bureautique contient, en plus de son texte, des **métadonnées** : titre, auteur, **dernière personne à l'avoir modifié**, organisation, logiciel utilisé, dates de création et de modification. Elles sont remplies **automatiquement** à partir du compte et du logiciel, sans que personne y pense — c'est ce qui les rend révélatrices.

## Dans le jeu
```
$ meta /sas/kestrel/planning-novembre.odt
MÉTADONNÉES · /sas/kestrel/planning-novembre.odt
Titre                      Planning des interventions — novembre 2030
Auteur                     Corvane Grid Services — planification
Dernière modification par  i.calder
Organisation               Corvane Grid Services
Créé le                    2030-10-20
Modifié le                 2030-11-09
Logiciel                   Bureautique Libre 7.4

› Des métadonnées se falsifient aussi : un indice, pas une preuve. Métadonnées
```
›  Le document dit venir de l'intérieur de Corvane, et un compte nominatif y a touché le 2030-11-09. Deux pistes à **recouper**, pas une conclusion.

## Ce qu'elles apportent, et leurs limites
- **Utile** : situer un document dans une **chronologie**, relier plusieurs fichiers au même compte ou à la même organisation, repérer une incohérence (un document « de 2029 » modifié par un logiciel sorti en 2031).
- **Fragile** : n'importe qui peut réécrire ces champs. Un faussaire soigneux les rend crédibles ; un faussaire maladroit s'y trahit.

## Côté défense
- **Nettoyer** ses propres documents avant publication ou envoi externe : auteur, comptes, commentaires, historique des révisions.
- Utiliser des comptes et modèles qui ne divulguent pas l'organigramme interne.
- Côté enquête : conserver le fichier **original** et son empreinte avant toute manipulation.

## Éthique
Les métadonnées d'un document fuité peuvent **identifier la source**. Avant de publier un extrait ou une capture, on vérifie qu'on ne désigne pas la personne qui a pris le risque de parler.
