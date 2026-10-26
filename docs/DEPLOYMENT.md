# DEPLOYMENT — Coolify + Cloudflare

Cible : **https://echo.fs0ciety.org**, servi par l'instance Coolify **coolify.fs0ciety.org**.

## 1. Ce qui est déployé
Une image Docker unique (`Dockerfile` à la racine) :
1. Étape `build` (Node 22 + pnpm via corepack) : install, validation du contenu, build de `apps/web` → `apps/web/dist`.
2. Étape `runtime` (Caddy 2 alpine) : sert les fichiers statiques sur le port **8080**, fallback SPA, cache long sur `/assets/*`, en-têtes de sécurité (CSP stricte), endpoint `/healthz`.

Aucune variable d'environnement n'est requise en phase 0–3. Aucun volume.

## 1 bis. Configuration en place (2026-10-26)
| Élément | Valeur |
|---|---|
| Projet Coolify | **Echo Trace** (`j1flbohmxcfaavvzaivjiphj`), environnement `production` |
| Application | **echotrace-web** (`lkgfnldrcs6rjjoqfjyfig3o`) sur le serveur `localhost` (152.53.176.13) |
| Source | GitHub App privée de l'instance, dépôt `fs0ciety7000/echotrace`, branche **`ccr-f172661a-vgslu8`** (à basculer sur `main` une fois la branche fusionnée) |
| Build | Dockerfile `/Dockerfile`, port exposé `8080`, healthcheck `/healthz` |
| Auto-deploy | activé (push sur la branche → redéploiement) ; HTTPS forcé |
| DNS Cloudflare | `CNAME echo → fs0ciety.org`, proxifié (même convention que les autres sous-domaines), SSL **Full (strict)** sur la zone |

Pilotage par API (depuis l'environnement cloud : variables `COOLIFY_API_URL`, `COOLIFY_API_TOKEN`, `CLOUDFLARE_API_TOKEN`) :
```bash
# redéployer
curl -X POST -H "Authorization: Bearer $COOLIFY_API_TOKEN" -H "Content-Type: application/json" \
  "$COOLIFY_API_URL/api/v1/deploy" -d '{"uuid":"lkgfnldrcs6rjjoqfjyfig3o"}'
# changer de branche (après fusion dans main)
curl -X PATCH -H "Authorization: Bearer $COOLIFY_API_TOKEN" -H "Content-Type: application/json" \
  "$COOLIFY_API_URL/api/v1/applications/lkgfnldrcs6rjjoqfjyfig3o" -d '{"git_branch":"main"}'
```

## 2. Configuration Coolify

1. **Projects → + New → Resource → Public/Private Repository (GitHub App)**, dépôt `fs0ciety7000/echotrace`, branche `main`.
2. **Build Pack** : `Dockerfile` (emplacement `/Dockerfile`, base directory `/`).
3. **Ports Exposes** : `8080`.
4. **Domains** : `https://echo.fs0ciety.org` (Coolify configure Traefik et le certificat Let's Encrypt).
5. **Healthcheck** : déjà défini dans l'image (`HEALTHCHECK` → `/healthz`). Dans Coolify : path `/healthz`, port `8080`.
6. **Auto deploy** : activé sur push vers `main` (webhook GitHub App).
7. Optionnel : *Preview deployments* pour les PR → `pr-<n>.echo.fs0ciety.org` (nécessite un DNS wildcard, voir 3.3).

## 3. Cloudflare (DNS de fs0ciety.org)

### 3.1 Enregistrement DNS
| Type | Nom | Contenu | Proxy |
|---|---|---|---|
| `A` | `echo` | IP publique du serveur Coolify | Proxied (orange) |
(ou `CNAME echo → coolify.fs0ciety.org` si ce dernier pointe déjà vers le serveur)

### 3.2 SSL/TLS
- Mode **Full (strict)** : Cloudflare ↔ Traefik en HTTPS avec certificat valide.
- Problème fréquent : Let's Encrypt (HTTP-01) échoue derrière le proxy si une règle force/bloque `/.well-known/acme-challenge/`. Solutions :
  - laisser *Always Use HTTPS* activé (Cloudflare n'intercepte pas le challenge en Full strict) **ou**
  - passer temporairement le nuage en gris (DNS only) le temps de la première émission **ou**
  - utiliser un **certificat Origin Cloudflare** dans Coolify (Servers → Proxy → certificats) si l'on veut ne jamais exposer le port 80.
- *Edge Certificates* : HSTS activable une fois le domaine stable.

### 3.3 Optionnel
- Wildcard `*.echo` (CNAME) pour les preview deployments.
- Règle de cache : Cloudflare respecte les `Cache-Control` envoyés par Caddy (`immutable` sur `/assets/*`, `no-cache` sur `index.html` et `sw.js`). Ne pas activer « Cache Everything » sur `/`.
- *Rocket Loader* : **désactivé** (casse les modules ES et la CSP).
- *Auto Minify* : inutile (déjà minifié).

## 4. Déployer en local (vérification)

```bash
docker build -t echotrace .
docker run --rm -p 8080:8080 echotrace
# → http://localhost:8080  et  http://localhost:8080/healthz
```

## 5. PWA & mises à jour
Le service worker (Workbox, `registerType: autoUpdate`) précache tout le jeu. `sw.js`, `registerSW.js`, `manifest.webmanifest` et `index.html` sont servis en `no-cache` : un nouveau déploiement est récupéré au prochain chargement, puis activé automatiquement. Ne jamais mettre ces fichiers en cache côté Cloudflare.

## 6. Rollback
Coolify conserve les images précédentes : *Deployments → choisir un déploiement → Redeploy*. Le jeu étant 100 % client avec sauvegardes versionnées (`saveVersion`), un rollback ne corrompt pas les sauvegardes (les migrations sont ascendantes ; une sauvegarde plus récente que le client est ignorée avec un avertissement).

## 7. Phase 4 (backend)
Ajout prévu d'un service `apps/server` (Hono + SQLite) : deuxième ressource Coolify, volume persistant `/data`, domaine `api.echo.fs0ciety.org` ou chemin `/api` routé par Caddy. Ce document sera mis à jour à ce moment.
