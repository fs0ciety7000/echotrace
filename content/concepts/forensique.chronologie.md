---
id: forensique.chronologie
title: Chronologie d'incident
category: forensique
summary: "Remettre dans l'ordre, sur une même échelle de temps, les événements venus de sources différentes. C'est la colonne vertébrale de toute analyse d'incident."
related: [forensique.logs, forensique.pipelines, forensique.force-brute, forensique.persistance]
quiz:
  - q: "Le pare-feu note un événement à 02:10 et le serveur VPN un autre à 03:10 (heure de Paris, UTC+1). Le pare-feu est en UTC. Que peux-tu dire ?"
    choices: ["Les deux événements sont à une heure d'écart", "Les deux événements sont probablement simultanés : 02:10 UTC = 03:10 à Paris", "Le pare-feu est en panne"]
    answer: 1
    explain: "Toujours convertir dans un même fuseau (de préférence UTC) avant de comparer. Une heure d'écart peut n'être qu'un décalage horaire."
  - q: Pourquoi chercher le tout premier événement suspect ?
    choices: ["Il indique le point d'entrée et depuis quand l'intrus est là", "Pour remplir le rapport", "Ce n'est pas utile, seul le dernier compte"]
    answer: 0
    explain: "Le premier événement borne la période à analyser et désigne souvent la faille à corriger. Le dernier dit si l'intrus est encore actif."
  - q: "Une ligne de journal est datée de 2019 au milieu d'événements de 2031. Quelle est l'hypothèse la plus prudente ?"
    choices: ["L'attaque a commencé en 2019", "Il faut supprimer la ligne", "L'horloge de la machine était peut-être fausse — ou l'horodatage a été modifié : à vérifier avant de conclure"]
    answer: 2
    explain: "Une horloge mal réglée ou un horodatage falsifié sont fréquents. On note l'anomalie et on la recoupe avec d'autres sources."
---
## Définition
Une **chronologie** (*timeline*) aligne tous les événements d'un incident : connexions, créations de fichiers, alertes, actions humaines. Elle répond à : *par où, quand, quoi ensuite, est-ce fini ?*

## Méthode
1. **Collecter** les horodatages de chaque source : journaux d'authentification, pare-feu, VPN, fichiers modifiés, témoignages.
2. **Normaliser** : tout convertir en **UTC**, noter le fuseau d'origine et la fiabilité de chaque horloge.
3. **Ordonner** et relier : même IP, même compte, même machine.
4. Repérer le **premier** et le **dernier** événement suspects.

## Dans le jeu
```
2031-11-14T01:52Z  vpn       login OK   compte r.marchal   198.51.100.23
2031-11-14T02:05Z  srv-adm   nouvelle tâche planifiée
2031-11-14T02:41Z  srv-pacs  première connexion sortante vers 203.0.113.80
2031-11-16T06:30Z  plusieurs chiffrement des fichiers (rançongiciel)
```
›  Le rançongiciel arrive deux jours **après** l'implant : il n'était pas le début de l'histoire.

## Côté défense
Synchroniser toutes les horloges (NTP), journaliser en UTC et conserver les journaux assez longtemps : une chronologie avec des trous ou des horloges fausses est une chronologie qui ment.
