---
id: defense.mfa
title: Authentification multifacteur
category: defense
summary: "Exiger au moins deux preuves de nature différente (ce que tu sais, ce que tu possèdes, ce que tu es). Un mot de passe volé ne suffit plus."
related: [forensique.force-brute, defense.gestion-correctifs, defense.surface-attaque, systeme.ssh]
quiz:
  - q: Mot de passe + code PIN, est-ce de l'authentification multifacteur ?
    choices: ["Oui, il y a deux secrets", "Non : ce sont deux facteurs de la même catégorie (ce que tu sais)", "Oui, si le PIN fait au moins six chiffres"]
    answer: 1
    explain: "Le MFA combine des catégories différentes. Deux choses que l'on sait peuvent être volées ensemble."
  - q: "Pourquoi le MFA aurait-il arrêté l'intrusion au CH de Vallon-sur-Aire ?"
    choices: ["Parce que l'attaquant n'avait que le mot de passe, volé ailleurs, et pas le second facteur", "Parce que le MFA chiffre le VPN", "Parce que le MFA corrige les vulnérabilités"]
    answer: 0
    explain: "Le mot de passe réutilisé ouvrait la porte seul. Avec un second facteur, il aurait fallu aussi le téléphone ou la clé de r.marchal."
  - q: "Un·e utilisateur·rice reçoit vingt demandes de validation sur son téléphone en pleine nuit. Que faut-il en penser ?"
    choices: ["C'est un bug sans gravité", "Il faut accepter pour que ça s'arrête", "Son mot de passe est probablement compromis et quelqu'un tente de l'épuiser pour obtenir une validation"]
    answer: 2
    explain: "Le MFA a des limites : la fatigue de notifications en est une. On refuse, on signale et on change le mot de passe."
---
## Définition
L'**authentification multifacteur** (MFA) exige des preuves de **catégories différentes** :
- **Ce que tu sais** : mot de passe, PIN.
- **Ce que tu possèdes** : téléphone, clé de sécurité physique, carte.
- **Ce que tu es** : empreinte, visage.

## Analogie
Pour entrer dans la pharmacie de l'hôpital, il faut le code **et** le badge. Connaître le code par-dessus une épaule ne suffit pas.

## Dans le jeu
Le compte de r.marchal a été ouvert avec un mot de passe issu d'une fuite. Le journal du portail montre `auth method: password` — rien d'autre. Un second facteur aurait transformé ce succès en échec.

## Limites
- **Fatigue de notifications** : bombarder quelqu'un de demandes jusqu'à ce qu'il accepte.
- **Hameçonnage en temps réel** : un faux site relaie le code saisi. Les clés de sécurité liées au domaine y résistent mieux que les codes SMS ou à six chiffres.
- **Contournements** : anciens protocoles sans MFA, comptes de service exemptés, procédure de réinitialisation trop facile.

## Côté défense
MFA en priorité sur les accès **distants** et **à privilèges** (VPN, messagerie, administration). Sans exception oubliée : l'attaquant cherche le compte qui y échappe.
