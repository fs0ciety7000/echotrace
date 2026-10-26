---
id: systeme.ssh
title: SSH
category: systeme
summary: SSH (port 22) ouvre un shell chiffré sur une machine distante, après authentification par mot de passe ou par clé.
related: [reseau.port, forensique.logs]
quiz:
  - q: Sur quel port un serveur SSH écoute-t-il par convention ?
    choices: ['21', '22', '443']
    answer: 1
    explain: SSH utilise le port 22 par défaut — une convention qu'un administrateur peut changer.
  - q: Quel mode d'authentification SSH est recommandé ?
    choices: [Mot de passe court mais changé souvent, "Paire de clés (privée chez toi, publique sur le serveur)", Connexion root directe]
    answer: 1
    explain: Les clés résistent à la force brute et ne transitent jamais ; on désactive souvent l'authentification par mot de passe et la connexion root.
  - q: Un mot de passe traîne dans un fichier d'une machine qui n'est pas dans ton périmètre. Tu peux l'utiliser ?
    choices: ["Oui, il était accessible", Non — se connecter sans autorisation reste une intrusion, Oui si tu ne modifies rien]
    answer: 1
    explain: L'accès non autorisé est punissable même sans dégât et même si le secret était mal protégé (art. 323-1 du Code pénal).
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
