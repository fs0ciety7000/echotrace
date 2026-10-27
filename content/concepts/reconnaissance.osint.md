---
id: reconnaissance.osint
title: Renseignement en sources ouvertes (OSINT)
category: reconnaissance
summary: "Rassembler et recouper des informations publiquement accessibles — registres, offres d'emploi, communiqués — pour comprendre une organisation ou vérifier une affirmation, sans jamais franchir la limite du privé."
related: [reconnaissance.whois, reconnaissance.domaine-sosie, reconnaissance.pivot, ethique.sources, ethique.autorisation, forensique.metadonnees]
quiz:
  - q: "Une source affirme travailler au service planification de Corvane. Quelle démarche OSINT est appropriée pour vérifier ?"
    choices: ["Appeler l'accueil de Corvane en se faisant passer pour un·e collègue", "Recouper avec des informations publiques : organigramme publié, offres d'emploi, communiqués, registre des sociétés", "Tenter de se connecter à la messagerie interne de Corvane"]
    answer: 1
    explain: "L'OSINT s'arrête à ce qui est publiquement accessible. Se faire passer pour quelqu'un (pretexting) ou entrer dans un système, c'est autre chose — et c'est illégal."
  - q: "Pourquoi une offre d'emploi peut-elle intéresser un·e enquêteur·rice ?"
    choices: ["Parce qu'elle révèle souvent les outils, les équipes et les projets d'une organisation", "Parce qu'elle contient les mots de passe des employé·e·s", "Elle n'a aucun intérêt"]
    answer: 0
    explain: "« Recherche ingénieur·e pour notre nouveau système de planification réseau » en dit long. C'est aussi pour ça qu'une organisation doit relire ce qu'elle publie."
  - q: "Une information n'apparaît que sur un seul site, anonyme. Que fais-tu ?"
    choices: ["Tu la publies, elle est publique", "Tu l'ignores définitivement", "Tu la considères comme non confirmée tant qu'une source indépendante ne la recoupe pas"]
    answer: 2
    explain: "Public ne veut pas dire vrai. Une information OSINT vaut ce que vaut sa source, et gagne en solidité à chaque recoupement indépendant."
---
## Définition
L'**OSINT** (*Open Source Intelligence*) consiste à collecter et **recouper** des informations librement accessibles : registres officiels, sites institutionnels, presse, offres d'emploi, rapports annuels, enregistrements de domaines. Sa force n'est pas dans une donnée isolée, mais dans le **croisement** de sources indépendantes.

## Les sources classiques
- **Registres publics** : registre des sociétés (dirigeant·e·s, filiales, adresses), marchés publics, whois.
- **Communication de l'organisation** : communiqués, rapports annuels, site institutionnel.
- **Offres d'emploi** : technologies utilisées, équipes, projets en cours.
- **Presse et publications** : déclarations, interviews, conférences.

## Dans le jeu
Kestrel, un contact anonyme, affirme travailler chez Corvane et envoie des documents. Avant de s'y fier, ECHO **recoupe** : l'organisation des métadonnées existe-t-elle publiquement ? Le service évoqué apparaît-il dans les communications de l'entreprise ? Les dates collent-elles avec ce que Corvane a annoncé ?

## Côté défense
Les défenseur·e·s pratiquent aussi l'OSINT **sur leur propre organisation** : que peut apprendre un inconnu de nos offres d'emploi, de nos documents publiés, de nos domaines ? Réduire cette exposition fait partie de la **surface d'attaque**.

## Éthique
- **Public ne veut pas dire libre de tout usage** : agréger des informations sur une personne privée peut devenir du harcèlement.
- **Pas d'accès à des données privées** : pas de compte deviné, pas d'espace protégé, même « juste pour voir ».
- **Pas de pretexting** : se faire passer pour quelqu'un afin d'obtenir une information, c'est de la tromperie, pas de l'enquête.
- **Proportionnalité** : on cherche ce qui sert l'enquête, rien de plus.
