---
id: systeme.ssh
title: SSH
category: systeme
summary: SSH (port 22) ouvre un shell chiffré sur une machine distante, après authentification par mot de passe ou par clé.
related: [reseau.port, forensique.logs]
---
## Définition
**Secure Shell** chiffre tout ce qui transite entre toi et le serveur. Authentification par **mot de passe** ou, mieux, par **paire de clés** (une clé privée que tu gardes, une clé publique déposée sur le serveur).

## Dans le jeu
`ssh utilisateur@hôte`, puis le mot de passe (il ne s'affiche pas — c'est normal). `exit` referme la session et te ramène sur la machine précédente.

## Côté défense
- Désactiver la connexion `root` par mot de passe (`PermitRootLogin no`).
- Préférer les clés aux mots de passe.
- Surveiller `/var/log/auth.log` : des dizaines de « Failed password » à la suite = tentative de force brute.

## Éthique
Se connecter avec des identifiants qui ne sont pas les tiens, sans autorisation, est une **intrusion** au sens pénal — même si le mot de passe traînait dans un fichier.
