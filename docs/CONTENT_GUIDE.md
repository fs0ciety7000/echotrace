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

### Quiz (obligatoire, 2–4 questions)
Dans le frontmatter, après `related` :
```yaml
quiz:
  - q: "Un scan indique `3306/tcp filtered`. Qu'est-ce que ça signifie ?"
    choices: [Réponse A, Réponse B, Réponse C]   # 2 à 4 choix, mélangés à l'affichage
    answer: 1                                     # index (0-based) de la bonne réponse
    explain: Toujours expliquer, que le joueur ait juste ou faux.
```
⚠ YAML : mettre entre guillemets tout texte contenant `: ` (espace insécable français compris) ou, dans une liste `[…]`, une virgule. `pnpm content:check` détecte un nombre de choix incohérent avec `answer`, pas une virgule mal placée : relire les choix affichés.
Une bonne question teste la **compréhension** (« que peux-tu conclure ? », « pourquoi ? »), pas la mémoire d'un numéro de port isolé. Les mauvaises réponses sont des erreurs plausibles, pas des absurdités.

Règles :
- Commencer par **pourquoi ça marche**, pas par la commande.
- Une fiche = un concept. Si tu écris « et aussi… », c'est une nouvelle fiche liée.
- Exemples concrets tirés du jeu (adresses et noms fictifs).

## 2. Missions

Fichier : `content/missions/NN-id.yaml` (`NN` = ordre de lecture). Exemple complet : `00-prologue.yaml`.

### Champs
| Champ | Rôle |
|---|---|
| `id`, `title`, `act`, `order` | Identité. `act` ∈ `prologue, acte-1, acte-2, acte-3, banc, contrat`. Les missions `banc` (fichiers `banc-N-*.yaml`) apparaissent dans l'écran Académie, hors campagne. |
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

### Données de scénario avancées
```yaml
hosts:
  - id: fs-01
    # …
    processes:                      # ps
      - { pid: 1442, user: root, cmd: /var/tmp/.cache/sysupd -i 300 }
    connections:                    # netstat
      - { local: '10.40.1.10:43918', remote: '203.0.113.200:8443', pid: 1442 }
    services:
      - port: 443
        name: https
        http: { status: 200, headers: { Server: Exemple/1.0 }, body: '…' }   # curl
        tls:                                                                   # cert
          subject: CN=www.exemple.example
          issuer: CN=Autorité de Test
          notBefore: '2030-11-02'
          notAfter: '2031-11-02'
          san: [www.exemple.example]
          sha256: 'AA:BB:…'          # 32 octets hexadécimaux séparés par « : »
domains:                            # whois et dns
  - name: exemple.example
    registrar: …
    nameservers: [ns1.exemple.example]
    axfr: false                     # true = « dns audit » signale une zone divulguée
    records:
      - { name: '@', type: A, value: 203.0.113.10 }
      - { name: www, type: CNAME, value: exemple.example }
```

### Documents et pare-feu (Acte II)
```yaml
hosts:
  - id: echo-sas
    documents:                     # meta <fichier>
      /sas/kestrel/planning.odt: { author: …, lastModifiedBy: i.calder, company: …, created: '2030-10-20', modified: '2030-11-09', software: … }
    firewall:                      # règles initiales de fw
      - { source: 192.0.2.250, note: scanner bloqué le 02/03 }
    files:
      /sas/kestrel/planning.odt: (document bureautique — utilise meta)   # le fichier doit exister aussi
```
Un e-mail à analyser avec `mailcheck` est un fichier texte brut (en-têtes, ligne vide, corps). Les résultats SPF/DKIM/DMARC sont lus dans `Authentication-Results`.
Événements : `mail.analyzed` (`path`, `spf`, `dkim`, `dmarc`, `fromDomain`), `document.inspected` (`path`, `author`, `lastModifiedBy`), `firewall.changed` (`hostId`, `action`, `target`).

### Questions de rapport (`report`)
```yaml
questions:
  - id: source                       # le joueur tape : report source <réponse>
    prompt: Avec quelle adresse extérieure communique-t-il ?
    accept: [203.0.113.200, edge-sync.example]   # comparaison sans casse ni ponctuation finale
    requires: [processus]            # se débloque après une autre conclusion
    hint: Pointe vers la preuve, jamais vers la réponse.
    explain: Pourquoi c'est la bonne réponse (affiché à la confirmation).
```
Un objectif s'y accroche avec `on: finding.confirmed` / `where: { questionId: source }`.

### Choix moraux
```yaml
choices:
  - id: chant
    from: Dr Noor Haddad
    on: objective.completed           # même déclencheurs que les messages
    where: { objectiveId: report-indicateurs }
    prompt: Markdown — la situation, sans orienter.
    options:                          # 2 ou 3
      - id: couper
        label: Prévenir la DSI et couper maintenant
        description: Une ligne, honnête sur le coût.
        effects: { integrity: 15, initiative: -5 }   # jamais affichés avant le choix
        consequence: Markdown affiché au débrief.
```
Règles : **aucune option n'est la « bonne »** ; chaque option a un coût visible au débrief. Les décisions sont mémorisées pour toute la campagne (`missionId/choiceId`).

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
Un message peut dépendre d'une décision antérieure : `when: { confinement/chant: observer }`.

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
