---
id: defense.hameconnage
title: Hameçonnage
category: defense
summary: "Un message qui se fait passer pour quelqu'un de confiance afin de pousser à cliquer, ouvrir ou répondre. On le reconnaît à l'urgence, à l'expéditeur imité et aux liens qui ne mènent pas où ils le disent."
related: [reseau.authentification-email, reconnaissance.domaine-sosie, defense.culture-signalement, defense.mfa, forensique.ioc]
quiz:
  - q: "Un message signé « Théo » arrive de `redaction@lanterne-presse.example`, mais les réponses partent vers `theo.urgent@boite-perso.example`. Que peux-tu en conclure ?"
    choices: ["Rien d'anormal : beaucoup de gens répondent depuis leur boîte perso", "C'est un signal fort : la personne qui écrit veut recevoir les réponses ailleurs que chez l'expéditeur affiché", "Que le serveur de messagerie de Théo est en panne"]
    answer: 1
    explain: "Un Reply-To vers un autre domaine, surtout une boîte personnelle, est un classique : l'expéditeur affiché n'est qu'un décor, la conversation est détournée."
  - q: "Le texte du lien affiche « lanterne.example/doc ». Est-ce suffisant pour lui faire confiance ?"
    choices: ["Oui, le domaine affiché est le bon", "Oui, si le message est poli et bien écrit", "Non : le texte affiché et la destination réelle sont deux choses différentes, seule la destination compte"]
    answer: 2
    explain: "Le texte d'un lien est libre. Survoler sans cliquer, ou analyser le message, révèle la vraie cible — ici `lanterne-presse.example`."
  - q: "Tu reçois un message suspect qui presse de relire un document « avant publication ». Quel est le meilleur réflexe ?"
    choices: ["Ne pas cliquer, signaler le message et vérifier auprès de la personne par un autre canal connu", "Cliquer pour vérifier si le document est vrai", "Le supprimer sans rien dire à personne"]
    answer: 0
    explain: "Le signalement permet d'analyser le message et de protéger les collègues qui l'ont peut-être reçu aussi. Le supprimer en silence fait perdre la piste."
---
## Définition
L'**hameçonnage** (*phishing*) exploite la **confiance** plutôt qu'une faille technique : un message imite une personne ou une organisation connue pour obtenir un clic, une pièce jointe ouverte, un mot de passe ou une réponse. Il fonctionne parce qu'il joue sur des réflexes humains : l'**urgence**, l'**autorité**, la **curiosité**, la peur de mal faire.

## Les signaux qui doivent alerter
- **Urgence artificielle** : « à relire avant publication », « dernière chance », « confidentiel ».
- **Expéditeur imité** : un nom affiché familier, mais une adresse sur un domaine **sosie**.
- **Réponse ailleurs** : un champ *Reply-To* qui pointe vers une autre boîte.
- **Liens trompeurs** : le texte affiché ne correspond pas à la destination réelle.
- **Authentification en échec** : SPF, DKIM ou DMARC ne valident pas le domaine affiché.

## Dans le jeu
```
$ mailcheck ~/signalements/message-0402.eml
ANALYSE · Corvane — document confidentiel à relire avant publication
Expéditeur affiché  Lanterne — Rédaction <redaction@lanterne-presse.example>
Domaine             lanterne-presse.example
Répondre à          theo.urgent@boite-perso.example
Retour technique    bounce@relais-envoi.example
Serveur d’origine   relais-envoi.example [203.0.113.66]

SPF   fail   le serveur d’envoi est-il autorisé par le domaine ?
DKIM  none   le message porte-t-il une signature valide du domaine ?
DMARC fail   le domaine affiché est-il cohérent avec SPF/DKIM ?

SIGNAUX
⚠ Les réponses partent vers theo.urgent@boite-perso.example, pas vers l’expéditeur affiché.
⚠ Adresse de retour technique (bounce@relais-envoi.example) d’un autre domaine.
⚠ DMARC fail : le domaine affiché n’a pas validé ce message.
⚠ Lien affiché « lanterne.example » qui mène en réalité à lanterne-presse.example.
```
›  `mailcheck` ne fait que **lire** le texte brut du message : rien n'est ouvert, rien n'est cliqué.

## Côté défense
- **Destinataire** : ne pas cliquer, ne pas répondre, **signaler** tout de suite — même après un clic.
- **Analyste** : examiner les en-têtes, extraire les indicateurs (domaine, IP d'origine, liens) et chercher qui d'autre a reçu le même message.
- **Organisation** : publier une politique DMARC stricte, surveiller les domaines sosies, protéger les comptes par **MFA** pour qu'un mot de passe volé ne suffise pas.

## Éthique
Les exercices de sensibilisation existent, mais ils se font **avec autorisation**, sans piéger ni humilier personne. Le but est d'apprendre à reconnaître, pas de compter les « coupables ».
