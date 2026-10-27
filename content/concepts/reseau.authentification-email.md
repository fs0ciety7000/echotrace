---
id: reseau.authentification-email
title: SPF, DKIM, DMARC
category: reseau
summary: "Trois mécanismes publiés dans le DNS qui permettent à un serveur de vérifier qu'un e-mail vient bien du domaine qu'il affiche. Leur verdict se lit dans l'en-tête Authentication-Results."
related: [defense.hameconnage, reseau.dns, reconnaissance.domaine-sosie]
quiz:
  - q: "Un message affiche `dmarc=fail`. Que peux-tu en conclure ?"
    choices: ["Que le message contient forcément un virus", "Que le domaine affiché dans « De : » n'a pas validé ce message — ni SPF ni DKIM ne sont alignés avec lui", "Que le destinataire a mal configuré sa boîte"]
    answer: 1
    explain: "DMARC vérifie la cohérence entre le domaine affiché et les résultats SPF/DKIM. Un échec veut dire : rien ne prouve que ce domaine a envoyé ce message."
  - q: "`lanterne.example` publie `p=reject`. Un faux message prétendant venir de `redaction@lanterne.example` arrive depuis un serveur non autorisé. Que se passe-t-il normalement ?"
    choices: ["Le serveur destinataire le rejette, comme le demande la politique du domaine", "Il arrive en boîte de réception avec un avertissement discret", "Il est transféré au propriétaire du domaine"]
    answer: 0
    explain: "C'est précisément pour ça qu'un imposteur utilise un domaine sosie : il ne peut pas usurper un domaine protégé par `p=reject`, alors il en enregistre un qui lui ressemble."
  - q: "Un message de `lanterne-presse.example` obtiendrait `spf=pass`. Est-il pour autant légitime ?"
    choices: ["Oui, SPF garantit l'identité de l'expéditeur", "Oui, si DKIM est aussi présent", "Pas forcément : SPF dit seulement que ce serveur est autorisé par CE domaine — et le domaine lui-même peut être un sosie"]
    answer: 2
    explain: "SPF, DKIM et DMARC authentifient un domaine, pas une intention. Un domaine sosie bien configuré passe les trois contrôles : il faut aussi regarder le nom du domaine."
---
## Définition
Le protocole de messagerie laisse n'importe qui écrire n'importe quoi dans le champ « De : ». Trois mécanismes, publiés par le propriétaire du domaine dans son **DNS**, permettent au serveur qui reçoit de vérifier :
- **SPF** : la liste des serveurs **autorisés à envoyer** pour le domaine. `v=spf1 mx -all` = « seuls mes serveurs MX, rien d'autre ».
- **DKIM** : une **signature** cryptographique ajoutée par le serveur d'envoi ; elle prouve que le message vient du domaine signataire et n'a pas été modifié.
- **DMARC** : vérifie que le domaine **affiché** est aligné avec SPF ou DKIM, et dit quoi faire en cas d'échec : `p=none` (observer), `p=quarantine` (mettre de côté), `p=reject` (refuser). `rua=` indique où envoyer les rapports.

Le serveur destinataire note ses verdicts dans l'en-tête **Authentication-Results** : `pass` (validé), `fail` (échec), `none` (rien à vérifier : pas de signature, pas d'enregistrement).

## Analogie
SPF, c'est la liste des livreurs autorisés à l'entrée ; DKIM, le sceau sur le colis ; DMARC, la consigne affichée à l'accueil : « si le sceau ou le livreur ne correspond pas, refusez le colis ».

## Dans le jeu
```
$ dns _dmarc.lanterne.example TXT
_dmarc.lanterne.example  →  v=DMARC1; p=reject; rua=mailto:dmarc@lanterne.example   TXT · texte libre (souvent SPF, vérifications)
$ dns lanterne.example TXT
lanterne.example  →  v=spf1 mx -all   TXT · texte libre (souvent SPF, vérifications)
```
›  La rédaction de Lanterne est bien protégée : un faux message à son vrai nom serait rejeté. D'où l'intérêt, pour l'imposteur, d'un domaine qui lui **ressemble**.

Dans le message reçu par ECHO, `mailcheck` relève `spf=fail`, `dkim=none`, `dmarc=fail` : aucun des trois contrôles ne valide l'expéditeur affiché.

## Côté défense
- Publier SPF et DKIM, puis DMARC en `p=none` pour observer, et monter vers `p=reject` une fois les envois légitimes recensés.
- Lire les **rapports DMARC** : ils révèlent qui tente d'envoyer au nom du domaine.
- Ne pas oublier que ces contrôles protègent **ton** domaine, pas contre les sosies : la vigilance humaine reste nécessaire.
