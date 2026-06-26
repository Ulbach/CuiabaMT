# Arquitetura

```text
Navegador
  -> Firebase Hosting
  -> public/*.html, public/css, public/js
  -> Firebase Authentication
  -> Cloud Firestore
  -> Relatorios / cadastros / operacao
```

## Frontend

O app publicado e composto por paginas HTML independentes na pasta `public/`. A maior parte do JavaScript fica embutida nas proprias paginas, com apoio de alguns arquivos em `public/js/`.

## Firebase

As telas importam Firebase via CDN `https://www.gstatic.com/firebasejs/10.12.2/`. O projeto usado e `cuiaba-01617931-f126e`.

## Autenticacao

Login por Firebase Auth. A autorizacao vem do documento `usuarios_auth/{uid}`, lido pelas regras Firestore. A sessao local usa `delta_auth_firebase_v1` e mantem compatibilidade com `delta_auth_v1`.

## Firestore

Firestore armazena cadastros, movimentacoes, visitantes, perfis, auditoria e logs. As regras ficam em `firestore.rules`.

## Hosting

`firebase.json` publica `public/` no target `cuiabamt` e usa headers `no-store` para reduzir cache em aparelhos.
