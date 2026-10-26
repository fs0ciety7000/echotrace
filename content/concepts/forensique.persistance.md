---
id: forensique.persistance
title: Persistance
category: forensique
summary: "Les mécanismes qu'un intrus installe pour survivre à un redémarrage ou à un changement de mot de passe. Les trouver, c'est s'assurer que le nettoyage est complet."
related: [forensique.chronologie, forensique.ioc, reseau.beacon, systeme.fichiers]
quiz:
  - q: Pourquoi un intrus cherche-t-il à installer de la persistance ?
    choices: ["Pour accélérer la machine", "Pour garder son accès même si la machine redémarre ou si le mot de passe volé est changé", "Pour effacer les journaux"]
    answer: 1
    explain: "Sans persistance, un redémarrage ou une réinitialisation de mot de passe suffirait à le faire sortir."
  - q: "Tu trouves une tâche planifiée créée à 02:05, quelques minutes après une connexion suspecte, qui lance un binaire dans `/tmp`. Que fais-tu ?"
    choices: ["Tu la documentes (contenu, date, propriétaire, empreinte) et tu la relies à la chronologie", "Tu la supprimes immédiatement sans noter", "Tu l'ignores, les tâches planifiées sont normales"]
    answer: 0
    explain: "D'abord préserver la preuve et comprendre ; ensuite décider du confinement. Supprimer à la hâte détruit la trace et peut alerter l'intrus."
  - q: "Tu as supprimé un mécanisme de persistance. L'incident est-il clos ?"
    choices: ["Oui, l'implant ne redémarrera plus", "Oui, si l'antivirus ne détecte plus rien", "Pas forcément : un intrus en installe souvent plusieurs, il faut chercher les autres et changer les accès compromis"]
    answer: 2
    explain: "Les intrus prévoient des roues de secours. Le nettoyage doit être exhaustif — souvent jusqu'à la réinstallation."
---
## Définition
La **persistance** regroupe tout ce qui permet à un programme indésirable de **revenir tout seul** : au démarrage, à intervalle régulier ou à la connexion d'un·e utilisateur·rice. Elle détourne presque toujours des mécanismes **légitimes** d'administration.

## Où regarder (côté enquêteur·rice, Linux)
- **Tâches planifiées** : `crontab -l` pour chaque compte, fichiers de `/etc/cron.d/` et `/etc/crontab`.
- **Services** : définitions de services ajoutées récemment, au nom trop générique (`system-update`, `kworker-helper`).
- **Processus** : `ps aux` — un processus au nom anodin lancé depuis `/tmp` ou `/dev/shm`, ou par un compte inattendu.
- **Accès** : clés SSH ajoutées dans `authorized_keys`, comptes nouveaux.

## Dans le jeu
```
$ cat /etc/cron.d/maintenance
*/10 * * * * root /tmp/.cache/upd
```
›  Un fichier caché dans `/tmp`, relancé par root toutes les dix minutes : ce n'est pas de la maintenance.

## Côté défense
- Surveiller la **création** de tâches planifiées, de services et de clés SSH (intégrité de fichiers, journaux d'audit).
- Comparer à une référence connue (« qu'est-ce qui est censé tourner ici ? »).
- Après un incident : chercher **tous** les mécanismes, changer les identifiants, et préférer la réinstallation quand le doute subsiste.
