---
id: ethique.attribution
title: Attribution
category: ethique
summary: "Attribuer une attaque, c'est dire qui en est responsable. C'est difficile, réversible seulement au prix de dégâts réels, et doit toujours s'accompagner d'un niveau de confiance explicite."
related: [reconnaissance.pivot, forensique.ioc, reseau.certificat-tls, ethique.proportionnalite, reconnaissance.whois]
quiz:
  - q: "Le certificat du serveur de commande se retrouve sur un serveur de Corvane. Que peux-tu écrire dans le rapport ?"
    choices: ["« Corvane est responsable de l'attaque. »", "« Le même certificat est présent sur un serveur associé à Corvane ; lien d'infrastructure établi, responsabilité non établie (confiance faible à moyenne). »", "Rien, tant qu'il n'y a pas d'aveux"]
    answer: 1
    explain: "On décrit ce qui est observé et on qualifie sa confiance. Le serveur a pu être compromis, loué ou partagé."
  - q: "Qu'est-ce qu'un faux drapeau (false flag) ?"
    choices: ["Un indice laissé volontairement pour faire accuser quelqu'un d'autre", "Une erreur de configuration", "Un IoC expiré"]
    answer: 0
    explain: "Commentaires dans une autre langue, outils empruntés, fuseau horaire simulé : tout indice « trop parlant » mérite la méfiance."
  - q: Pourquoi une attribution hâtive est-elle dangereuse ?
    choices: ["Parce qu'elle ralentit l'enquête technique", "Parce qu'elle n'a aucune conséquence", "Parce qu'elle peut nuire gravement à un innocent, détourner l'enquête et servir le vrai responsable"]
    answer: 2
    explain: "Une accusation publique est difficile à retirer. Elle peut déclencher des représailles, des procès — et laisser le vrai coupable tranquille."
---
## Définition
L'**attribution** répond à : *qui est derrière ?* On distingue plusieurs niveaux :
1. **Technique** : quelle infrastructure, quels outils, quelles habitudes.
2. **Groupe** : ces traces correspondent-elles à un acteur déjà observé ?
3. **Commanditaire** : qui a ordonné ou financé ?

Chaque niveau est plus difficile et plus lourd de conséquences que le précédent.

## Pourquoi c'est difficile
- **Infrastructure partagée ou louée** : un même serveur peut servir plusieurs clients, ou avoir été compromis.
- **Outils communs** : beaucoup d'acteurs utilisent les mêmes programmes.
- **Faux drapeaux** : des indices peuvent être fabriqués pour accuser un tiers.
- **Biais de confirmation** : quand on soupçonne déjà quelqu'un, on voit ses traces partout.

## Dans le jeu
Le certificat retrouvé chez Corvane est un **écho fort**. Mais il dit « même infrastructure », pas « même coupable ». Le Dossier exige plusieurs indices indépendants, chacun avec sa source.

## Bonne pratique
Toujours exprimer un **niveau de confiance** (faible / moyen / élevé), séparer les **faits observés** des **hypothèses**, et écrire ce qui permettrait de réfuter la conclusion.

## Éthique
Désigner un coupable engage la réputation de personnes et d'organisations. ECHO n'accuse pas sur un seul indice — même quand l'histoire semble évidente. Surtout quand elle semble évidente.
