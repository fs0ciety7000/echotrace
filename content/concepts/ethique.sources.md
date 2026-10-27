---
id: ethique.sources
title: Sources & documents obtenus illégalement
category: ethique
summary: "Quand une source interne transmet des documents, il faut à la fois la protéger, vérifier ce qu'elle apporte et peser l'intérêt public face aux règles. Ces exigences se contredisent parfois : il faut le dire."
related: [forensique.metadonnees, reconnaissance.osint, ethique.attribution, ethique.autorisation, ethique.proportionnalite]
quiz:
  - q: "Kestrel envoie des documents internes de Corvane. Quelle est la première chose à faire avant de s'en servir ?"
    choices: ["Les publier tels quels pour ne pas perdre de temps", "Vérifier leur authenticité et s'assurer qu'ils ne permettent pas d'identifier la source", "Les transmettre à Corvane pour avoir sa réaction"]
    answer: 1
    explain: "Un faux document peut ruiner une enquête et une réputation ; un document mal nettoyé peut exposer la source. Vérifier et protéger passent avant publier."
  - q: "Que signifie la formule « une preuve obtenue illégalement est une preuve perdue » ?"
    choices: ["Que des éléments obtenus en violant la loi peuvent être écartés par un tribunal et discréditer toute l'enquête", "Que les documents fuités sont toujours faux", "Qu'un·e journaliste n'a jamais le droit d'utiliser un document confidentiel"]
    answer: 0
    explain: "Si ECHO entrait elle-même dans les systèmes de Corvane, ses trouvailles seraient contestables et l'équipe exposée. Recevoir un document d'une source n'est pas la même chose que le voler — mais la frontière se discute."
  - q: "Un document fuité contient, au milieu d'informations d'intérêt public, les coordonnées personnelles de dizaines d'employé·e·s. Que faire ?"
    choices: ["Tout publier : la transparence avant tout", "Renoncer entièrement au document", "Ne publier que ce qui sert l'intérêt public, et retirer ce qui expose des personnes sans raison"]
    answer: 2
    explain: "L'intérêt public justifie de révéler un fait, pas d'exposer tout le monde au passage. On minimise ce qu'on publie."
---
## Définition
Un·e **lanceur·se d'alerte** ou une **source** interne peut transmettre des documents qu'elle n'avait pas le droit de sortir. Celles et ceux qui les reçoivent font face à plusieurs exigences à la fois :
- **Protéger la source** : ne jamais la désigner, même indirectement (métadonnées, détails trop précis, canal de contact).
- **Vérifier** : un document peut être faux, partiel, sorti de son contexte — ou fabriqué pour manipuler.
- **Peser l'intérêt public** : la révélation sert-elle le public (sécurité, santé, abus) ou seulement la curiosité ?
- **Penser à la suite** : ces documents pourront-ils être utilisés devant une autorité ou un tribunal ?

## Les tensions, honnêtement
- La source prend un risque réel ; la protéger peut empêcher de prouver l'authenticité.
- Un document obtenu illégalement peut révéler un fait grave et vrai. Le taire protège parfois les responsables.
- « **Une preuve obtenue illégalement est une preuve perdue** » : ce que l'on obtient en franchissant soi-même la loi peut être écarté et décrédibiliser tout le travail. Les règles varient selon les pays et les procédures, et le droit protège parfois les lanceur·se·s d'alerte — mais jamais celui ou celle qui va se servir directement.
- Publier vite fait du bruit ; vérifier prend du temps. La précipitation sert rarement la vérité.

## Dans le jeu
Kestrel envoie `planning-novembre.odt`. `meta` le rattache à Corvane, mais ECHO ne conclut pas : on recoupe avec des sources ouvertes, on vérifie la cohérence des dates, et on veille à ce que rien de publié ne remonte à Kestrel. ECHO **reçoit** ; ECHO ne va pas **chercher** dans les systèmes de Corvane.

## Pour aller plus loin
- Distinguer **recevoir** un document (journalisme, signalement) et **obtenir** soi-même un accès non autorisé (intrusion, toujours exclue).
- Garder une trace de **comment** chaque document est arrivé : c'est ce qui permettra d'en défendre l'usage.
- Quand c'est possible, confronter les personnes mises en cause avant publication : c'est aussi une forme de vérification.
