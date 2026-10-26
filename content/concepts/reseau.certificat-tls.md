---
id: reseau.certificat-tls
title: Certificat TLS
category: reseau
summary: "Le certificat présente l'identité d'un serveur TLS : sujet, émetteur, validité, noms couverts. Son empreinte SHA-256 est unique et permet de reconnaître le même certificat ailleurs."
related: [reseau.http, reseau.beacon, reconnaissance.pivot, forensique.ioc]
quiz:
  - q: "Un certificat a le même sujet et le même émetteur (`CN=update-svc`). Que signifie probablement ce cas ?"
    choices: ["Qu'il est auto-signé : personne d'autre n'a garanti cette identité", "Qu'il est émis par une autorité reconnue", "Qu'il est expiré"]
    answer: 0
    explain: "Auto-signé = le serveur se porte garant de lui-même. Courant en interne ou en test, suspect sur un serveur qui contacte un hôpital."
  - q: "Le serveur de commande de l'implant et un serveur de Corvane présentent la même empreinte SHA-256. Que peux-tu affirmer ?"
    choices: ["Que Corvane a orchestré l'attaque", "Que les deux serveurs utilisent le même certificat — donc la même clé, ce qui suggère un lien d'infrastructure à expliquer", "Rien, les empreintes se ressemblent souvent"]
    answer: 1
    explain: "Une empreinte identique désigne le même certificat. C'est un écho fort, mais il dit « même infrastructure », pas « même coupable »."
  - q: À quoi sert le champ SAN (Subject Alternative Name) ?
    choices: ["À stocker la clé privée", "À indiquer la date d'expiration", "À lister les noms (domaines) pour lesquels le certificat est valide"]
    answer: 2
    explain: "Les SAN révèlent parfois d'autres noms hébergés par le même serveur : autant de pistes."
---
## Définition
En HTTPS, le serveur présente un **certificat** : un document signé qui associe une **clé publique** à une identité. Il contient notamment :
- **Sujet** : à qui il appartient (`CN=portail.chva.example`).
- **Émetteur** : qui l'a signé (une autorité de certification, ou lui-même).
- **Validité** : dates de début et de fin.
- **SAN** : la liste des noms couverts.
- **Empreinte SHA-256** : un condensé calculé sur le certificat entier — en pratique, son **identifiant unique**.

Un certificat **auto-signé** a le même sujet et le même émetteur : rien ne garantit son identité.

## Dans le jeu
```
$ cert 203.0.113.80
Subject:     CN=update-svc
Issuer:      CN=update-svc        (self-signed)
Validity:    2031-09-01 → 2041-09-01
SAN:         update-svc.lan
SHA-256:     4F:A1:9C:…:7E:22
```
›  Auto-signé, valable dix ans, nom générique : un certificat fabriqué à la main, pas celui d'un service public.

## Côté défense
- Surveiller l'expiration de ses propres certificats et l'émission de certificats à son nom.
- Ajouter les empreintes des certificats malveillants aux **IoC** : le même certificat réapparaît souvent sur d'autres serveurs du même acteur.
- Des bases publiques d'observation de certificats permettent de **pivoter** d'une empreinte à d'autres adresses.
