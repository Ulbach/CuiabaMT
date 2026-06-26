# Deploy

## Caminho Correto

```text
C:\Users\fabricio.ulbach\OneDrive - DELTA ENERGIA\Documentos\GitHub\CuiabaMT
```

## Validar

```powershell
npm run build
node scripts/verify-security-rules.mjs
node scripts/verify-no-legacy-password-field.mjs
```

## Publicar Frontend

```powershell
firebase deploy --only hosting:cuiabamt --project cuiaba-01617931-f126e
```

## Publicar Regras

Somente se `firestore.rules` foi alterado:

```powershell
firebase deploy --only firestore:rules --project cuiaba-01617931-f126e
```

## Cache

Para forcar volta ao login em aparelho com tela antiga:

```text
https://cuiabamt.web.app/index.html?logout=1
```
