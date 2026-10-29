# LinkedIn Auto-Publisher (kostenlos)

Kostenloser Assistent, der Beiträge (Text + Bild) automatisch auf die LinkedIn-Unternehmensseite veröffentlicht.
Läuft über **GitHub Actions** (kostenlos, dauerhaft online, kein Server nötig).

## Einrichtung

### 1. LinkedIn App erstellen
1. https://www.linkedin.com/developers/apps → "Create app"
2. Products → "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" anfordern
3. Scopes: `w_organization_social`, `r_organization_social`
4. OAuth Redirect: `http://localhost:3000/callback`
5. Access Token generieren (mit Org-Admin-Rechten) → als Secret `LINKEDIN_ACCESS_TOKEN` speichern
6. Organization URN: `urn:li:organization:140754014` (bereits gesetzt)

### 2. GitHub Repo anlegen
- Neues Repo erstellen, diese Dateien pushen
- Settings → Secrets and variables → Actions → hinzufügen:
  - `LINKEDIN_ACCESS_TOKEN`
  - `LINKEDIN_ORG_ID` = `140754014`
  - `POST_TEXT` = der zu veröffentlichende Text
  - (optional) `POST_IMAGE_PATH` = Pfad zum Bild im Repo

### 3. TrySoro anbinden
TrySoro kann Webhooks/Export liefern. Zwei Optionen:
- **Manuell:** Text aus TrySoro kopieren → als Secret `POST_TEXT` setzen → "Run workflow"
- **Automatisch:** TrySoro-Webhook → GitHub Repository Dispatch (erfordert kleinen Webhook-Receiver, z. B. auf IONOS oder via Zapier/Make kostenlos)

### 4. Zeitplan anpassen
In `.github/workflows/publish.yml` den `cron` ändern (z. B. `0 9,15 * * *` für 2x täglich).

## Lokaler Test
```
LINKEDIN_ACCESS_TOKEN=xxx node publish.js --text "Test" --image ./bild.png
```

## Hinweis
Der LinkedIn Access Token läuft nach 60 Tagen ab. Erneuern über die LinkedIn Developer Console oder OAuth-Refresh-Flow (in `publish.js` ergänzbar).