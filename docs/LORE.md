# LORE — Echo Trace

> *« Rien ne disparaît vraiment sur un réseau. Tout laisse un écho. »*
> — maxime gravée au-dessus de la console d'ECHO-0

Document vivant. Il fait référence pour le ton, les personnages, les factions et la structure narrative. Toute mission doit pouvoir se rattacher à un élément de ce document (ou l'enrichir via une PR qui le met à jour).

---

## 1. Pitch

**2031.** Les infrastructures critiques européennes sont gérées par une mosaïque d'opérateurs privés, de sous-traitants et de prestataires de « sécurité offensive » dont personne ne contrôle vraiment les contrats. Les incidents se multiplient — pannes « techniques », fuites « accidentelles », élections « perturbées » — mais les rapports officiels concluent toujours à l'erreur humaine.

Le joueur rejoint **ECHO**, une cellule d'analystes indépendants qui cartographie ces opérations invisibles en suivant ce qu'elles laissent derrière elles : **les traces**. Logs oubliés, en-têtes d'e-mails, bannières de services, certificats réutilisés, horodatages incohérents. Chaque intrusion produit un *écho* ; ECHO l'écoute.

Le joueur est une nouvelle recrue, indicatif provisoire **OPÉRATEUR-7** (renommable). Sa formation commence le jour où la fondatrice de la cellule disparaît.

## 2. Ton & intentions

| Oui | Non |
|---|---|
| Enquête journalistique numérique, threat intelligence, DFIR | Power fantasy « hacker tout-puissant » |
| Tension sourde, paranoïa crédible, humour sec entre collègues | Néon saturé, jargon creux, « I'm in » hollywoodien |
| Dilemmes moraux réels (vie privée, légalité, proportionnalité) | Morale binaire gentils / méchants |
| Technique exacte mais simulée, expliquée | Techniques réelles exploitables hors du jeu |
| Inspirations : *Mr. Robot* (paranoïa, intimité), *Hacknet* (terminal), *NITE Team 4* (rigueur opérationnelle), *Le Bureau des Légendes* (procédure, éthique) | Copie de noms, logos ou intrigues existants |

Le jeu **ne glorifie jamais l'intrusion**. Quand le joueur choisit une approche « grise », il en voit le coût : exposition de la cellule, tort causé à des tiers, preuves irrecevables.

## 3. Le monde

### 3.1 Contexte

- **La Trame** : surnom donné par les analystes au réseau d'interconnexions entre opérateurs, sous-traitants et data brokers européens. Officieusement, c'est là que « tout se passe ».
- **Loi Halden (2029)** : directive européenne fictive qui autorise les entreprises de sécurité accréditées à mener des « opérations de contre-mesure active ». Elle a créé un marché gris très lucratif.
- **Les Pannes de Novembre (2030)** : série de coupures électriques dans trois capitales, attribuées officiellement à une « défaillance logicielle ». ECHO soupçonne autre chose.

### 3.2 Géographie numérique (convention de jeu)

Toutes les adresses et domaines du jeu sont **fictifs et non routables** :
- Domaines : TLD réservés `.example`, `.test`, `.invalid` ou TLD inventés internes (`.corvane.internal`, `.echo.lan`).
- IP : plages de documentation `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` et plages privées `10.0.0.0/8`, `172.16.0.0/12`.

C'est à la fois une règle de sécurité (rien ne peut être copié-collé vers une cible réelle) et un clin d'œil pédagogique (le joueur découvre ce qu'est une plage de documentation).

## 4. Factions

### ECHO — la cellule
Collectif d'une douzaine de personnes, né en 2027 de la fusion entre :
- **Lanterne**, un média d'investigation numérique indépendant ;
- d'anciens membres d'un CERT national, partis après l'adoption de la loi Halden.

Financée par la **Fondation Aldane** (philanthropie, transparence numérique). Statut ambigu : ni service public, ni entreprise, ni groupe militant. ECHO publie ses rapports techniques, transmet ses preuves aux autorités et aux journalistes, et refuse — en principe — toute action offensive.

**Doctrine ECHO** (affichée dans l'interface) :
1. *Observer avant d'agir.*
2. *Ne jamais nuire à un tiers innocent.*
3. *Une preuve obtenue illégalement est une preuve perdue.*
4. *Documenter tout.*

### Corvane Holdings — l'écran
Groupe de « conseil en résilience » coté à Francfort. Accrédité Halden. Gère la sécurité de dizaines d'opérateurs d'énergie, de transport et de santé. Façade impeccable, rapports RSE, sponsoring de CTF étudiants.

### HOLLOW CHOIR — l'ombre
Groupe d'intrusion mercenaire, désigné ainsi par ECHO parce que ses implants communiquent par de courts « chants » (beacons réguliers) et que chaque opération semble orchestrée par une voix absente. Hypothèse centrale de la campagne : HOLLOW CHOIR travaille pour Corvane — ou Corvane *est* HOLLOW CHOIR.

### Les autres acteurs
- **Brokers** : revendeurs de données, d'accès et de vulnérabilités. Sources d'information, jamais alliés.
- **Autorités** : l'**ANCS** (agence nationale fictive de cybersécurité). Partenaire réticent : ECHO lui transmet des dossiers, elle les classe parfois sans suite.
- **Victimes** : petites structures (hôpital régional, mairie, coopérative agricole) dont les systèmes servent de relais. Elles humanisent les enjeux.

## 5. Personnages

| Nom | Rôle | Fonction en jeu | Voix |
|---|---|---|---|
| **Iris Calder** — *ECHO-0* | Fondatrice. Ex-analyste CERT. Disparue au début du jeu. | Moteur du mystère. Ses traces apparaissent dans les systèmes ennemis. | Laconique, messages chiffrés, citations. |
| **Mara Okonkwo-Lind** | Coordinatrice opérationnelle | Donne les briefings, valide les choix, gère la pression institutionnelle. | Calme, précise, protectrice. |
| **Dr Noor Haddad** | Responsable forensique & Académie | Mentor pédagogique : fiches, débriefs, journal d'apprentissage. | Pédagogue, curieuse, aime les analogies. |
| **Ilya « Sable » Varga** | Spécialiste offensif (ex-pentester) | Propose les options « grises ». Tentation, raccourcis. | Ironique, pragmatique, loyal à sa manière. |
| **Théo Marchetti** | Journaliste à Lanterne | Donne les enjeux humains, publie (ou non) les enquêtes. | Pressé, idéaliste, parfois imprudent. |
| **Kestrel** | Contact anonyme au sein de Corvane | Lanceur·euse d'alerte ? Agent double ? | Fragmentaire, méfiant·e. |
| **CANTOR** | Opérateur principal de HOLLOW CHOIR | Antagoniste visible, signe ses opérations. | Élégant, provocateur, jamais pressé. |

## 6. Systèmes narratifs

### 6.1 Deux jauges, pas un alignement
Plutôt qu'un axe bien/mal, deux jauges indépendantes :
- **Intégrité** — respect de la doctrine ECHO, légalité, proportionnalité. Haute : crédibilité auprès de l'ANCS et des journalistes, preuves recevables.
- **Initiative** — efficacité, prise de risque, raccourcis « gris ». Haute : accès plus rapide à l'information, mais exposition (la cellule est détectée, des tiers sont touchés).

Les choix ne sont jamais « débloquer la bonne réponse » : chaque option a un coût narratif visible au débrief.

### 6.2 Exposition
Indicateur par mission : bruit généré (scans agressifs, connexions répétées, fichiers modifiés). Une exposition élevée déclenche des contre-mesures simulées (IP bannie, logs nettoyés par l'adversaire, honeypot). **Leçon pédagogique : la discrétion est une compétence défensive aussi** — on apprend ce qu'un défenseur voit.

### 6.3 Le Dossier
Fil rouge de la campagne : le joueur assemble un dossier de preuves (artefacts, relations, chronologie) dans un **graphe d'enquête**. La fin dépend de sa solidité (et de la manière dont il a été constitué).

## 7. Structure de la campagne

### Prologue — *Bruit de fond* (tutoriel intégré)
Premier jour à ECHO. Noor fait passer les exercices de base sur le **Banc** (le cyber range interne). Iris Calder ne vient pas au rendez-vous. Le soir, une alerte : son poste de travail a émis un beacon vers une IP inconnue.
- Concepts : terminal, système de fichiers, adresses IP, ping, ports, logs.

### Acte I — *Résonance*
L'hôpital régional de **Vallon-sur-Aire** subit un rançongiciel. ECHO intervient **aux côtés de la DSI**, sous convention.
- **01 Vallon** — cartographier ce que le CH expose (whois, DNS, audit de zone, scan autorisé) : un portail VPN non corrigé, un serveur oublié. Sable propose de sortir du périmètre.
- **02 Confinement** — le rançongiciel est maîtrisé, mais `fs-01` a été épargné. Le joueur y trouve un **chant** (programme qui contacte l'extérieur toutes les 5 min) et sa relance planifiée. Choix : couper / observer avec l'accord de la DSI / observer sans le dire.
- **03 Résonance** — l'empreinte du certificat du serveur distant a déjà été vue sur un serveur de **Corvane** ; mêmes serveurs de noms. Attribution au niveau de confiance *modéré*. Choix : ANCS, Lanterne, ou garder le dossier.
- Fil rouge : « 0 » écrit au joueur — *cherche novembre* (les Pannes de Novembre, Acte II).

Choix narratif assumé : l'Acte I enseigne la **réponse à incident** et le **recoupement d'indices** du point de vue du défenseur ; la reconstitution détaillée de l'intrusion reste hors champ.

### Acte II — *Interférences*
HOLLOW CHOIR riposte contre la cellule ; une source s'offre de l'intérieur de Corvane ; Iris réapparaît.
- **04 Hameçon** — un faux message « de Lanterne » (domaine sosie `lanterne-presse.example`, même registrar et mêmes serveurs de noms que le serveur de commande de Vallon). Le joueur l'analyse sans l'ouvrir (`mailcheck`, SPF/DKIM/DMARC), le compare à un vrai, retrouve dans le proxy le poste qui a soumis ses identifiants : celui de Théo. Choix : signaler / convaincre Théo de signaler / le couvrir.
- **05 Kestrel** — une source anonyme de Corvane Grid Services dépose des documents. Le joueur vérifie son récit par des sources ouvertes, ouvre les fichiers dans le sas isolé et lit leurs métadonnées : le planning de maintenance de novembre 2030 a été modifié par `i.calder` le 9 novembre, deux jours avant les Pannes. Choix : sources publiques seules / orienter l'enquête sans citer / tout exploiter.
- **06 Silence sur la ligne** — le webmail d'ECHO est visé (compte de Théo) depuis la plage du relais d'hameçonnage. Le joueur filtre au plus juste (`fw block 203.0.113.64/29`) sans couper le courrier légitime, vérifie, relie l'incident à la campagne. « 0 » se dévoile : *c'est moi, Iris. je n'étais pas leur victime.* Choix : transmettre à Mara / répondre seul·e / tracer le message.
- Révélation de l'acte : Iris était chez Corvane en novembre 2030, la main sur le planning, et dit avoir tenté d'empêcher les Pannes.

### Acte III — *Silence radio*
Nouvelle série de pannes programmée. Course contre la montre entre ECHO, CANTOR et l'ANCS.
- Missions : réponse à incident sur un réseau industriel simulé (SCADA pédagogique), corrélation multi-sources, attribution, rédaction du rapport final.
- Fins (selon Intégrité / Initiative / solidité du Dossier) :
  - **Lumière** — dossier recevable, procès, ECHO reconnue mais sous tutelle.
  - **Écho** — vérité publiée par Lanterne, Corvane tombe, ECHO dissoute.
  - **Silence** — le joueur rejoint Iris dans l'ombre. Fin ambiguë, assumée comme non souhaitable.
  - **Bruit** — dossier insuffisant : rien ne change. Fin « échec » rejouable.

### Contenus annexes
- **Contrats Lanterne** (side missions) : enquêtes courtes de vérification (fake leak, attribution douteuse).
- **Bounties du Banc** : défis techniques chronométrés, classement local puis en ligne.
- **Archives d'Iris** : fragments cachés dans les systèmes, débloquent le lore profond.

## 8. Lexique interne (UI & dialogues)

| Terme | Sens |
|---|---|
| **Trace** | Artefact laissé par une opération (log, fichier, bannière, en-tête). |
| **Écho** | Corrélation entre deux traces (même certificat, même horaire, même outil). |
| **Le Banc** | Cyber range d'entraînement d'ECHO (mode Académie / sandbox). |
| **Chant** | Beacon d'implant HOLLOW CHOIR. |
| **Dossier** | Graphe de preuves de la campagne. |
| **Exposition** | Bruit généré par l'opérateur, visible par l'adversaire. |
| **Op / Opération** | Mission. |
| **Fiche** | Entrée du journal d'apprentissage. |

## 9. Règles d'écriture

1. Chaque mission répond à « **pourquoi** cette technique fonctionne » — le briefing pose une question, le débrief y répond.
2. Les personnages ont des opinions techniques divergentes (Sable vs Noor) : c'est le principal vecteur de débat éthique.
3. Pas d'exposition gratuite : le lore se découvre dans les artefacts (e-mails, notes, commits, logs).
4. Toute technique « offensive » est abstraite au niveau conceptuel (ex. : « identifiants réutilisés trouvés dans un fichier de config ») — jamais de charge utile réelle.
5. Langue : français par défaut, i18n prévue (clés de traduction côté UI ; contenu de mission par locale).
