---
id: reseau.http
title: HTTP & en-têtes
category: reseau
summary: "HTTP est le langage du web : une requête, une réponse avec un code d'état et des en-têtes. Ces en-têtes en disent souvent plus que prévu sur le serveur."
related: [reseau.port, reconnaissance.empreinte-service, reseau.certificat-tls, defense.gestion-correctifs]
quiz:
  - q: "`curl -I` renvoie `HTTP/1.1 403 Forbidden`. Que peux-tu en conclure ?"
    choices: ["La page n'existe pas", "Le serveur est en panne", "La ressource existe probablement, mais l'accès t'est refusé"]
    answer: 2
    explain: "404 = introuvable, 403 = interdit, 5xx = erreur côté serveur. Un 403 confirme souvent qu'il y a quelque chose derrière."
  - q: "Un en-tête indique `Server: SecuraGate/6.2.1`. Pourquoi est-ce intéressant pour un·e défenseur·e ?"
    choices: ["Il révèle le logiciel et sa version : on peut vérifier s'il est à jour", "Il prouve que le serveur est piraté", "Il n'a aucune importance"]
    answer: 0
    explain: "Une version précise se compare aux bulletins de sécurité. C'est aussi ce que ferait un attaquant : d'où l'intérêt de la masquer et surtout de corriger."
  - q: Quelle est la différence entre HTTP et HTTPS ?
    choices: ["HTTPS est un autre protocole sans rapport", "HTTPS, c'est HTTP transporté dans un tunnel chiffré TLS", "HTTPS n'utilise pas d'en-têtes"]
    answer: 1
    explain: "Le contenu HTTP est le même ; TLS le chiffre et authentifie le serveur grâce à son certificat."
---
## Définition
Le client envoie une **requête** (`GET /`, `POST /login`) ; le serveur répond avec un **code d'état**, des **en-têtes** puis le contenu.

Codes d'état :
- `2xx` succès (`200 OK`) · `3xx` redirection (`301`, `302`)
- `4xx` erreur du client (`401` authentification requise, `403` interdit, `404` introuvable)
- `5xx` erreur du serveur (`500`, `503`)

## Dans le jeu
`curl -I` ne demande **que les en-têtes** :
```
$ curl -I https://vpn.ch-vallon.example
HTTP/1.1 302 Found
Server: SecuraGate/6.2.1
Location: /remote/login
Set-Cookie: session=...; Secure; HttpOnly
```
›  `Server` révèle le logiciel et sa version ; `Location` montre la page de connexion du portail VPN.

**HTTPS** = HTTP dans un tunnel **TLS** (port 443) : même langage, mais chiffré et authentifié par un certificat.

## Côté défense
- Ne pas afficher de version dans `Server` ou `X-Powered-By` (réduit l'empreinte, sans remplacer la mise à jour).
- Ajouter les en-têtes de protection (`Strict-Transport-Security`, `Content-Security-Policy`…).
- Les journaux d'accès web (`access.log`) gardent la trace de chaque requête : codes, chemins, sources.
