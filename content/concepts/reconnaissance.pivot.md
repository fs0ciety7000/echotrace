---
id: reconnaissance.pivot
title: Pivot sur indicateurs
category: reconnaissance
summary: "Partir d'un indice (empreinte de certificat, IP, serveur de noms) pour trouver d'autres éléments de la même infrastructure. Chez ECHO, chaque lien ainsi trouvé est un « écho »."
related: [reseau.certificat-tls, forensique.ioc, reconnaissance.whois, reseau.dns, ethique.attribution]
quiz:
  - q: "Quel indicateur offre le pivot le plus fiable ?"
    choices: ["Une IP d'hébergeur partagé où tournent des milliers de sites", "L'empreinte SHA-256 d'un certificat auto-signé fabriqué à la main", "Le fait que deux serveurs utilisent le port 443"]
    answer: 1
    explain: "Plus un indicateur est rare et spécifique, plus le lien est solide. Une IP mutualisée ou un port courant relient tout et n'importe quoi."
  - q: "En pivotant sur une IP, tu trouves 200 domaines hébergés. Que fais-tu ?"
    choices: ["Tu les ajoutes tous au Dossier comme infrastructure adverse", "Tu abandonnes cette piste", "Tu cherches parmi eux ceux qui partagent un second indice avec l'affaire (dates, certificat, serveurs de noms)"]
    answer: 2
    explain: "Un seul lien faible ne suffit pas. Un écho se confirme par plusieurs points communs indépendants."
  - q: "Pourquoi garder une trace de chaque pivot (point de départ, source, date) ?"
    choices: ["Pour que le raisonnement soit vérifiable et que le Dossier tienne face à la contradiction", "Pour accélérer les recherches suivantes", "Ce n'est pas utile"]
    answer: 0
    explain: "Un lien qu'on ne sait plus justifier ne vaut rien comme preuve."
---
## Définition
**Pivoter**, c'est utiliser une caractéristique observée pour découvrir d'autres éléments qui la partagent :
- **Empreinte de certificat** → autres serveurs présentant le même certificat.
- **Adresse IP** → noms de domaine qui y ont pointé.
- **Serveur de noms ou registrar peu courant** → autres domaines gérés de la même façon.
- **Dates** → domaines enregistrés le même jour, avec les mêmes habitudes.

## Dans le jeu
Le chant de l'implant part vers `203.0.113.80`. Son certificat auto-signé a une empreinte précise. La même empreinte apparaît sur `198.51.100.140`… qui sert aussi `extranet.corvane-energie.example`. C'est un **écho** : deux traces reliées par un point commun rare.

## Prudence
- Un indicateur **partagé par beaucoup** (hébergeur, CDN, certificat public) ne relie rien.
- Un écho est une **hypothèse** jusqu'à ce que d'autres indices indépendants la confirment.
- Les adversaires peuvent semer de faux points communs.

## Côté défense
Les défenseur·es pivotent aussi : à partir d'un IoC, on trouve l'infrastructure voisine de l'adversaire et on la bloque **avant** qu'elle serve.

## Éthique
Pivoter sur des sources publiques est de la reconnaissance passive. Se connecter aux serveurs découverts pour « vérifier » sort de ce cadre : cela demande une autorisation.
