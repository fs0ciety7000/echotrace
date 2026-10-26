---
id: reconnaissance.scan-de-ports
title: Scan de ports
category: reconnaissance
summary: Scanner, c'est frapper à chaque porte d'une machine pour voir lesquelles répondent. Utile, bruyant, et légitime seulement dans un périmètre autorisé.
related: [reseau.port, reconnaissance.empreinte-service, ethique.autorisation]
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
