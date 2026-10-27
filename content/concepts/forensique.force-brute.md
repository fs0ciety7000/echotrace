---
id: forensique.force-brute
title: Force brute & bourrage d'identifiants
category: forensique
summary: "Essayer des mots de passe en masse, ou réutiliser des identifiants volés ailleurs. Dans les journaux, cela se lit comme une rafale d'échecs… parfois suivie d'un succès."
related: [forensique.logs, forensique.pipelines, defense.mfa, systeme.ssh]
quiz:
  - q: "Une même IP produit 900 « Failed password » sur 300 comptes différents, puis un « Accepted » pour l'un d'eux. Que conclus-tu ?"
    choices: ["Un·e utilisateur·rice a oublié son mot de passe", "Une tentative automatisée a probablement réussi : le compte est à considérer comme compromis", "Le serveur SSH dysfonctionne"]
    answer: 1
    explain: "Beaucoup de comptes, beaucoup d'échecs, une même source, puis un succès : signature classique. On traite le compte comme compromis."
  - q: "Un compte se connecte du premier coup, sans aucun échec, depuis une adresse inhabituelle à 3 h. Le mot de passe figurait dans une fuite d'un autre site. De quoi s'agit-il probablement ?"
    choices: ["De bourrage d'identifiants : un mot de passe réutilisé, volé ailleurs", "De force brute", "D'une connexion légitime, puisqu'il n'y a pas d'échec"]
    answer: 0
    explain: "Le bourrage d'identifiants ne laisse parfois aucun échec : le mot de passe est déjà connu. D'où l'importance du contexte (source, heure)."
  - q: Quelle mesure aurait le plus limité ces deux attaques ?
    choices: ["Changer le port SSH", "Interdire les connexions la nuit", "L'authentification multifacteur, combinée à des mots de passe uniques"]
    answer: 2
    explain: "Avec un second facteur, un mot de passe deviné ou volé ne suffit plus. Changer de port réduit seulement le bruit."
---
## Définition
- **Force brute** : essayer beaucoup de mots de passe (souvent les plus courants) contre un ou plusieurs comptes.
- **Bourrage d'identifiants** (*credential stuffing*) : réutiliser des couples identifiant / mot de passe **volés lors de fuites d'autres services**, en pariant que les gens les réutilisent.

## Ce que voit l'enquêteur·rice
```
Mar 15 01:47:02 vpn-gw auth: Failed password for invalid user admin from 198.51.100.23
Mar 15 01:47:03 vpn-gw auth: Failed password for j.morel from 198.51.100.23
...
Mar 15 01:52:18 vpn-gw auth: Accepted password for j.morel from 198.51.100.23
```
Signaux : volume, cadence régulière (machine, pas humain), comptes inexistants (« invalid user »), même source — et **un succès à la fin**.

## Dans le jeu
Au CH de Vallon-sur-Aire, le mot de passe de j.morel figurait dans la fuite d'un site sans rapport. Le portail VPN n'exigeait rien d'autre.

## Côté défense
- **MFA** sur tout accès distant.
- Limiter le débit et verrouiller temporairement après plusieurs échecs.
- Alerter sur « beaucoup d'échecs puis un succès » depuis une même source.
- Vérifier ses comptes contre les fuites connues et interdire les mots de passe compromis.

## Éthique
Tester des identifiants volés sur un système, même « pour voir », est un accès frauduleux (art. 323-1 du Code pénal). Chez ECHO, on lit ces traces, on ne les produit pas.
