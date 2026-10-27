---
id: defense.segmentation-it-ot
title: Segmentation bureautique / industriel
category: defense
summary: "Un réseau industriel (OT) doit être séparé du réseau bureautique (IT) : une intrusion par un e-mail ne doit pas pouvoir atteindre la supervision. Une machine à cheval sur les deux est un point faible classique."
related: [defense.filtrage, defense.surface-attaque, defense.acces-tiers, defense.continuite, reseau.adresse-ip]
quiz:
  - q: "Pourquoi sépare-t-on le réseau industriel du réseau bureautique ?"
    choices: ["Pour que les équipes ne se parlent pas", "Pour qu'une compromission côté bureautique (messagerie, navigation) ne puisse pas atteindre directement les systèmes qui pilotent des équipements physiques", "Parce que les deux réseaux utilisent des câbles différents"]
    answer: 1
    explain: "Le bureautique est exposé (e-mails, web, prestataires). L'industriel a des conséquences physiques. La séparation limite la propagation de l'un vers l'autre."
  - q: "La passerelle `passerelle-histo` possède une interface en 10.50.0.40 et une autre en 10.60.0.40. Qu'en penses-tu ?"
    choices: ["Elle relie directement les deux réseaux : si elle est compromise, elle devient un pont de l'un vers l'autre", "C'est sans importance tant qu'elle a un antivirus", "C'est la meilleure façon de séparer les réseaux"]
    answer: 0
    explain: "Une machine à double attachement court-circuite la segmentation. Les échanges devraient passer par un conduit contrôlé et filtré, pas par une machine qui touche les deux zones."
  - q: "Qu'est-ce qu'un « conduit » dans le modèle zones / conduits ?"
    choices: ["Un câble réseau quelconque", "Une zone de plus haute sécurité", "Le passage unique, explicitement autorisé et surveillé, par lequel deux zones ont le droit de communiquer"]
    answer: 2
    explain: "Une zone regroupe des machines de même niveau de confiance ; un conduit est la seule porte entre deux zones, avec des règles écrites sur ce qui y passe."
---
## Définition
Les réseaux **bureautiques** (IT : messagerie, postes, comptabilité) et **industriels** (OT : supervision, postes d'ingénierie, systèmes qui pilotent des équipements physiques) n'ont ni les mêmes risques ni les mêmes priorités. Côté OT, une panne a des conséquences **physiques** : on les **sépare**.

## Analogie
Dans une centrale, le hall d'accueil et la salle de commande sont dans le même bâtiment, mais on ne passe pas de l'un à l'autre sans sas, badge et registre. Le réseau doit suivre la même logique.

## Zones et conduits
- Une **zone** regroupe des machines de même niveau de confiance (bureautique, supervision…).
- Un **conduit** est le seul passage autorisé entre deux zones : peu de flux, documentés, filtrés et journalisés.
- Tout ce qui n'est pas explicitement autorisé entre zones est **refusé**.

## Dans le jeu
Chez Réseau Électrique du Val (REV), le bureautique est en `10.50.0.0/24` et la supervision industrielle en `10.60.0.0/24`. La machine `passerelle-histo` a une patte dans chaque réseau (`10.50.0.40` et `10.60.0.40`) : elle sert à remonter des historiques vers les bureaux, mais elle crée un **pont** direct entre les deux zones. C'est précisément le genre de point faible qu'un intrus cherche.

## Côté défense
- **Cartographier** les flux réels entre IT et OT avant de décider quoi couper.
- Remplacer les machines à double attachement par un **conduit** filtré (zone tampon, flux à sens unique quand c'est possible).
- **Journaliser** tout ce qui traverse la frontière et surveiller les connexions sortantes inhabituelles depuis la zone industrielle.
- Traiter les accès des prestataires comme un conduit à part entière.

## Éthique
Sur un réseau industriel, l'enquêteur·rice **observe** et **conseille** ; toute action (coupure, isolement) se décide avec l'exploitant, qui connaît les conséquences physiques.
