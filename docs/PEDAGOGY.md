# PÉDAGOGIE — comment Echo Trace enseigne

## Principes
1. **Comprendre pourquoi, pas mémoriser quoi.** Chaque opération pose une *question* (« Comment sait-on ce qui tourne sur une machine sans y avoir accès ? ») ; les objectifs y mènent ; le débrief y répond explicitement.
2. **Apprendre en faisant, expliquer juste après.** Le terminal produit de vraies formes de sorties (format nmap, ping, auth.log). Les concepts y sont **soulignés en violet** : un clic ouvre la fiche, sans quitter l'action.
3. **Toujours les deux côtés.** Toute technique d'observation ou d'accès est accompagnée de ce que voit et fait le **défenseur** (logs, surface d'attaque, durcissement) et de son cadre **éthique et légal** (autorisation, périmètre).
4. **L'échec enseigne.** `ping` sans réponse → fiche ICMP/pare-feu ; mot de passe refusé → la ligne « Failed password » qu'on vient de laisser. Les erreurs du terminal donnent toujours une piste.
5. **Pas de cours magistral.** Le savoir est dans les artefacts : notes de collègues, LISEZMOI, journaux, pages `man`.

## Journal d'apprentissage
Chaque concept a une fiche (`content/concepts`). La maîtrise est mesurable et explicable au joueur :

| Niveau | Condition | Affichage |
|---|---|---|
| 0 | Jamais rencontrée | — |
| 1 — rencontrée | Commande utilisée, objectif accompli ou concept vu en jeu | ●○○ |
| 2 — étudiée | Fiche ouverte (clic) ou `learn <id>` | ●●○ |
| 3 — validée | Quiz de la fiche réussi **sans faute** (choix mélangés à chaque essai, explication après chaque réponse) | ●●● |

Le journal **survit aux nouvelles parties** : la connaissance appartient au joueur, pas à la sauvegarde.

## Mesures de progression (actuelles et prévues)
- Fiches par niveau de maîtrise et par catégorie (`journal`).
- Par opération : temps simulé, exposition (bruit généré), indices demandés, objectifs bonus.
- Quiz par fiche (maîtrise 3) et maîtrise globale en % dans le journal.
- Prévu : modules d'académie (Le Banc) avec parcours, export du journal.

## Échelle de guidage
1. Briefing (contexte + question), notes dans le monde.
2. `objectives` : ce qu'il faut accomplir, jamais comment.
3. `hint` : Noor oriente (enregistré dans les statistiques, sans pénalité).
4. `man <commande>` : la référence.
Dans le Prologue, les indices donnent la commande ; ensuite, ils orientent seulement.

## Garde-fous éthiques
- Aucun contenu directement réutilisable contre un système réel (adresses fictives, exploitation abstraite).
- Les approches « grises » existent dans le récit (jauges Intégrité / Initiative, Phase 2) et ont des conséquences visibles.
- Les fiches citent le cadre légal (ex. art. 323-1 du Code pénal) sans jargon juridique.
