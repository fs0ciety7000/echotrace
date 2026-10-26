---
id: defense.gestion-correctifs
title: Gestion des correctifs
category: defense
summary: "Appliquer les mises à jour de sécurité à temps, en commençant par ce qui est exposé et critique. Une faille connue et non corrigée reste la porte d'entrée la plus fréquente."
related: [reseau.http, reconnaissance.empreinte-service, defense.surface-attaque, defense.mfa]
quiz:
  - q: "Qu'est-ce qu'un identifiant CVE ?"
    choices: ["Une référence publique unique qui désigne une vulnérabilité connue", "Un logiciel antivirus", "Un exploit prêt à l'emploi"]
    answer: 0
    explain: "Un CVE (ex. CVE-2031-0001, fictif) permet à tout le monde de parler de la même faille : éditeurs, défenseur·es, scanners de vulnérabilités."
  - q: Pourquoi un portail VPN obsolète est-il une porte d'entrée classique ?
    choices: ["Parce que les VPN sont toujours mal conçus", "Parce qu'il est exposé à Internet par nature, donne accès au réseau interne, et que ses failles sont publiques une fois le correctif sorti", "Parce qu'il n'a pas de mot de passe"]
    answer: 1
    explain: "Exposé + accès interne + faille documentée = cible idéale. La publication d'un correctif signale aussi la faille aux attaquants : la course commence."
  - q: "Tu as 40 correctifs en attente et peu de temps. Par quoi commences-tu ?"
    choices: ["Par ordre alphabétique", "Par les postes de la direction", "Par les systèmes exposés à Internet touchés par des failles critiques, surtout si elles sont déjà exploitées"]
    answer: 2
    explain: "On priorise selon l'exposition, la gravité et l'exploitation constatée — pas seulement le score théorique."
---
## Définition
Un logiciel contient des défauts. Quand une **vulnérabilité** est découverte, l'éditeur publie un **correctif** et elle reçoit un identifiant public **CVE**, souvent accompagné d'un score de gravité (CVSS).

La **gestion des correctifs**, c'est savoir ce qu'on a (inventaire), savoir ce qui est vulnérable, et corriger dans un délai adapté au risque.

## Analogie
Le fabricant rappelle un modèle de serrure défectueux. Tant que tu ne l'as pas changée, tout le monde sait comment elle cède.

## Dans le jeu
Au CH de Vallon-sur-Aire, l'en-tête du portail distant affiche une version publiée il y a deux ans. Le bulletin de l'éditeur (fictif) mentionnait une faille critique, corrigée depuis — mais le correctif n'a jamais été appliqué. Tu n'as pas besoin de savoir *comment* la faille s'exploite : savoir qu'elle existe suffit à orienter l'enquête.

## Côté défense
- **Inventaire** : on ne corrige pas ce qu'on ignore posséder.
- **Prioriser** : exposé à Internet > interne ; critique et exploitée > théorique.
- **Tester puis déployer**, avec un plan de retour arrière (un équipement médical ne se redémarre pas n'importe quand).
- Quand on ne peut pas corriger : isoler, restreindre l'accès, surveiller.

## Éthique
Dans un hôpital, mettre à jour peut interrompre des soins ; ne pas le faire peut les interrompre bien plus longtemps. La gestion des correctifs est un arbitrage de risques, pas une négligence individuelle à blâmer.
