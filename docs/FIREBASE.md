# Firebase

## Projeto

- Project ID: `cuiaba-01617931-f126e`.
- Hosting target: `cuiabamt`.
- URL: `https://cuiabamt.web.app`.

## Hosting

`firebase.json` publica `public/` e usa `Cache-Control: no-store` em HTML/JS/CSS/JSON.

Deploy:

```powershell
firebase deploy --only hosting:cuiabamt --project cuiaba-01617931-f126e
```

## Firestore

Banco principal. Regras em `firestore.rules`.

```powershell
firebase deploy --only firestore:rules --project cuiaba-01617931-f126e
```

## Authentication

Login por e-mail/senha. Perfil e permissoes ficam em `usuarios_auth/{uid}`.

## Cloud Functions

Nao utilizar por decisao de custo, salvo nova autorizacao explicita.
