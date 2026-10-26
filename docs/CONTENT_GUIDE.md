# CONTENT GUIDE — écrire missions et fiches

Le contenu vit dans `/content` et est validé par les schémas Zod de `packages/engine/src/content/schema.ts` (au chargement **et** en CI via `pnpm content:check`).

## 1. Fiches (journal d'apprentissage)

Fichier : `content/concepts/<categorie>.<slug>.md` — **le nom du fichier est l'id**.

```markdown
---
id: reseau.port
title: Port
category: reseau            # reseau | systeme | reconnaissance | forensique | defense | ethique
summary: Une phrase (10–240 caractères) affichée partout où la fiche apparaît.
related: [reseau.adresse-ip] # ids existants uniquement
---
## Définition
## Analogie            (optionnel mais recommandé)
## Dans le jeu
## Côté défense        (obligatoire dès qu'une technique « offensive » est en jeu)
## Éthique / Pour aller plus loin
```

Règles :
- Commencer par **pourquoi ça marche**, pas par la commande.
- Une fiche = un concept. Si tu écris « et aussi… », c'est une nouvelle fiche liée.
- Exemples concrets tirés du jeu (adresses et noms fictifs).

## 2. Missions

Fichier : `content/missions/NN-id.yaml` (`NN` = ordre de lecture). Exemple complet : `00-prologue.yaml`.

### Champs
| Champ | Rôle |
|---|---|
| `id`, `title`, `act`, `order` | Identité. `act` ∈ `prologue, acte-1, acte-2, acte-3, banc, contrat`. |
| `from` | Personnage qui envoie le briefing. |
| `summary` | Une ligne (panneau Opération). |
| `question` | **La question de l'opération.** Le débrief doit y répondre. |
| `briefing`, `debrief` | Markdown. |
| `concepts` | Fiches mobilisées (affichées au briefing). |
| `scenario` | Monde initial (voir ci-dessous). |
| `objectives` | Objectifs déclenchés par des événements. |

### Scénario
```yaml
scenario:
  clock: '2031-03-14T08:47:00Z'        # horloge simulée de départ
  start: { host: echo-ws, user: operateur-7 }   # cwd = home par défaut
  known: [echo-ws]                     # hôtes visibles dès le départ
  networks:
    - { id: banc, cidr: 10.7.1.0/24, label: le Banc }
  hosts:
    - id: banc-01
      hostname: banc-01                # ou nom.example / nom.internal…
      ip: 10.7.1.10                    # plages privées ou documentation uniquement
      os: Debian GNU/Linux 12
      networks: [banc]                 # joignable depuis tout hôte partageant un réseau
      icmp: true                       # false = ne répond pas au ping (nmap -Pn requis)
      services:
        - { port: 22, name: ssh, product: OpenSSH, version: 9.2p1, banner: 'SSH-2.0-…' }
        - { port: 3306, name: mysql, state: filtered }
      accounts:
        - { user: stagiaire, password: echo-banc-2031 }   # null = pas de login par mot de passe
      files:
        /etc/motd: |
          …
        /home/stagiaire/notes/: ''     # « / » final = répertoire vide
```

### Objectifs
```yaml
objectives:
  - id: scan-banc
    label: Identifier les services et versions de banc-01
    requires: [ping-banc]        # reste masqué tant que ces objectifs ne sont pas faits
    on: host.scanned             # type d'événement
    where: { hostId: banc-01, versions: true }   # correspondance superficielle ; un champ tableau matche par inclusion
    optional: false
    hint: Texte de Noor quand le joueur tape `hint`.
    concepts: [reseau.port]      # fiches ajoutées au journal à la complétion
```

Événements disponibles pour `on` et leurs champs :

| Événement | Champs |
|---|---|
| `command.run` | `name` (nom canonique, alias résolus), `args` |
| `dir.listed` | `hostId`, `path` |
| `file.read` | `hostId`, `path` (aussi émis par `grep` sur un fichier) |
| `host.discovered` | `hostId`, `ip` |
| `host.pinged` | `hostId`, `ip`, `reachable` |
| `host.scanned` | `hostId`, `ip`, `ports` (ouverts), `versions` |
| `session.opened` | `hostId`, `user` |
| `auth.failed` | `hostId`, `user` |
| `concept.studied` | `id` |
| `objective.completed` *(messages)* | `missionId`, `objectiveId` |
| `mission.started` / `mission.completed` *(messages)* | `missionId` |

### Messages
Messages diégétiques (Noor, Mara, inconnu…) livrés dans le panneau Comms et lisibles au terminal avec `mail`.

```yaml
messages:
  - id: noor-ping
    from: Noor Haddad            # nom exact d'un contact pour le compteur « non lus » ; `inconnu` = style anonyme
    subject: Optionnel
    on: objective.completed      # ou mission.started, mission.completed, ou tout événement d'objectif
    where: { objectiveId: ping-banc }
    body: |
      Markdown court (3–6 lignes). Tapé en machine à écrire à la première lecture.
```
Règles : un message **réagit** à ce que le joueur vient de faire (jamais une consigne déguisée qui double l'objectif) ; il apporte du lore, une nuance technique, ou une tension.

La mission est accomplie quand tous les objectifs **non optionnels** sont faits ; les optionnels restent accomplissables jusqu'au retour au menu.

## 3. Checklist d'une nouvelle mission
- [ ] La `question` est une vraie question de compréhension (« pourquoi / comment »), pas une consigne.
- [ ] Chaque objectif a un `hint` qui guide sans donner la commande exacte… sauf dans le Prologue.
- [ ] Au moins une fiche « Côté défense » ou « Éthique » est mobilisée.
- [ ] Adresses / domaines fictifs (validé automatiquement).
- [ ] Un test solveur dans `packages/engine/test/` joue la mission de bout en bout.
- [ ] Le lore reste cohérent avec `LORE.md` (mettre à jour ce dernier si la mission révèle quelque chose).
- [ ] `pnpm content:check && pnpm test` passent.
