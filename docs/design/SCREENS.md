# Écrans clés — wireframes & intentions

Captures de la v0 : [menu](screenshots/menu.png) · [briefing](screenshots/briefing.png) · [poste opérateur](screenshots/operator.png) · [fiche](screenshots/fiche.png).

Ébauches basse fidélité (ASCII) + notes visuelles. Elles fixent la **structure** et la **hiérarchie** ; le rendu suit `DESIGN_SYSTEM.md`. Les écrans implémentés sont marqués ✅.

---

## 1. Écran titre / menu principal ✅ (v0)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ · · · halo cyan très diffus en haut · · ·                    v0.1 · FR  ⚙  │
│                                                                            │
│                                                                            │
│      ECHO-NET // NŒUD 07 · CONNEXION CHIFFRÉE                (overline)    │
│                                                                            │
│      E C H O   T R A C E ▍                                   (display)     │
│      Tout laisse un écho.                                    (fg-muted)    │
│                                                                            │
│      ┌──────────────────────────────┐                                      │
│      │ ▸ Continuer   Prologue · 34% │   ← primary, Enter                   │
│      ├──────────────────────────────┤                                      │
│      │   Nouvelle opération         │                                      │
│      │   Le Banc — Académie         │                                      │
│      │   Paramètres                 │                                      │
│      └──────────────────────────────┘                                      │
│                                                                            │
│  ───────────────────────────────────────────────────────────────────────  │
│  ● ECHO-NET en ligne   ⟶ 3 fiches découvertes   Dernière session : 21:04   │
└────────────────────────────────────────────────────────────────────────────┘
```
- Fond `void` + grain + `gradient-horizon`. Fine grille de points (opacité 4 %) qui se déforme légèrement au survol (désactivée en mouvement réduit).
- Menu navigable flèches/Entrée ; l'item actif a un liseré `signal` et le glyphe `▸`.
- Pied : barre d'état diégétique.

## 2. Poste opérateur (dashboard + terminal) ✅ (v0)

```
┌──┬──────────────────────┬───────────────────────────────────────┬─────────────────────┐
│E▍│ OPÉRATION             │ TERMINAL · operateur-7@echo-ws        │ OBJECTIFS           │
│  │ Prologue              │                                       │ ◆ Lister tes        │
│▣ │ Bruit de fond         │ ECHO-NET poste opérateur v4.2         │   fichiers  ✓       │
│⌘ │ ───────────────       │ Tape 'help' pour la liste…            │ ◆ Lire la note      │
│◎ │ CONTACTS              │                                       │   de Noor           │
│▤ │ ● Noor Haddad         │ operateur-7@echo-ws:~$ ls             │ ◇ (optionnel)       │
│✉ │ ○ Mara O.-Lind        │ notes/  bienvenue.txt  outils/        │                     │
│  │                       │ operateur-7@echo-ws:~$ cat bien…      │ ─────────────────── │
│  │ RÉSEAU CONNU          │ ...                                   │ FICHES RÉCENTES     │
│  │ ● echo-ws 10.7.0.7    │                                       │ [ECHO] Adresse IP   │
│  │ ○ banc-01 10.7.1.10   │ operateur-7@echo-ws:~$ ▍              │ [ECHO] Port         │
│⚙ │                       │                                       │                     │
├──┴──────────────────────┴───────────────────────────────────────┴─────────────────────┤
│ ● CONNECTÉ echo-ws  │ EXPOSITION ▁▂▁ faible │ INTÉGRITÉ 50 · INITIATIVE 50 │ 21:42:07 │
└───────────────────────────────────────────────────────────────────────────────────────┘
```
- Rail d'icônes (56 px) : Opération, Terminal, Réseau, Journal, Messages, Paramètres.
- Colonne gauche (280 px) : contexte de mission, contacts, hôtes connus (cliquer un hôte → `ssh`/`nmap` pré-rempli).
- Centre : EchoTerm (onglets multiples plus tard).
- Droite (340 px) : objectifs + fiches récemment découvertes.
- **Sous 1024 px** : les trois colonnes deviennent des onglets (Terminal · Objectifs · Comms & réseau) avec compteurs (objectifs actifs, messages non lus). Barre d'état compactée sous 640 px.
- Barre d'état : connexion, jauge d'exposition (sparkline), jauges Intégrité/Initiative, horloge du monde.

## 3. Briefing de mission ✅ (v0)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ OPÉRATION 01 · ACTE I — RÉSONANCE                         ✕  Échap         │
│                                                                            │
│ Vallon-sur-Aire                                       ┌──────────────────┐ │
│ ─────────────                                         │ CIBLE            │ │
│ [portrait Mara]  « Le CH de Vallon est chiffré depuis │ chva.example     │ │
│  4h du matin. La revendication est trop propre… »     │ 203.0.113.0/28   │ │
│                                                       │ RÈGLES           │ │
│ QUESTION DE L'OPÉRATION                               │ ✓ Passif d'abord │ │
│ Pourquoi un rançongiciel « opportuniste » vise-t-il   │ ✕ Aucune modif.  │ │
│ un hôpital de 200 lits ?                              │ CONCEPTS         │ │
│                                                       │ [DNS] [whois]    │ │
│ OBJECTIFS                                             │ [Ports] [Logs]   │ │
│ ◆ Cartographier l'exposition externe                  └──────────────────┘ │
│ ◆ Identifier le service d'entrée                                           │
│ ◇ Retrouver le second implant                                              │
│                                           [ Annuler ]  [ Accepter  ↵ ]     │
└────────────────────────────────────────────────────────────────────────────┘
```
- Modale niveau 4 sur le poste opérateur. Texte du briefing en typewriter (sautable).
- La **question de l'opération** est l'ancre pédagogique : le débrief y répond.

