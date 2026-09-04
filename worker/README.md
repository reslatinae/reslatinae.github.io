# Proxy für den OpenAI-Schlüssel (Cloudflare Worker)

Ein kleines Programm, das bei Cloudflare läuft, den OpenAI-Schlüssel sicher verwahrt und die Anfragen der Website an OpenAI weiterreicht. Wer die Website benutzt, muss keinen Schlüssel eingeben; der Schlüssel steht weder in der Seite noch im Repository.

Was das Programm prüft, bevor es Geld kostet:

- Die Anfrage kommt von der eigenen Website (`ALLOWED_ORIGINS` in `wrangler.jsonc`).
- Höchstens 30 Anfragen pro Minute aus demselben Netzwerk und 120 pro Minute insgesamt (Cloudflares Zähler sind Näherungswerte; das monatliche Ausgabenlimit beim OpenAI-Projekt bleibt die eigentliche Sicherung).
- Nur die freigegebenen Modelle (`ALLOWED_MODELS`).

Die Antwort von OpenAI wird unverändert zurückgegeben, deshalb funktionieren die Fehlermeldungen der Website wie bisher.

## Einmalige Einrichtung (etwa 15 Minuten)

Voraussetzung: Node.js (LTS-Version) ist installiert.

1. Kostenloses Cloudflare-Konto anlegen: https://dash.cloudflare.com/sign-up. Am besten auf den Namen der Person, der der OpenAI-Schlüssel gehört.
2. Im Ordner `worker` dieses Repositories:

```
npm install
npx wrangler login
```

`wrangler login` öffnet den Browser; dort das Cloudflare-Konto bestätigen.

3. Veröffentlichen:

```
npx wrangler deploy
```

Am Ende steht die Adresse des Proxys, etwa `https://latin-syntax-proxy.<konto>.workers.dev`. Bis der Schlüssel hinterlegt ist, antwortet der Proxy mit dem Hinweis „not configured“.

4. Den OpenAI-Schlüssel als Geheimnis hinterlegen (wird verschlüsselt gespeichert und danach nirgends mehr angezeigt; der Proxy übernimmt ihn sofort):

```
npx wrangler secret put OPENAI_API_KEY
```

5. Die Adresse aus Schritt 3 in `index.html` bei `CONFIG.AI.PROXY_URL` eintragen und die Website veröffentlichen. Ab dann verschwinden der Schlüssel-Button und der Hinweis auf den Schlüssel von der Startseite.

## Später

- **Schlüssel wechseln:** Schritt 3 wiederholen. Nichts anderes ist nötig.
- **Website-Adresse ändern oder eine zweite erlauben:** `ALLOWED_ORIGINS` in `wrangler.jsonc` anpassen (nur Schema und Host, z. B. `https://reslatinae.github.io`), dann `npx wrangler deploy`.
- **Limits anpassen:** `ratelimits` in `wrangler.jsonc` (Cloudflare erlaubt nur Zeitfenster von 10 oder 60 Sekunden), dann `npx wrangler deploy`. Das monatliche Ausgabenlimit wird bei OpenAI eingestellt: platform.openai.com → Settings → Limits.
- **Was gerade passiert:** `npx wrangler tail` zeigt die Anfragen live; im Cloudflare-Dashboard unter Workers & Pages → latin-syntax-proxy → Logs.
- **Ausschalten:** im Cloudflare-Dashboard den Worker löschen oder in `index.html` `PROXY_URL` wieder leeren; dann gilt wieder der Schlüssel im Browser.

## Lokal ausprobieren (ohne Veröffentlichung)

Eine Datei `worker/.dev.vars` mit der Zeile `OPENAI_API_KEY=sk-...` anlegen (sie wird nicht ins Repository übernommen), dann:

```
npx wrangler dev
```

Der Proxy läuft dann unter `http://localhost:8787/`. Zum Testen `PROXY_URL` in einer lokalen Kopie von `index.html` darauf setzen.

## Kosten

Cloudflare Free: 100.000 Anfragen pro Tag; eine Analyse ist eine Anfrage. OpenAI rechnet wie bisher nach Tokens ab, deutlich unter einem Cent pro Übungstext.
