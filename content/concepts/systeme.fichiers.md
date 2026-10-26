---
id: systeme.fichiers
title: Système de fichiers & chemins
category: systeme
summary: Sous Linux tout part de la racine « / ». Un chemin absolu commence par /, un chemin relatif part du répertoire courant.
related: [systeme.shell]
quiz:
  - q: Tu es dans `/home/operateur-7`. Où mène `cd ../..` ?
    choices: [/home, /, /home/operateur-7/..]
    answer: 1
    explain: Chaque `..` remonte d'un niveau ; `/home/operateur-7` → `/home` → `/`.
  - q: Pourquoi `ls` n'affiche-t-il pas `.historique-iris` ?
    choices: [Le fichier est chiffré, Un nom commençant par un point est caché par défaut, Tu n'as pas les droits de lecture]
    answer: 1
    explain: Les fichiers « point » sont cachés par convention. `ls -a` les affiche — un réflexe à avoir pendant une enquête.
  - q: Où chercher en priorité les journaux d'authentification d'un serveur Linux ?
    choices: [/etc/passwd, /var/log/auth.log, /home/root/logs]
    answer: 1
    explain: '`/var/log` regroupe les journaux ; `auth.log` (Debian/Ubuntu) consigne connexions SSH et usages de sudo.'
---
## Définition
Les fichiers sont rangés dans un **arbre** de répertoires dont la racine est `/`.
- **Chemin absolu** : `/var/log/auth.log` — valable d'où que tu sois.
- **Chemin relatif** : `notes/banc.txt` — dépend du répertoire courant (`pwd`).
- Raccourcis : `.` (ici), `..` (le parent), `~` (ton répertoire personnel).
- Un fichier dont le nom commence par `.` est **caché** : `ls -a` le révèle.

## Répertoires à connaître
- `/home/<utilisateur>` : données des utilisateurs.
- `/etc` : configuration du système.
- `/var/log` : journaux.
- `/root` : répertoire de l'administrateur.

## Dans le jeu
`ls`, `cd`, `pwd`, `cat`. Les fichiers cachés valent toujours un coup d'œil.

## Côté défense
Les mots de passe en clair dans des fichiers texte sont l'une des premières choses que cherche un attaquant… et que doit traquer un défenseur.
