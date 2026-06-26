# API

O app atual nao possui backend proprio em producao. As paginas acessam diretamente:

- Firebase Authentication.
- Cloud Firestore.
- Firebase Hosting.

## Legado

`src/Code.gs` contem funcoes de Google Apps Script e REST Firestore do modelo anterior. Uso atual: A confirmar.

## Contrato Pratico

As telas esperam:

- usuario autenticado no Firebase Auth;
- documento ativo em `usuarios_auth/{uid}`;
- colecoes e campos descritos em `COLLECTIONS.md`.
