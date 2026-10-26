---
id: reconnaissance.whois
title: Whois
category: reconnaissance
summary: Whois interroge les registres publics d'un nom de domaine — bureau d'enregistrement, dates, serveurs de noms. Des indices à recouper, jamais des preuves isolées.
related: [reseau.dns, reconnaissance.pivot, ethique.attribution]
quiz:
  - q: "Le whois de `chva-sante.example` affiche « REDACTED FOR PRIVACY » pour le titulaire. Que peux-tu en conclure ?"
    choices: ["Le domaine est forcément malveillant", "Rien de suspect en soi : le masquage des données personnelles est courant et souvent obligatoire", "Le registre est en panne"]
    answer: 1
    explain: "La protection de la vie privée (RGPD notamment) masque souvent le titulaire. Il faut s'appuyer sur d'autres champs : dates, registrar, serveurs de noms."
  - q: "Un domaine qui imite celui de l'hôpital a été créé deux jours avant l'attaque. Pourquoi est-ce intéressant ?"
    choices: ["Un domaine très récent, proche de la date d'un incident, est un signal classique d'infrastructure préparée pour l'occasion", "Cela prouve qui est l'attaquant", "Cela n'a aucun intérêt : des domaines sont créés tous les jours"]
    answer: 0
    explain: "C'est un indice fort à recouper (DNS, certificats, journaux), pas une preuve d'identité."
  - q: "Deux domaines sans lien apparent partagent les mêmes serveurs de noms peu courants. Que fais-tu ?"
    choices: ["Tu conclus qu'ils appartiennent à la même personne", "Tu ignores, c'est une coïncidence", "Tu le notes comme un écho possible et tu cherches d'autres points communs"]
    answer: 2
    explain: "Un point commun rare mérite d'être creusé, mais un seul indice ne suffit pas : des hébergeurs mutualisés servent des milliers de clients."
---
## Définition
Quand on réserve un nom de domaine, le **bureau d'enregistrement** (*registrar*) inscrit des informations dans un registre public : dates de création, de mise à jour et d'expiration, serveurs de noms, parfois le titulaire. **Whois** (et son successeur RDAP) permet de les consulter.

## Dans le jeu
```
$ whois chva-sante.example
Domain Name: CHVA-SANTE.EXAMPLE
Registrar: Registre Fictif SAS
Creation Date: 2031-11-02T09:14:00Z
Name Server: ns1.abri-dns.example
Registrant Organization: REDACTED FOR PRIVACY
```
C'est de la reconnaissance **passive** : on consulte un registre public, la cible n'en sait rien.

## Que regarder ?
- **Dates** : un domaine créé juste avant un incident est suspect.
- **Serveurs de noms** et **registrar** : des points communs entre domaines peuvent révéler une même infrastructure.
- **Titulaire** : souvent masqué — ce n'est pas un signal en soi.

## Côté défense
Surveiller les enregistrements de domaines qui ressemblent au sien (typosquatting) permet d'anticiper l'hameçonnage. Garder ses propres domaines à jour évite qu'un nom expiré soit racheté par un tiers.

## Éthique
Même publiques, ces données concernent parfois des personnes. On les utilise pour l'enquête, pas pour exposer quelqu'un.
