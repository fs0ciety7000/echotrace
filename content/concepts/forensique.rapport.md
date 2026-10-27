---
id: forensique.rapport
title: Rédiger un rapport d'incident
category: forensique
summary: "Un rapport d'incident sert à décider. Il sépare faits, analyses et hypothèses, donne un niveau de confiance à chaque conclusion et se termine par des recommandations que le ou la lecteur·rice peut appliquer."
related: [forensique.chronologie, forensique.ioc, forensique.correlation, ethique.attribution, ethique.divulgation, defense.continuite]
quiz:
  - q: "Laquelle de ces phrases est un **fait**, et non une analyse ou une hypothèse ?"
    choices: ["« Le prestataire est probablement à l'origine de l'intrusion. »", "« L'adversaire visait sans doute la supervision. »", "« Le processus /var/tmp/.cache/sysupd tourne sur ews-02 et joint 203.0.113.200:8443 via la passerelle. »"]
    answer: 2
    explain: "Un fait est observé et vérifiable par quelqu'un d'autre. Les deux autres phrases interprètent : elles ont leur place, mais dans une autre section et avec un niveau de confiance."
  - q: "Pourquoi indiquer un niveau de confiance (faible, modéré, élevé) pour chaque conclusion ?"
    choices: ["Pour que le ou la lecteur·rice sache sur quoi il ou elle peut agir tout de suite et ce qui reste à confirmer", "Pour se couvrir en cas d'erreur", "Parce qu'un rapport sans pourcentage n'est pas sérieux"]
    answer: 0
    explain: "Une décision lourde (couper un accès, isoler un réseau) se prend différemment selon que la conclusion est établie ou seulement plausible."
  - q: "Pour qui écris-tu la section « Recommandations » ?"
    choices: ["Pour les autres analystes, avec un maximum de détails techniques", "Pour la personne qui va agir (exploitant, direction) : des actions claires, priorisées, avec qui décide quoi", "Pour la presse"]
    answer: 1
    explain: "Un bon rapport est écrit pour son lecteur ou sa lectrice. Les détails techniques vont en annexe ; les recommandations disent quoi faire, dans quel ordre et pourquoi."
---
## Définition
Le **rapport d'incident** transforme une enquête en **décisions**. Il n'est pas un journal de bord de l'analyste : il est écrit pour la personne qui devra agir, souvent sans le temps ni le bagage pour tout relire.

## Structure type
1. **Résumé** : en cinq lignes, ce qui s'est passé, ce qui est menacé, ce qu'il faut décider.
2. **Chronologie** : les événements datés, avec leur source.
3. **Faits** : ce qui a été observé et peut être vérifié.
4. **Analyse** : ce que ces faits signifient, avec un **niveau de confiance** (faible, modéré, élevé).
5. **Hypothèses** : ce qui reste possible mais non établi, et ce qui permettrait de trancher.
6. **Indicateurs** : la liste à rechercher ou bloquer (IP, domaines, fichiers, certificats).
7. **Recommandations** : actions priorisées, et qui en décide.

## Dans le jeu
Un extrait possible pour Réseau Électrique du Val :
- **Fait** : `ews-02` (10.60.0.12) exécute `/var/tmp/.cache/sysupd -i 300` et joint `203.0.113.200:8443` en passant par la passerelle.
- **Analyse** (confiance élevée) : mêmes indicateurs et même comportement qu'à l'Acte I.
- **Hypothèse** (confiance faible) : l'adversaire visait la supervision ; rien ne le prouve encore.
- **Recommandation** : avec l'accord de REV, sur la passerelle, `fw block 203.0.113.200` ; l'accès du prestataire relève de la décision de REV.

Dans ECHO, `report` te demande de soumettre chaque conclusion : elle doit **découler des preuves**.

## Côté défense
- Dater chaque élément et citer sa **source** (quel journal, quelle machine).
- Écrire ce qui **réfuterait** une hypothèse : c'est ce qui la rend utile.
- Garder les détails techniques en **annexe** ; le corps du rapport reste lisible.

## Éthique
Ne jamais **surévaluer l'attribution** : « infrastructure commune » n'est pas « même responsable ». Un rapport circule, se cite et se transmet : une phrase trop affirmative peut nuire à un tiers innocent.
