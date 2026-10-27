---
id: defense.continuite
title: Continuité & mode dégradé
category: defense
summary: "Isoler un réseau compromis ne doit pas arrêter un service essentiel. Procédures manuelles, sauvegardes hors ligne et exercices réguliers permettent de couper l'informatique sans couper l'activité."
related: [defense.segmentation-it-ot, defense.filtrage, defense.acces-tiers, ethique.proportionnalite, forensique.rapport]
quiz:
  - q: "Pourquoi un opérateur hésite-t-il parfois à isoler un réseau pourtant compromis ?"
    choices: ["Par négligence uniquement", "Parce que l'isolement est toujours inutile", "Parce que sans plan de continuité, couper l'informatique peut interrompre un service dont dépendent d'autres personnes"]
    answer: 2
    explain: "Si personne ne sait faire tourner le service sans le réseau, isoler revient à choisir entre deux dommages. Le mode dégradé préparé à l'avance supprime ce dilemme."
  - q: "Pourquoi les sauvegardes doivent-elles être conservées hors ligne ?"
    choices: ["Parce qu'un adversaire présent sur le réseau pourrait aussi chiffrer ou effacer des sauvegardes accessibles en ligne", "Parce que c'est moins cher", "Parce que les sauvegardes en ligne sont toujours corrompues"]
    answer: 0
    explain: "Une sauvegarde joignable depuis le réseau compromis est elle-même exposée. Une copie déconnectée reste intacte quoi qu'il arrive au réseau."
  - q: "À quoi sert de répéter régulièrement le passage en mode dégradé ?"
    choices: ["À rien, la procédure écrite suffit", "À découvrir les trous du plan (numéro manquant, procédure périmée) avant le jour où on en a vraiment besoin", "À tester le pare-feu"]
    answer: 1
    explain: "Un plan jamais joué échoue souvent sur un détail. L'exercice transforme une procédure papier en réflexe d'équipe."
---
## Définition
La **continuité d'activité** prépare l'organisation à fonctionner quand ses systèmes informatiques sont indisponibles ou doivent être **coupés** pour contenir une intrusion. Le **mode dégradé** est cette façon de travailler réduite mais sûre : moins confortable, toujours opérationnelle.

## Analogie
Quand les feux tricolores tombent en panne, des agent·e·s règlent la circulation à la main. Plus lent, mais le carrefour reste praticable parce que la procédure existait avant la panne.

## Les briques
- **Procédures manuelles** : savoir faire tourner l'essentiel sans l'outil (relevés, consignes, téléphone).
- **Isolement préparé** : savoir quels liens couper (par exemple entre bureautique et industriel) et ce qui continue de marcher ensuite.
- **Sauvegardes hors ligne** : copies déconnectées, testées par des restaurations régulières.
- **Annuaire de crise** : les contacts utiles, disponibles même sans messagerie.

## Dans le jeu
Chez Réseau Électrique du Val, bloquer `203.0.113.200` sur la passerelle est une mesure ciblée. Isoler entièrement la supervision (`10.60.0.0/24`) serait une décision beaucoup plus lourde : elle n'est envisageable que si REV sait piloter en mode dégradé. Ce choix **appartient à l'exploitant**, pas à ECHO.

## Côté défense
- Identifier les **services essentiels** et le temps maximal d'interruption acceptable pour chacun.
- **Répéter** le passage en mode dégradé, comme un exercice d'évacuation.
- Prévoir le **retour à la normale** : on ne reconnecte qu'après avoir nettoyé et vérifié.

## Éthique
Isoler un système protège, mais peut aussi priver des usager·ère·s d'un service. La décision revient à celui ou celle qui en porte la responsabilité, éclairé·e par une analyse honnête des risques des deux côtés : agir et ne pas agir.