## 4. Vue réseau ✅ (v0)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ RÉSEAU · chva.example                 [Filtres ▾] [Disposition ▾] [⤢]      │
│                                                                            │
│           ┌──────┐                                                         │
│           │ ◎ WAN│                                                         │
│           └──┬───┘                                                         │
│      ┌───────┼──────────┐                                                  │
│   ┌──▼───┐┌──▼───┐  ┌───▼───┐       ┌───────────────────────────┐          │
│   │ web  ││ mail │  │  vpn  │       │ HÔTE · vpn.chva.example   │          │
│   │.0.10 ││.0.11 │  │ .0.12 │◄──────│ 203.0.113.12 · Linux      │          │
│   └──────┘└──────┘  └───┬───┘       │ 443/tcp  https  (…)       │          │
│                    ┌────▼────┐      │ 1194/udp openvpn          │          │
│                    │  ? ? ?  │      │ [nmap] [connexion] [note] │          │
│                    └─────────┘      └───────────────────────────┘          │
└────────────────────────────────────────────────────────────────────────────┘
```
- Les nœuds apparaissent **au fil de la découverte** (rien n'est révélé gratuitement).
- Inspecteur latéral : services, notes du joueur, actions qui écrivent la commande dans le terminal (le joueur voit toujours la commande → apprentissage).

## 5. Journal d'apprentissage ✅ (v0)

```
┌──────────────────────┬─────────────────────────────────────────────────────┐
│ JOURNAL · 12/86      │ RÉSEAU · net.port                       ●●○ Maîtrise│
│ ▾ Réseau        5/18 │ Port                                                │
│   ● Adresse IP   ●●● │ ─────                                               │
│   ● Port         ●●○ │ Un port est un numéro (0–65535) qui identifie un    │
│   ○ DNS          ○○○ │ service sur une machine…                            │
│ ▸ Reconnaissance 3/12│                                                     │
│ ▸ Forensique     2/20│ DANS LE JEU    Tu l'as rencontré : Prologue, nmap   │
│ ▸ Défense        1/14│ CÔTÉ DÉFENSE   Fermer ce qui n'est pas utile…       │
│ ▸ Éthique & droit 1/8│ ALLER PLUS LOIN  RFC 6335 · …                       │
│                      │ [ Tester ma compréhension (3 questions) ]           │
└──────────────────────┴─────────────────────────────────────────────────────┘
```
- Chaque fiche : définition, analogie, « dans le jeu », « côté défense », ressources, mini-quiz → maîtrise.

## 6. Débrief ✅ (v0)
Implémenté : statistiques (temps simulé, exposition, indices, bonus) + réponse à la question. À venir : réponse à la question de l'opération, chronologie de ce que le joueur a fait (avec son exposition), conséquences des choix, fiches gagnées, commentaire contradictoire Noor vs Sable.

## 7. Graphe d'enquête — le Dossier (v2)
Canvas xyflow : nœuds typés (personne, organisation, hôte, artefact, événement), arêtes « écho » (violet) qualifiées par le joueur (même certificat, même IP, même horaire). Indicateur de solidité du dossier.

## 8. Le Banc — Académie ✅ (v0) / sandbox (v2)
Grille de modules (Réseau, Reconnaissance, Forensique, Défense, Éthique) avec progression ; mode sandbox : réseau généré par seed, objectifs libres, toutes les commandes disponibles.
