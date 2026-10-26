---
id: reconnaissance.scan-de-ports
title: Scan de ports
category: reconnaissance
summary: Scanner, c'est frapper à chaque porte d'une machine pour voir lesquelles répondent. Utile, bruyant, et légitime seulement dans un périmètre autorisé.
related: [reseau.port, reconnaissance.empreinte-service, ethique.autorisation]
quiz:
  - q: Pourquoi un scan de ports « marche »-t-il ?
    choices: [Il exploite une faille de TCP, Un service doit répondre à qui frappe à sa porte — le scan s'en sert, Il devine les ports grâce au nom de la machine]
    answer: 1
    explain: Le scan n'exploite aucune faille, il utilise le fonctionnement normal des services réseau.
  - q: Que fait `nmap -sn 10.7.1.0/24` ?
    choices: [Il scanne tous les ports de 256 machines, Il cherche quelles machines du réseau sont actives sans scanner leurs ports, Il identifie les versions des services]
    answer: 1
    explain: '`-sn` = découverte d''hôtes seulement (« ping sweep »). Plus rapide et plus discret qu''un scan complet.'
  - q: Avant de scanner un système, il faut…
    choices: [Une autorisation écrite et un périmètre défini, Un VPN, Que la machine réponde au ping]
    answer: 0
    explain: Sans autorisation, un scan peut constituer une infraction et nuire à des tiers. Le périmètre écrit fait la différence.
---
## Définition
Un scanner (comme **Nmap**) envoie des paquets vers une liste de ports et classe les réponses (open / closed / filtered). Il peut aussi balayer un réseau entier pour trouver les machines actives (`-sn`, *ping sweep*).

## Pourquoi ça marche
Pour offrir un service, une machine *doit* répondre à quiconque frappe à la bonne porte. Le scan exploite simplement ce fonctionnement normal.

## Le revers
Un scan est **bruyant** : les systèmes de détection (IDS) et les journaux de pare-feu le voient très bien. Dans Echo Trace, chaque scan augmente ton **exposition**.

## Dans le jeu
`nmap banc-01`, `nmap -sn 10.7.1.0/24`, `nmap -p 22,80 10.7.1.10`.

## Éthique & droit
Scanner un système sans autorisation peut constituer une infraction (en France, art. 323-1 et suivants du Code pénal). Toujours un **périmètre écrit** avant de scanner.
