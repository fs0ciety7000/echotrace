---
id: defense.culture-signalement
title: Culture du signalement
category: defense
summary: "Une organisation sûre est une organisation où l'on peut dire « j'ai cliqué » sans crainte. Chaque minute gagnée sur le signalement limite les dégâts ; la honte, elle, fait perdre du temps."
related: [defense.hameconnage, defense.mfa, forensique.chronologie, ethique.proportionnalite]
quiz:
  - q: "Un·e collègue a cliqué sur un lien suspect il y a dix minutes et hésite à le dire. Pourquoi faut-il l'encourager à signaler tout de suite ?"
    choices: ["Pour pouvoir noter la faute dans son dossier", "Parce que plus la réaction est rapide (mot de passe changé, sessions coupées), moins l'intrus a le temps d'exploiter l'accès", "Parce que le signalement annule automatiquement le clic"]
    answer: 1
    explain: "Le temps est l'allié de l'intrus. Un signalement à dix minutes permet souvent d'agir avant tout usage du mot de passe volé."
  - q: "Après un incident, l'équipe rédige un bilan « sans reproche ». Qu'est-ce que ça veut dire ?"
    choices: ["Qu'on cherche ce qui, dans les processus et les outils, a rendu l'erreur possible, plutôt que de désigner un coupable", "Qu'on ne parle pas de l'incident", "Que personne n'est responsable de rien"]
    answer: 0
    explain: "Sans reproche ne veut pas dire sans conséquence : on corrige le système. Mais punir la personne qui a signalé garantit que la suivante se taira."
  - q: "Quelqu'un signale avoir saisi son mot de passe sur une fausse page. Quelle réaction est la plus utile ?"
    choices: ["Attendre de voir si quelque chose d'anormal se produit", "Lui demander de faire plus attention et clore le ticket", "Réinitialiser le mot de passe, couper les sessions ouvertes, vérifier l'activité récente du compte et remercier la personne"]
    answer: 2
    explain: "On traite l'accès comme compromis, on cherche des traces d'usage, et on remercie : c'est ce qui donne envie de signaler la prochaine fois."
---
## Définition
La **culture du signalement** désigne un climat où chacun·e peut rapporter une erreur ou un doute **immédiatement**, sans peur d'être blâmé·e. En sécurité, ce n'est pas de la gentillesse : c'est de l'**efficacité**. Personne ne détecte un clic mieux que la personne qui vient de cliquer.

## Analogie
Dans un avion, un·e pilote qui signale un quasi-incident n'est pas sanctionné·e : ces signalements alimentent la sécurité de tous les vols. Si on punissait, les incidents resteraient cachés jusqu'à l'accident.

## Pourquoi la vitesse compte
- Un mot de passe volé n'est utile que tant qu'il **fonctionne**.
- Un message d'hameçonnage vise rarement une seule personne : un signalement rapide protège les autres destinataires.
- La **chronologie** de l'incident est plus fiable quand les souvenirs sont frais.

## Dans le jeu
Le message reçu par ECHO le 2031-04-02 a été **signalé**, pas supprimé : c'est ce qui permet de l'analyser avec `mailcheck` et de remonter jusqu'au domaine sosie. Un message effacé en silence, c'est une piste perdue.

## Côté défense
- Un **canal de signalement** simple et connu de tous (un bouton, une adresse, un contact).
- Une **réponse type** quand quelqu'un a cliqué : réinitialiser le mot de passe, couper les sessions, vérifier l'activité du compte, contrôler les règles de transfert de la messagerie.
- Un **retour** à la personne qui a signalé : merci, voilà ce qu'on a trouvé.
- Des bilans **sans reproche** (*blameless postmortems*) : on corrige les processus et les outils qui ont rendu l'erreur facile.

## Éthique
Les campagnes de sensibilisation ne doivent jamais servir à humilier ou à sanctionner. Une organisation qui punit le clic apprend surtout à ses équipes à se taire.
