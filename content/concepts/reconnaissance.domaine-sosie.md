---
id: reconnaissance.domaine-sosie
title: Domaine sosie
category: reconnaissance
summary: "Un domaine choisi pour ressembler à un nom de confiance (lettre ajoutée, tiret, mot en plus) afin de tromper un regard rapide. Sa date de création est souvent un indice précieux."
related: [reconnaissance.whois, defense.hameconnage, reseau.authentification-email, reseau.dns, reconnaissance.pivot]
quiz:
  - q: "Le vrai domaine du journal est `lanterne.example`. Que penser de `lanterne-presse.example` ?"
    choices: ["Que c'est sûrement un sous-domaine officiel de `lanterne.example`", "Que c'est un domaine distinct, enregistré par n'importe qui : il faut vérifier à qui il appartient", "Que les deux pointent forcément vers le même serveur"]
    answer: 1
    explain: "`lanterne-presse.example` n'est pas un sous-domaine (ce serait `presse.lanterne.example`) : c'est un autre domaine, qui n'a de commun que la ressemblance."
  - q: "Le whois montre que le domaine a été créé le 2031-03-30, trois jours avant le message suspect. Pourquoi est-ce un signal ?"
    choices: ["Parce qu'un domaine très récent, apparu juste avant une campagne, a souvent été créé pour elle", "Parce que les domaines récents sont toujours malveillants", "Parce qu'un domaine doit avoir au moins un an pour envoyer des e-mails"]
    answer: 0
    explain: "Un indice, pas une preuve : une organisation légitime crée aussi des domaines. Mais une naissance juste avant l'attaque, combinée aux autres signaux, renforce fortement l'hypothèse."
  - q: "Comment une organisation peut-elle se défendre contre les domaines sosies ?"
    choices: ["En interdisant l'enregistrement de domaines similaires sur Internet", "Ce n'est pas possible, il faut attendre les signalements", "En surveillant les nouveaux enregistrements proches de son nom, en enregistrant les variantes évidentes et en formant ses équipes"]
    answer: 2
    explain: "On ne contrôle pas ce que d'autres enregistrent, mais on peut détecter tôt, protéger les variantes courantes et demander la suspension d'un domaine abusif via son contact abus."
---
## Définition
Un **domaine sosie** imite un nom de confiance pour tromper un coup d'œil rapide. Les variantes courantes :
- **mot ajouté** : `lanterne-presse.example` au lieu de `lanterne.example` ;
- **faute de frappe** (*typosquatting*) : lettre doublée, inversée ou oubliée ;
- **caractère semblable** : `l` et `1`, `rn` et `m` ;
- **autre extension** : même nom, TLD différent.

Il a un avantage décisif pour l'imposteur : comme il **possède** ce domaine, il peut le configurer pour que SPF, DKIM et DMARC passent. L'authentification ne voit rien d'anormal ; seul le **nom** trahit l'imitation.

## Dans le jeu
```
$ whois lanterne-presse.example
LANTERNE-PRESSE.EXAMPLE
Registrar         Nordhavn Domains ApS
Titulaire         REDACTED FOR PRIVACY
Créé le           2031-03-30
Expire le         2032-03-30
Serveurs de noms  ns1.dns-relais.example, ns2.dns-relais.example
Contact abus      abuse@nordhavn-domains.example

› Les serveurs de noms et le registrar sont des indices qu’on peut recouper d’un domaine à l’autre. Whois
```
›  Créé trois jours avant le message du 2031-04-02 : le domaine semble taillé pour l'occasion. Les serveurs de noms `dns-relais.example` sont une piste de **pivot**.

## Côté défense
- **Surveiller** les nouveaux enregistrements qui contiennent ton nom ou en sont proches.
- **Enregistrer** les variantes les plus évidentes de ton propre domaine.
- **Signaler** un domaine abusif au contact abus du registrar, preuves à l'appui.
- **Former** : apprendre à lire le domaine en entier, de droite à gauche, avant le premier point.

## Éthique
Une ressemblance n'est pas une culpabilité : des domaines proches existent parfois de bonne foi. On rassemble plusieurs indices avant d'accuser.
